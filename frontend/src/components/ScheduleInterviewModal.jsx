import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Sparkles } from 'lucide-react';

const ScheduleInterviewModal = ({ isOpen, onClose, onConfirm, task, targetStatus }) => {
  const [interviewDate, setInterviewDate] = useState('');
  const [loading, setLoading] = useState(false);

  if (!task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(task._id, targetStatus, interviewDate);
      setInterviewDate('');
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statusTitle = targetStatus === 'Interview_R2' ? 'Interview Round 2' : 'Interview Round 1';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md glass rounded-3xl overflow-hidden border border-primary-cyan/30 shadow-[0_0_50px_rgba(6,182,212,0.25)] bg-[#0f1523]"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-primary/20 to-primary-cyan/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-cyan/20 text-primary-cyan border border-primary-cyan/30 flex items-center justify-center font-bold">
                  📅
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-white">Schedule {statusTitle}</h2>
                  <p className="text-xs text-gray-300">{task.company} — {task.role}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-sm text-primary-cyan font-semibold">
                  <Sparkles size={16} /> 24-Hour Reminder Notice
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Setting your interview date & time will automatically schedule a 24-hour reminder alert in your dashboard & notifications.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-green-400" /> Select Interview Date & Time
                </label>
                <input 
                  required
                  type="datetime-local" 
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full bg-black/30 border border-white/15 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan transition-all text-sm"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    onConfirm(task._id, targetStatus, null);
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-xl font-medium bg-white/10 hover:bg-white/15 text-gray-300 transition-all text-sm"
                >
                  Skip Date
                </button>
                <button 
                  type="submit" 
                  disabled={loading || !interviewDate}
                  className="flex-1 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-primary via-primary-light to-primary-cyan text-white shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all text-sm disabled:opacity-50"
                >
                  {loading ? 'Scheduling...' : 'Set Reminder'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ScheduleInterviewModal;
