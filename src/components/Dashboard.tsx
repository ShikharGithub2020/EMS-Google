import { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Star
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    attendance: 0,
    leaves: 0,
    expenses: 0,
    performance: 0
  });
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('employeeId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
      setRecentAttendance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'attendance'));

    return () => unsubscribe();
  }, [user]);

  const StatCard = ({ title, value, icon: Icon, trend, trendValue }: any) => (
    <Card className="border-none shadow-sm bg-white overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-neutral-50 rounded-lg group-hover:bg-neutral-900 group-hover:text-white transition-colors">
            <Icon size={20} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trendValue}%
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-neutral-500 font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-neutral-900 mt-1">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );

  const data = [
    { name: 'Mon', hours: 8 },
    { name: 'Tue', hours: 9 },
    { name: 'Wed', hours: 7.5 },
    { name: 'Thu', hours: 8.5 },
    { name: 'Fri', hours: 8 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Welcome back, {profile?.name.split(' ')[0]}!</h1>
          <p className="text-neutral-500">Here's what's happening with your workspace today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar size={18} />
            <span>Schedule</span>
          </Button>
          <Button className="bg-neutral-900 hover:bg-neutral-800 gap-2">
            <Clock size={18} />
            <span>Check In</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Attendance Rate" value="98.5%" icon={CheckCircle2} trend="up" trendValue="2.4" />
        <StatCard title="Leave Balance" value="12 Days" icon={Calendar} />
        <StatCard title="Pending Expenses" value="$420.00" icon={TrendingUp} trend="down" trendValue="1.2" />
        <StatCard title="Performance Score" value="4.8/5" icon={Star} trend="up" trendValue="0.5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Working Hours</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f5f5f5' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="hours" fill="#171717" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentAttendance.length > 0 ? recentAttendance.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${item.status === 'present' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Checked {item.checkOut ? 'out' : 'in'}</p>
                    <p className="text-xs text-neutral-500">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10">
                  <AlertCircle className="mx-auto text-neutral-300 mb-2" size={32} />
                  <p className="text-sm text-neutral-500">No recent activity found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
