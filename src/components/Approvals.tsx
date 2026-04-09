import { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Check, X, Clock, Receipt, Calendar } from 'lucide-react';

export default function Approvals() {
  const { isManager } = useAuth();
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [pendingExpenses, setPendingExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isManager) return;

    const leavesQuery = query(collection(db, 'leaves'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const expensesQuery = query(collection(db, 'expenses'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));

    const unsubLeaves = onSnapshot(leavesQuery, (snapshot) => {
      setPendingLeaves(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'leaves'));

    const unsubExpenses = onSnapshot(expensesQuery, (snapshot) => {
      setPendingExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'expenses'));

    return () => {
      unsubLeaves();
      unsubExpenses();
    };
  }, [isManager]);

  const handleAction = async (collectionName: string, id: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await updateDoc(doc(db, collectionName, id), { status });
      toast.success(`Request ${status} successfully.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, collectionName);
      toast.error("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  if (!isManager) return <div className="p-10 text-center">Unauthorized access.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Approvals Center</h1>
        <p className="text-neutral-500">Review and manage team requests for leaves and expenses.</p>
      </div>

      <Tabs defaultValue="leaves" className="w-full">
        <TabsList className="bg-neutral-100 p-1 rounded-xl mb-6">
          <TabsTrigger value="leaves" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Leaves ({pendingLeaves.length})
          </TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Expenses ({pendingExpenses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaves">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow>
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Dates</TableHead>
                    <TableHead className="font-semibold">Reason</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLeaves.length > 0 ? pendingLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-medium">{leave.employeeName || 'Unknown'}</TableCell>
                      <TableCell className="capitalize">{leave.type}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-neutral-500">{leave.reason}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => handleAction('leaves', leave.id, 'rejected')}
                            disabled={loading}
                          >
                            <X size={16} />
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleAction('leaves', leave.id, 'approved')}
                            disabled={loading}
                          >
                            <Check size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-neutral-500">
                        <Calendar className="mx-auto mb-3 opacity-20" size={48} />
                        <p>No pending leave requests.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow>
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingExpenses.length > 0 ? pendingExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.employeeName || 'Unknown'}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell className="font-mono font-bold">${expense.amount.toFixed(2)}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-neutral-500">{expense.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => handleAction('expenses', expense.id, 'rejected')}
                            disabled={loading}
                          >
                            <X size={16} />
                          </Button>
                          <Button 
                            size="sm" 
                            className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleAction('expenses', expense.id, 'approved')}
                            disabled={loading}
                          >
                            <Check size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-neutral-500">
                        <Receipt className="mx-auto mb-3 opacity-20" size={48} />
                        <p>No pending expense claims.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
