const Application = require('../models/Application');

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an application
// @route   POST /api/applications
// @access  Private
const createApplication = async (req, res) => {
  try {
    const { company, role, platform, status } = req.body;
    
    if (!company || !role) {
      return res.status(400).json({ message: 'Company and role are required' });
    }

    const application = await Application.create({
      userId: req.user._id,
      company,
      role,
      platform,
      status: status || 'Applied',
      timeline: [{ stage: status || 'Applied', date: new Date(), notes: 'Application created' }]
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update application (specifically status for drag & drop)
// @route   PUT /api/applications/:id
// @access  Private
const updateApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // If status changed, add to timeline
    if (req.body.status && req.body.status !== application.status) {
      application.timeline.push({
        stage: req.body.status,
        date: new Date(),
        notes: `Moved to ${req.body.status}`
      });
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        timeline: application.timeline 
      },
      { new: true }
    );

    res.status(200).json(updatedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await application.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication
};
