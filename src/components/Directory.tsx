import { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Search, Mail, MapPin, Briefcase } from 'lucide-react';

export default function Directory() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'employees'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'employees'));

    return () => unsubscribe();
  }, []);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Employee Directory</h1>
          <p className="text-neutral-500">Find and connect with your colleagues across the organization.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <Input 
            className="pl-10 bg-white border-neutral-200" 
            placeholder="Search employees..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => (
          <Card key={emp.id} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow duration-200 overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-neutral-50">
                  <AvatarImage src={emp.photoURL} referrerPolicy="no-referrer" />
                  <AvatarFallback className="text-xl bg-neutral-100">{emp.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-lg text-neutral-900 truncate">{emp.name}</h3>
                    <Badge variant="outline" className="capitalize text-[10px] h-5 border-neutral-100 bg-neutral-50">
                      {emp.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-1">
                    <Briefcase size={14} className="text-neutral-400" />
                    {emp.department || 'General'}
                  </p>
                  <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-1">
                    <MapPin size={14} className="text-neutral-400" />
                    {emp.location || 'Remote'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-neutral-50 flex items-center justify-between">
                <a 
                  href={`mailto:${emp.email}`} 
                  className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-2 transition-colors"
                >
                  <Mail size={16} />
                  <span className="truncate max-w-[150px]">{emp.email}</span>
                </a>
                <Badge className={`border-none ${
                  emp.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {emp.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-neutral-100">
          <Search className="mx-auto text-neutral-200 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-neutral-900">No employees found</h3>
          <p className="text-neutral-500 mt-2">Try adjusting your search terms.</p>
        </div>
      )}
    </div>
  );
}
