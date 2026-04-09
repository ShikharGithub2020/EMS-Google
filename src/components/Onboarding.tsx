import { useState } from 'react';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { motion } from 'motion/react';
import { Briefcase, User, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Onboarding() {
  const { profile, user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    department: '',
    phone: '',
    location: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'employees', user.uid), {
        ...formData,
        status: 'active'
      });
      toast.success("Onboarding complete! Welcome to the team.");
      window.location.reload();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'employees');
      toast.error("Failed to complete onboarding.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-none shadow-2xl shadow-neutral-200">
          <CardHeader className="text-center pt-10">
            <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
              <Briefcase size={32} />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Welcome to ProEMS</CardTitle>
            <p className="text-neutral-500 mt-2">Let's get your profile set up for the team.</p>
          </CardHeader>
          <CardContent className="p-10">
            <div className="flex justify-between mb-10 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-100 -translate-y-1/2 z-0" />
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    step >= s ? 'bg-neutral-900 text-white' : 'bg-white border-2 border-neutral-100 text-neutral-300'
                  }`}
                >
                  {step > s ? <CheckCircle2 size={20} /> : s}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select onValueChange={(v) => setFormData({...formData, department: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="hr">Human Resources</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <Input 
                        className="pl-10" 
                        placeholder="+1 (555) 000-0000" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  <Button className="w-full bg-neutral-900" onClick={() => setStep(2)}>Continue</Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label>Office Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                      <Input 
                        className="pl-10" 
                        placeholder="e.g. New York, London, Remote" 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Short Bio</Label>
                    <textarea 
                      className="w-full min-h-[120px] p-3 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 transition-all"
                      placeholder="Tell us a bit about yourself..."
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                    <Button className="flex-1 bg-neutral-900" onClick={() => setStep(3)}>Continue</Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center space-y-6"
                >
                  <div className="p-6 bg-neutral-50 rounded-2xl inline-block">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">All set!</h3>
                    <p className="text-neutral-500 mt-2">Your profile is ready. Click finish to enter the dashboard.</p>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                    <Button 
                      className="flex-1 bg-neutral-900" 
                      onClick={handleComplete}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Finish Onboarding"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

import { AnimatePresence } from 'motion/react';
