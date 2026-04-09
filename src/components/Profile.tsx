import { useState } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner';
import { User, Mail, Briefcase, MapPin, Phone, Save } from 'lucide-react';

export default function Profile() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    department: profile?.department || '',
    location: profile?.location || '',
    phone: profile?.phone || '',
    bio: profile?.bio || ''
  });

  const handleSave = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'employees', user.uid), formData);
      toast.success("Profile updated successfully.");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'employees');
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Your Profile</h1>
          <p className="text-neutral-500">Manage your personal information and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardContent className="p-8 text-center">
            <Avatar className="h-24 w-24 mx-auto border-4 border-neutral-50">
              <AvatarImage src={profile?.photoURL} referrerPolicy="no-referrer" />
              <AvatarFallback className="text-2xl">{profile?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="mt-4 text-xl font-bold text-neutral-900">{profile?.name}</h3>
            <p className="text-sm text-neutral-500 capitalize">{profile?.role}</p>
            <div className="mt-6 pt-6 border-t border-neutral-50 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <Mail size={16} className="text-neutral-400" />
                <span>{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <Briefcase size={16} className="text-neutral-400" />
                <span>{profile?.department || 'General'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <MapPin size={16} className="text-neutral-400" />
                <span>{profile?.location || 'Remote'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Edit Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input 
                    id="department" 
                    value={formData.department} 
                    onChange={(e) => setFormData({...formData, department: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Office Location</Label>
                  <Input 
                    id="location" 
                    value={formData.location} 
                    onChange={(e) => setFormData({...formData, location: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea 
                  id="bio"
                  className="w-full min-h-[120px] p-3 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" className="bg-neutral-900 hover:bg-neutral-800 gap-2" disabled={loading}>
                  <Save size={18} />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
