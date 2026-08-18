const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const { analyzeJobDescription, tailorResume, parseAndScoreResume } = require('../services/aiService');

// @desc    Upload base resume (PDF/DOCX) and parse to JSON text
// @route   POST /api/resumes/upload
// @access  Public
const uploadBaseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    let extractedText = '';

    if (req.file.mimetype === 'application/pdf') {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        if (pdfParse && typeof pdfParse.PDFParse === 'function') {
          const instance = new pdfParse.PDFParse({ data: dataBuffer });
          const parsedData = await instance.getText();
          extractedText = parsedData.text || '';
        } else if (typeof pdfParse === 'function') {
          const data = await pdfParse(dataBuffer);
          extractedText = data.text || '';
        }
      } catch (e) {
        console.error("PDF Parsing failed:", e.message);
        extractedText = "PDF Extraction error: " + e.message;
      }
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        extractedText = result.value;
      } catch (e) {
        extractedText = "Mocked DOCX extracted text (parsing failed)";
      }
    } else {
      return res.status(400).json({ message: 'Unsupported file type. Use PDF or DOCX.' });
    }

    // Call Claude to parse and score the general resume!
    const structuredContent = await parseAndScoreResume(extractedText);

    const resume = await Resume.create({
      userId: req.user._id,
      type: 'base',
      fileUrl: filePath,
      structuredContent
    });

    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Analyze JD against base resume
// @route   POST /api/resumes/analyze-jd
// @access  Private
const analyzeJD = async (req, res) => {
  try {
    const { applicationId, jdText } = req.body;
    
    // Find base resume
    const baseResume = await Resume.findOne({ type: 'base', userId: req.user._id }).sort({ createdAt: -1 });
    const baseResumeContent = baseResume ? JSON.stringify(baseResume.structuredContent) : JSON.stringify({
      skills: ["React.js", "Node.js", "Express.js", "MongoDB", "JavaScript", "TypeScript", "C++", "Python", "SQL", "Tailwind CSS", "REST APIs"],
      summary: "Full Stack Software Engineer proficient in React, Node.js, Express, MongoDB, and modern web architectures."
    });

    const application = await Application.findById(applicationId);
    if (!application || application.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    const analysis = await analyzeJobDescription(baseResumeContent, jdText);
    
    // Update application with analysis results
    application.jobDescription = jdText;
    application.matchScore = analysis.matchScore;
    application.extractedSkills = analysis.extractedSkills;
    application.missingSkills = analysis.missingSkills;
    await application.save();

    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate a tailored resume for an application
// @route   POST /api/resumes/tailor/:applicationId
// @access  Private
const generateTailoredResume = async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await Application.findById(applicationId);
    if (!application || application.userId.toString() !== req.user._id.toString() || !application.jobDescription) {
      return res.status(400).json({ message: 'Application or JD not found/unauthorized' });
    }

    const baseResume = await Resume.findOne({ type: 'base', userId: req.user._id }).sort({ createdAt: -1 });
    const baseContent = baseResume ? baseResume.structuredContent : {
      summary: "Full Stack Developer experienced in building scalable applications with React, Node.js, and modern software design patterns.",
      skills: ["React.js", "Node.js", "TypeScript", "Express.js", "MongoDB", "REST APIs", "C++", "Python", "SQL"]
    };

    const tailoredJson = await tailorResume(baseContent, application.jobDescription);
    
    const tailoredResume = await Resume.create({
      userId: req.user._id,
      type: 'tailored',
      applicationId: application._id,
      structuredContent: tailoredJson
    });

    application.tailoredResumeId = tailoredResume._id;
    await application.save();

    res.status(201).json(tailoredResume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadBaseResume,
  analyzeJD,
  generateTailoredResume
};
