import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { uploadResume } from '../services/api';

const Resumes = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.docx'))) {
      setFile(droppedFile);
      setSuccess(false);
      setParsedData(null);
    }
  };

  const handleSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSuccess(false);
      setParsedData(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      const response = await uploadResume(formData);
      setParsedData(response.structuredContent);
      setSuccess(true);
      setFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-white mb-2">Resume Hub</h1>
        <p className="text-gray-400 text-sm">Upload your base resume here. The AI will use it to tailor applications.</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="w-full max-w-2xl min-h-[320px] h-auto glass rounded-3xl border-2 border-dashed border-white/20 hover:border-primary transition-all flex flex-col items-center justify-center p-8 text-center group cursor-pointer"
          onClick={() => !file && !success && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleSelect} 
            accept=".pdf,.docx" 
            className="hidden" 
          />
          
          {success ? (
            <div className="flex flex-col items-center w-full">
              <div className="flex items-center text-green-400 mb-6">
                <CheckCircle2 size={32} className="mr-3" />
                <h2 className="text-2xl font-bold text-white">Upload & Parse Successful!</h2>
              </div>
              
              {parsedData && (
                <div className="w-full text-left bg-black/20 p-6 rounded-2xl border border-white/5 mb-6 max-h-[450px] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-primary-cyan">General ATS Impact Score</h3>
                      <p className="text-gray-400 text-sm mt-1">Based on resume formatting and best practices</p>
                    </div>
                    {parsedData.overallScore && (
                      <div className="w-16 h-16 rounded-full bg-black/40 border-4 border-primary flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{parsedData.overallScore}</span>
                      </div>
                    )}
                  </div>

                  {parsedData.suggestions && parsedData.suggestions.length > 0 && (
                    <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                      <h4 className="text-sm font-semibold text-primary mb-2">AI Corrections & Suggestions</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {parsedData.suggestions.map((sug, i) => (
                          <li key={i} className="text-sm text-gray-300">{sug}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-400 text-sm">Resume Summary (Raw Text)</span>
                      <p className="text-sm text-gray-200 mt-1 whitespace-pre-wrap leading-relaxed">{parsedData.summary}</p>
                    </div>
                    {parsedData.skills && parsedData.skills.length > 0 && (
                      <div>
                        <span className="text-gray-400 text-sm">Extracted Skills</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {parsedData.skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-primary/10 text-primary-cyan text-xs font-medium rounded-lg border border-primary/20">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button 
                onClick={(e) => { e.stopPropagation(); setSuccess(false); setParsedData(null); }}
                className="text-sm text-gray-400 hover:text-white transition-colors underline underline-offset-4"
              >
                Upload a different base resume
              </button>
            </div>
          ) : file ? (
            <div className="flex flex-col items-center">
              <FileText size={64} className="text-primary-cyan mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">{file.name}</h2>
              <p className="text-gray-400 text-sm mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <div className="flex gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                  disabled={uploading}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-primary to-primary-cyan text-white font-medium hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50"
                >
                  {uploading ? 'Parsing...' : 'Upload & Parse'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UploadCloud size={32} className="text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Drag & Drop Resume</h2>
              <p className="text-gray-400 mb-6">Supports PDF and DOCX files up to 5MB</p>
              <div className="px-6 py-2 rounded-full bg-white/10 text-white font-medium group-hover:bg-white/20 transition-all">
                Browse Files
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resumes;
