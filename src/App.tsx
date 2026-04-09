/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider, useAuth } from './lib/AuthContext';
import { Toaster } from './components/ui/sonner';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clock, 
  Receipt, 
  Star, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  UserCircle,
  ChevronRight,
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { auth, googleProvider, browserPopupRedirectResolver } from './lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { toast } from 'sonner';

// Components (to be implemented in detail)
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import LeaveManagement from './components/LeaveManagement';
import Attendance from './components/Attendance';
import ExpenseTracking from './components/ExpenseTracking';
import PerformanceReviews from './components/PerformanceReviews';
import AdminPanel from './components/AdminPanel';
import Approvals from './components/Approvals';
import Directory from './components/Directory';
import ProfilePage from './components/Profile';

function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: any) {
  const { profile, isAdmin, isManager } = useAuth();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leaves', label: 'Leaves', icon: Calendar },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'reviews', label: 'Performance', icon: Star },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
  ];

  if (isManager) {
    // Add Approvals and Directory for Managers/Admins
    menuItems.splice(5, 0, { id: 'approvals', label: 'Approvals', icon: CheckCircle2 });
    menuItems.splice(6, 0, { id: 'directory', label: 'Directory', icon: Users });
  }

  if (isAdmin) {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: Settings });
  }

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-neutral-200 z-50 transition-transform duration-300 lg:translate-x-0 w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center gap-3 border-bottom border-neutral-100">
          <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-white">
            <Briefcase size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">ProEMS</span>
        </div>

        <nav className="mt-6 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-200' 
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
              {activeTab === item.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-neutral-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-neutral-100 overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserCircle className="w-full h-full text-neutral-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">{profile?.name}</p>
              <p className="text-xs text-neutral-500 truncate capitalize">{profile?.role}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 gap-3"
            onClick={() => signOut(auth)}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>
    </>
  );
}

function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider, browserPopupRedirectResolver);
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/popup-blocked') {
        toast.error("Popup blocked! Please allow popups for this site to sign in.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        toast.info("Sign-in cancelled.");
      } else if (error.code === 'auth/internal-error' || error.message?.includes('INTERNAL ASSERTION FAILED')) {
        toast.error("A technical error occurred. Please refresh and try again.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="border-none shadow-2xl shadow-neutral-200 overflow-hidden">
          <div className="h-2 bg-neutral-900" />
          <CardHeader className="pt-10 pb-6 text-center">
            <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-6">
              <Briefcase size={32} />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">MNC Pro EMS</CardTitle>
            <p className="text-neutral-500 mt-2">Enterprise-grade Employee Management System</p>
          </CardHeader>
          <CardContent className="px-10 pb-12">
            <Button 
              className="w-full h-12 text-lg font-medium bg-neutral-900 hover:bg-neutral-800 transition-all"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in with Google"}
            </Button>
            <div className="mt-4 text-center">
              <p className="text-xs text-neutral-400">
                Trouble signing in? Ensure popups are enabled for this site.
              </p>
            </div>
            <p className="text-xs text-center text-neutral-400 mt-6">
              Securely operated for MNC standards.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function MainApp() {
  const { profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (profile?.status === 'onboarding') {
    return <Onboarding />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'attendance': return <Attendance />;
      case 'leaves': return <LeaveManagement />;
      case 'expenses': return <ExpenseTracking />;
      case 'reviews': return <PerformanceReviews />;
      case 'approvals': return <Approvals />;
      case 'directory': return <Directory />;
      case 'profile': return <ProfilePage />;
      case 'admin': return <AdminPanel />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      
      <main className="lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-neutral-900 capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-neutral-900">{profile?.name}</p>
              <p className="text-xs text-neutral-500">{profile?.department || 'General'}</p>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (!isAuthReady) return null;

  return (
    <AuthProvider>
      <div className="font-sans antialiased text-neutral-900">
        <AppContent />
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  return user ? <MainApp /> : <Login />;
}

