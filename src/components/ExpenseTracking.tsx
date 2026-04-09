import { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import { Receipt, Plus, DollarSign, FileText } from 'lucide-react';

export default function ExpenseTracking() {
  const { user, isManager } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = isManager 
      ? query(collection(db, 'expenses'), orderBy('date', 'desc'))
      : query(collection(db, 'expenses'), where('employeeId', '==', user.uid), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'expenses'));

    return () => unsubscribe();
  }, [user, isManager]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    const formData = new FormData(e.target);
    const data = {
      employeeId: user.uid,
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category'),
      date: formData.get('date'),
      description: formData.get('description'),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'expenses'), data);
      toast.success("Expense claim submitted.");
      setOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'expenses');
      toast.error("Failed to submit expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Expense Tracking</h1>
          <p className="text-neutral-500">Manage your business expenses and reimbursements.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-neutral-900 hover:bg-neutral-800 gap-2">
              <Plus size={18} />
              <span>New Claim</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Submit Expense Claim</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <Input type="number" step="0.01" name="amount" className="pl-10" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input name="category" placeholder="e.g. Travel, Meals, Software" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date of Expense</Label>
                <Input type="date" name="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  name="description"
                  className="w-full min-h-[100px] p-3 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                  placeholder="What was this expense for?"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-neutral-900" disabled={loading}>
                {loading ? "Submitting..." : "Submit Claim"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold">
              ${expenses.filter(e => e.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
            </h3>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Approved this Month</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold text-emerald-600">
              ${expenses.filter(e => e.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
            </h3>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50">
              <TableRow>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="text-right font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length > 0 ? expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.category}</TableCell>
                  <TableCell className="max-w-[300px] truncate text-neutral-500">{expense.description}</TableCell>
                  <TableCell className="font-mono font-semibold">${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={`border-none ${
                      expense.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                      expense.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {expense.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-neutral-500">
                    No expense claims found.
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
