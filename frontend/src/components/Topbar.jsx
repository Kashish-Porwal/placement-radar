import { useState, useEffect, useContext } from 'react';
import { Bell, Search, User, Calendar, CheckCircle2, Clock, X } from 'lucide-react';
import { getApplications } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Topbar = () => {
  const { user } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const apps = await getApplications();
      const reminders = [];
      const now = new Date();

      if (!apps || apps.length === 0) {
        // Helpful demo notification if no applications exist
        reminders.push({
          id: 'demo-welcome',
          type: 'info',
          title: '👋 Welcome to Placement Radar Notifications!',
          message: 'Add job applications or schedule interviews to receive real-time alerts here.',
          time: 'Just now',
          urgent: false
        });
      } else {
        apps.forEach(app => {
          // 1. Scheduled Interview Alerts
          if (app.interviewDate) {
            const intDate = new Date(app.interviewDate);
            const diffHours = (intDate - now) / (1000 * 60 * 60);

            if (diffHours >= -24 && diffHours <= 168) { // Up to 7 days in future or today
              reminders.push({
                id: `int-${app._id}`,
                type: 'interview',
                title: `🔔 Interview Scheduled (${app.company})`,
                message: `${app.role} interview scheduled for ${intDate.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
                time: diffHours < 0 ? 'Today / Active' : diffHours <= 24 ? 'Within 24 Hours!' : `${Math.ceil(diffHours / 24)} days away`,
                urgent: diffHours <= 24
              });
            }
          }

          // 2. Offer Received Celebration Alert
          if (app.status === 'Offer') {
            reminders.push({
              id: `off-${app._id}`,
              type: 'offer',
              title: `🥳 Job Offer Received! (${app.company})`,
              message: `Congratulations! You received an offer for the ${app.role} position.`,
              time: 'Active Offer',
              urgent: false
            });
          }

          // 3. Follow-Up Reminders (Applied > 2 days)
          if (app.status === 'Applied' || app.status === 'OA') {
            const createdDate = new Date(app.createdAt || Date.now());
            const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
            if (diffDays >= 2) {
              reminders.push({
                id: `fol-${app._id}`,
                type: 'followup',
                title: `📌 Follow-up Recommended (${app.company})`,
                message: `Applied ${diffDays} days ago for ${app.role}. Consider sending a follow-up email to the recruiter.`,
                time: `${diffDays} days ago`,
                urgent: false
              });
            }
          }
        });
      }

      setNotificationsList(reminders);
      setUnreadCount(reminders.length);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    }
  };

  return (
    <header className="h-16 md:h-20 border-b border-white/10 glass flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="relative w-full max-w-[180px] sm:max-w-xs md:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 md:py-2 pl-9 md:pl-10 pr-3 text-xs md:text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white placeholder-gray-500"
        />
      </div>

      <div className="flex items-center gap-3 sm:gap-6 relative">
        {/* Notification Bell Icon */}
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="relative p-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-full transition-all"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Notification Center */}
          {isOpen && (
            <div className="absolute right-[-60px] sm:right-0 mt-3 w-[calc(100vw-40px)] sm:w-96 glass rounded-2xl border border-white/10 shadow-2xl bg-[#0c121e]/95 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-primary-cyan" />
                  <h3 className="font-bold text-white text-sm">Notifications & Reminders</h3>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-xs p-1">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar">
                {notificationsList.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400 opacity-60" />
                    No urgent reminders right now!
                  </div>
                ) : (
                  notificationsList.map(n => (
                    <div 
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${n.urgent ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}
                    >
                      <div className="flex justify-between items-start font-semibold text-white">
                        <span>{n.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${n.urgent ? 'bg-red-500/20 text-red-400 font-bold' : 'bg-primary/20 text-primary-cyan'}`}>
                          {n.time}
                        </span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-primary-cyan flex items-center justify-center text-xs font-bold text-white shadow-sm border border-white/10">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name || 'Logged User'}</p>
            <p className="text-xs text-gray-400">Job Seeker</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

