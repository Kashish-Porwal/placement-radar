import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Briefcase, Globe, Calendar } from 'lucide-react';
import { createApplication } from '../services/api';

const platforms = ['LinkedIn', 'Naukri', 'Internshala', 'Wellfound', 'Cutshort', 'Indeed', 'Other'];

const NewAppModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({ company: '', role: '', platform: 'LinkedIn', interviewDate: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.role) return;
    
    setLoading(true);
    try {
      const newApp = await createApplication(formData);
      onAdd(newApp);
      setFormData({ company: '', role: '', platform: 'LinkedIn', interviewDate: '' });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md glass rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.15)] bg-[#0f1523]"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-heading font-bold">New Application</h2>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                  <Building2 size={16} className="text-primary" /> Company Name
                </label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Google"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                  <Briefcase size={16} className="text-primary-light" /> Role
                </label>
                <input 
                  required
                  type="text" 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Frontend Engineer"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-light focus:ring-1 focus:ring-primary-light transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                  <Globe size={16} className="text-primary-cyan" /> Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan transition-all appearance-none"
                >
                  {platforms.map(p => <option key={p} value={p} className="bg-[#0f1523]">{p}</option>)}
                </select>
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-primary via-primary-light to-primary-cyan text-white shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Application'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewAppModal;
