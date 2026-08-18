import { useState, useContext, useEffect } from 'react';
import { Save, User, Bell, Shield, CheckCircle2, LogOut, KeyRound, Smartphone, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { changePassword, toggleTwoFactor, updateProfile } from '../services/api';

const SecuritySettings = () => {
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState(null);
  const [passError, setPassError] = useState(null);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.isTwoFactorEnabled || false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorMsg, setTwoFactorMsg] = useState(null);

  useEffect(() => {
    if (user) {
      setTwoFactorEnabled(user.isTwoFactorEnabled || false);
    }
  }, [user]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMessage(null);
    setPassError(null);

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('New password and confirm password do not match.');
      return;
    }

    if (passData.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await changePassword(passData.currentPassword, passData.newPassword);
      setPassMessage(res.message || 'Password updated successfully!');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to update password. Check current password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setTwoFactorLoading(true);
    setTwoFactorMsg(null);
    try {
      const res = await toggleTwoFactor();
      setTwoFactorEnabled(res.isTwoFactorEnabled);
      updateUser({ isTwoFactorEnabled: res.isTwoFactorEnabled });
      setTwoFactorMsg(res.message);
    } catch (err) {
      console.error(err);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Change Password Section */}
      <div>
        <h2 className="text-xl font-bold border-b border-white/10 pb-4 text-white flex items-center gap-2">
          <KeyRound size={20} className="text-primary-cyan" /> Change Password
        </h2>

        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4 max-w-md">
          {passMessage && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 size={16} /> {passMessage}
            </div>
          )}

          {passError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle size={16} /> {passError}
            </div>
          )}

          <div>
            <label className="text-xs text-gray-400 block mb-1">Current Password</label>
            <input 
              required
              type="password"
              value={passData.currentPassword}
              onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
              placeholder="Enter current password"
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">New Password</label>
            <input 
              required
              type="password"
              value={passData.newPassword}
              onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
              placeholder="Enter new password (min 6 characters)"
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Confirm New Password</label>
            <input 
              required
              type="password"
              value={passData.confirmPassword}
              onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan outline-none"
            />
          </div>

          <button 
            type="submit"
            disabled={passLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-cyan text-white text-xs font-semibold hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50 transition-all"
          >
            {passLoading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication (2FA) Section */}
      <div className="pt-4 border-t border-white/10">
        <h2 className="text-xl font-bold border-b border-white/10 pb-4 text-white flex items-center gap-2">
          <Smartphone size={20} className="text-primary-cyan" /> Two-Factor Authentication (2FA)
        </h2>

        <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white text-sm">Require 2FA Verification</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${twoFactorEnabled ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-gray-500/20 text-gray-400 border-gray-500/40'}`}>
                {twoFactorEnabled ? '🟢 2FA Enabled' : '⚪ Disabled'}
              </span>
            </div>
            <p className="text-xs text-gray-400">Add an extra layer of security to your account during login.</p>
            {twoFactorMsg && <p className="text-xs text-green-400 mt-1 font-medium">{twoFactorMsg}</p>}
          </div>

          <button
            onClick={handleToggle2FA}
            disabled={twoFactorLoading}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${twoFactorEnabled ? 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/40 hover:bg-green-500/30'}`}
          >
            {twoFactorLoading ? 'Processing...' : twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      {/* Logout Account */}
      <div className="pt-4 border-t border-white/10">
        <button 
          onClick={() => { logout(); navigate('/login'); }}
          className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-colors w-full text-left font-medium flex items-center justify-between text-xs"
        >
          <span>Logout from Placement Radar Account</span>
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, updateUser } = useContext(AuthContext);

  const [nameState, setNameState] = useState(user?.name || '');
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    interviewReminders: true,
    weeklyDigest: true,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (user) {
      setNameState(user.name || '');
      if (user.notificationPreferences) {
        setNotifications(user.notificationPreferences);
      }
    }
  }, [user]);

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    setErrorMsg(null);

    try {
      const updatedData = await updateProfile({
        name: nameState,
        notificationPreferences: notifications
      });

      updateUser({
        name: updatedData.name,
        notificationPreferences: updatedData.notificationPreferences
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 text-sm">Manage your account preferences and application settings.</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-8 pb-4">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-primary/20 text-primary-cyan border border-primary/30 font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <User size={18} /> Profile
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'notifications' ? 'bg-primary/20 text-primary-cyan border border-primary/30 font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Bell size={18} /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'security' ? 'bg-primary/20 text-primary-cyan border border-primary/30 font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Shield size={18} /> Security
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 glass p-8 rounded-3xl border border-white/5 h-fit">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-white/10 pb-4 text-white">Profile Information</h2>
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-primary-cyan flex items-center justify-center text-2xl font-bold text-white shadow-md border border-white/10">
                  {nameState ? nameState.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium block">Full Name</label>
                  <input 
                    type="text" 
                    value={nameState} 
                    onChange={(e) => setNameState(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-primary-cyan focus:ring-1 focus:ring-primary-cyan outline-none transition-all text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium block">Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-gray-400 outline-none cursor-not-allowed text-sm" 
                    disabled 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-white/10 pb-4 text-white">Notification Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div>
                    <h3 className="font-semibold text-white">Email Alerts</h3>
                    <p className="text-sm text-gray-400">Receive emails for application status changes and updates.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notifications.emailAlerts} onChange={(e) => handleNotificationChange('emailAlerts', e.target.checked)} />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-cyan"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div>
                    <h3 className="font-semibold text-white">Interview Reminders</h3>
                    <p className="text-sm text-gray-400">Get notified 24 hours before scheduled interviews.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notifications.interviewReminders} onChange={(e) => handleNotificationChange('interviewReminders', e.target.checked)} />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-cyan"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                  <div>
                    <h3 className="font-semibold text-white">Weekly Digest</h3>
                    <p className="text-sm text-gray-400">Receive a weekly summary of your job hunt progress.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notifications.weeklyDigest} onChange={(e) => handleNotificationChange('weeklyDigest', e.target.checked)} />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-cyan"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <SecuritySettings />
          )}

          {activeTab !== 'security' && (
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
              {savedSuccess ? (
                <span className="text-xs text-green-400 font-semibold flex items-center gap-1.5 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
                  <CheckCircle2 size={16} /> Profile & Settings saved to database!
                </span>
              ) : errorMsg ? (
                <span className="text-xs text-red-400 font-semibold flex items-center gap-1.5 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                  <AlertTriangle size={16} /> {errorMsg}
                </span>
              ) : <div />}

              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-primary-cyan text-white rounded-full font-medium hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 transition-all text-xs md:text-sm"
              >
                <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
