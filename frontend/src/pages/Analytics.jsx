import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Target, Activity, CheckCircle, Clock, Plus, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getApplications } from '../services/api';

const COLORS = ['#06b6d4', '#eab308', '#a855f7', '#3b82f6', '#22c55e', '#ef4444'];

const Analytics = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await getApplications();
      setTasks(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-primary-cyan">
        <Activity className="animate-spin" size={32} />
      </div>
    );
  }

  // Calculate stats based on REAL user applications
  const total = tasks.length;
  const interviewing = tasks.filter(t => t?.status && t.status.includes('Interview')).length;
  const offers = tasks.filter(t => t?.status === 'Offer').length;
  const rejected = tasks.filter(t => t?.status === 'Rejected').length;

  // Real Status Distribution for Pie Chart
  const statusCounts = tasks.reduce((acc, task) => {
    if (task && task.status) {
      acc[task.status] = (acc[task.status] || 0) + 1;
    }
    return acc;
  }, {});
  
  const pieData = Object.keys(statusCounts).map(key => ({
    name: key.replace('_', ' '),
    value: statusCounts[key]
  }));

  // Real Application Velocity grouped by Day of Week
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayCounts = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };

  tasks.forEach(task => {
    if (task?.createdAt) {
      const dayName = daysOfWeek[new Date(task.createdAt).getDay()];
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    } else {
      dayCounts['Mon'] += 1;
    }
  });

  const areaData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    name: day,
    applications: dayCounts[day] || 0
  }));

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -mr-10 -mt-10 ${colorClass}`} />
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-white/5 ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
        <p className="text-sm text-gray-400">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col pb-4 custom-scrollbar overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-white mb-2">Analytics & Insights</h1>
        <p className="text-gray-400 text-sm">Real-time statistics calculated directly from your job applications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Applications" value={total} icon={Target} colorClass="text-blue-400 bg-blue-500" />
        <StatCard title="Active Interviews" value={interviewing} icon={Clock} colorClass="text-purple-400 bg-purple-500" />
        <StatCard title="Offers Received" value={offers} icon={CheckCircle} colorClass="text-green-400 bg-green-500" />
        <StatCard title="Rejected" value={rejected} icon={Activity} colorClass="text-red-400 bg-red-500" />
      </div>

      {total === 0 ? (
        /* Empty State when 0 applications have been created */
        <div className="flex-1 glass p-12 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center my-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary-cyan flex items-center justify-center mb-4 border border-primary/30 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <BarChart2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Applications Tracked Yet</h2>
          <p className="text-gray-400 text-sm max-w-md mb-6">
            Analytics charts are dynamically generated from your active job hunt data. Add your first application on the Dashboard to unlock real-time velocity graphs and status distributions.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-primary-cyan text-white font-bold text-sm hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Add Your First Application
          </button>
        </div>
      ) : (
        /* Real Dynamic Graphs */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
          <div className="lg:col-span-2 glass p-6 rounded-3xl border border-white/5 flex flex-col">
            <h3 className="text-xl font-bold mb-6 text-white">Application Velocity</h3>
            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff60" axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff60" axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0e17', borderRadius: '12px', border: '1px solid #ffffff20' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="applications" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/5 flex flex-col">
            <h3 className="text-xl font-bold mb-6 text-white">Pipeline Distribution</h3>
            <div className="flex-1 w-full min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0e17', borderRadius: '12px', border: '1px solid #ffffff20' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry.name}: <strong className="text-white">{entry.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
