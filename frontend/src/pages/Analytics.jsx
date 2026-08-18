import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Target, Activity, CheckCircle, Clock } from 'lucide-react';
import { getApplications } from '../services/api';

const COLORS = ['#3b82f6', '#eab308', '#a855f7', '#22c55e', '#ef4444'];

const Analytics = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await getApplications();
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center text-primary-cyan"><Activity className="animate-spin" /></div>;
  }

  // Calculate stats
  const total = tasks.length;
  const interviewing = tasks.filter(t => t.status.includes('Interview')).length;
  const offers = tasks.filter(t => t.status === 'Offer').length;
  const rejected = tasks.filter(t => t.status === 'Rejected').length;

  // Prepare Pie Chart data (Status Distribution)
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});
  
  const pieData = Object.keys(statusCounts).map(key => ({
    name: key.replace('_', ' '),
    value: statusCounts[key]
  }));

  // Prepare Area Chart data (Activity over time - mocked for simplicity)
  const areaData = [
    { name: 'Mon', applications: 2 },
    { name: 'Tue', applications: 5 },
    { name: 'Wed', applications: 3 },
    { name: 'Thu', applications: 7 },
    { name: 'Fri', applications: 4 },
    { name: 'Sat', applications: 1 },
    { name: 'Sun', applications: total > 22 ? total - 22 : 0 },
  ];

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
        <h1 className="text-3xl font-heading font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400 text-sm">Visualize your application pipeline and performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Applications" value={total} icon={Target} colorClass="text-blue-400 bg-blue-500" />
        <StatCard title="Active Interviews" value={interviewing} icon={Clock} colorClass="text-purple-400 bg-purple-500" />
        <StatCard title="Offers Received" value={offers} icon={CheckCircle} colorClass="text-green-400 bg-green-500" />
        <StatCard title="Rejected" value={rejected} icon={Activity} colorClass="text-red-400 bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        <div className="lg:col-span-2 glass p-6 rounded-3xl border border-white/5 flex flex-col">
          <h3 className="text-xl font-bold mb-6">Application Velocity</h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} />
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
          <h3 className="text-xl font-bold mb-6">Pipeline Status</h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={80}
                  outerRadius={110}
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
              <div key={entry.name} className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
