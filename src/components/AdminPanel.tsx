import { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';
import { Shield, UserCog, Mail, Briefcase } from 'lucide-react';

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'employees'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'employees'));

    return () => unsubscribe();
  }, [isAdmin]);

  const handleRoleChange = async (uid: string, newRole: string) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'employees', uid), { role: newRole });
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'employees');
      toast.error("Failed to update role.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return <div className="p-10 text-center">Unauthorized access.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Admin Panel</h1>
          <p className="text-neutral-500">Manage employee roles, departments, and system access.</p>
        </div>
        <Button className="bg-neutral-900 hover:bg-neutral-800 gap-2">
          <UserCog size={18} />
          <span>Add Employee</span>
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50">
              <TableRow>
                <TableHead className="font-semibold">Employee</TableHead>
                <TableHead className="font-semibold">Department</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={emp.photoURL} referrerPolicy="no-referrer" />
                        <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-neutral-900">{emp.name}</p>
                        <p className="text-xs text-neutral-500">{emp.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{emp.department || '-'}</TableCell>
                  <TableCell>
                    <Badge className={`border-none ${
                      emp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 
                      emp.status === 'onboarding' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={emp.role} 
                      onValueChange={(v) => handleRoleChange(emp.id, v)}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-neutral-500 hover:text-neutral-900">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
