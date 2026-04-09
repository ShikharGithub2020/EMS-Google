import { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import { Star, MessageSquare, Target, Calendar, Plus } from 'lucide-react';

export default function PerformanceReviews() {
  const { user, profile, isManager } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = isManager 
      ? query(collection(db, 'reviews'), orderBy('date', 'desc'))
      : query(collection(db, 'reviews'), where('employeeId', '==', user.uid), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'reviews'));

    if (isManager) {
      const empUnsub = onSnapshot(collection(db, 'employees'), (snapshot) => {
        setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => {
        unsubscribe();
        empUnsub();
      };
    }

    return () => unsubscribe();
  }, [user, isManager]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    const selectedEmpId = formData.get('employeeId') as string;
    const selectedEmp = employees.find(emp => emp.id === selectedEmpId);

    const data = {
      employeeId: selectedEmpId,
      employeeName: selectedEmp?.name || 'Unknown',
      managerId: user?.uid,
      managerName: profile?.name,
      period: formData.get('period'),
      rating: parseFloat(formData.get('rating') as string),
      feedback: formData.get('feedback'),
      goals: formData.get('goals'),
      date: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'reviews'), data);
      toast.success("Performance review submitted.");
      setOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
      toast.error("Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Performance Reviews</h1>
          <p className="text-neutral-500">Track growth, feedback, and career goals.</p>
        </div>
        {isManager && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={
              <Button className="bg-neutral-900 hover:bg-neutral-800 gap-2">
                <Plus size={18} />
                <span>Write Review</span>
              </Button>
            } />
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>New Performance Review</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select name="employeeId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Review Period</Label>
                    <Select name="period" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1 2026">Q1 2026</SelectItem>
                        <SelectItem value="Q2 2026">Q2 2026</SelectItem>
                        <SelectItem value="Annual 2025">Annual 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Rating (1-5)</Label>
                    <Input type="number" name="rating" min="1" max="5" step="0.5" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Feedback</Label>
                  <textarea 
                    name="feedback"
                    className="w-full min-h-[100px] p-3 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                    placeholder="Provide constructive feedback..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Future Goals</Label>
                  <textarea 
                    name="goals"
                    className="w-full min-h-[80px] p-3 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                    placeholder="Set objectives for the next period..."
                  />
                </div>
                <Button type="submit" className="w-full bg-neutral-900" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {reviews.length > 0 ? reviews.map((review) => (
          <Card key={review.id} className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-neutral-50 bg-neutral-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Star className="text-amber-400 fill-amber-400" size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">{review.period} Review</CardTitle>
                    <p className="text-xs text-neutral-500">Completed on {new Date(review.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{review.rating}</span>
                  <span className="text-neutral-400 text-sm">/ 5.0</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-neutral-900 font-semibold">
                    <MessageSquare size={18} className="text-neutral-400" />
                    <span>Feedback</span>
                  </div>
                  <p className="text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-xl">
                    {review.feedback}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-neutral-900 font-semibold">
                    <Target size={18} className="text-neutral-400" />
                    <span>Goals & Objectives</span>
                  </div>
                  <p className="text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-xl">
                    {review.goals || "No specific goals set for this period."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-neutral-100">
            <Star className="mx-auto text-neutral-200 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-neutral-900">No reviews yet</h3>
            <p className="text-neutral-500 max-w-xs mx-auto mt-2">
              Your performance reviews will appear here once completed by your manager.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
