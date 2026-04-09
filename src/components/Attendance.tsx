import { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, getDocs, limit, orderBy } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Clock, LogIn, LogOut, MapPin, AlertCircle } from 'lucide-react';

export default function Attendance() {
  const { user, profile } = useAuth();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'attendance'),
      where('employeeId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setAttendance(records);
      const todayRec = records.find(r => r.date === today);
      setTodayRecord(todayRec);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'attendance'));

    return () => unsubscribe();
  }, [user, today]);

  const handleCheckIn = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const now = new Date();
      const checkInTime = now.toISOString();
      const status = now.getHours() >= 10 ? 'late' : 'present';
      
      await addDoc(collection(db, 'attendance'), {
        employeeId: user.uid,
        date: today,
        checkIn: checkInTime,
        status: status,
        location: 'Office' // Mock location
      });
      toast.success("Checked in successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'attendance');
      toast.error("Failed to check in.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'attendance', todayRecord.id), {
        checkOut: new Date().toISOString()
      });
      toast.success("Checked out successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'attendance');
      toast.error("Failed to check out.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Attendance</h1>
          <p className="text-neutral-500">Track your daily working hours and presence.</p>
        </div>
        <div className="flex gap-3">
          {!todayRecord ? (
            <Button 
              className="bg-neutral-900 hover:bg-neutral-800 gap-2" 
              onClick={handleCheckIn}
              disabled={loading}
            >
              <LogIn size={18} />
              <span>Check In</span>
            </Button>
          ) : !todayRecord.checkOut ? (
            <Button 
              variant="outline" 
              className="border-neutral-200 gap-2" 
              onClick={handleCheckOut}
              disabled={loading}
            >
              <LogOut size={18} />
              <span>Check Out</span>
            </Button>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-4 py-2 text-sm">
              Completed for Today
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Today's Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${todayRecord ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-50 text-neutral-400'}`}>
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{todayRecord ? (todayRecord.status === 'late' ? 'Late' : 'Present') : 'Not Checked In'}</h3>
                <p className="text-sm text-neutral-500">{todayRecord ? `Checked in at ${new Date(todayRecord.checkIn).toLocaleTimeString()}` : 'Please check in to start your day'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Working Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {todayRecord?.checkOut 
                    ? `${Math.round((new Date(todayRecord.checkOut).getTime() - new Date(todayRecord.checkIn).getTime()) / (1000 * 60 * 60) * 10) / 10} hrs`
                    : todayRecord ? 'In Progress' : '0 hrs'}
                </h3>
                <p className="text-sm text-neutral-500">Total time logged today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-neutral-50 text-neutral-600">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{todayRecord?.location || 'Not detected'}</h3>
                <p className="text-sm text-neutral-500">Current working site</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Attendance History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50">
              <TableRow>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Check In</TableHead>
                <TableHead className="font-semibold">Check Out</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Total Hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.length > 0 ? attendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(record.checkIn).toLocaleTimeString()}</TableCell>
                  <TableCell>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}</TableCell>
                  <TableCell>
                    <Badge className={`border-none ${
                      record.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 
                      record.status === 'late' ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {record.checkOut 
                      ? `${Math.round((new Date(record.checkOut).getTime() - new Date(record.checkIn).getTime()) / (1000 * 60 * 60) * 10) / 10}h`
                      : '-'}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-neutral-500">
                    No attendance records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
