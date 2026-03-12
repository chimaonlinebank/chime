import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  Receipt,
  ArrowDownRight,
  ArrowUpRight,
  MessageSquare,
  Settings,
  LogOut,
  UserCheck,
  Menu
} from 'lucide-react';
import { Logo } from '../Logo';
import { useAuthContext } from '../../../context/AuthProvider';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useState } from 'react';

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AdminLayout({ title, subtitle, children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { id: 'users', icon: Users, label: 'User Management', path: '/admin/users' },
    { id: 'transactions', icon: Receipt, label: 'Transactions', path: '/admin/transactions' },
    { id: 'deposits', icon: ArrowDownRight, label: 'Deposits', path: '/admin/deposits' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/admin/settings' }
  ];

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = ({ onNavigate }: { onNavigate?: (path: string) => void }) => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#00b388] flex items-center justify-center">
            <Logo innerClassName="text-white" className="w-5 h-5" />
          </div>
          <h1 className="text-lg tracking-tight font-semibold">Chime Next</h1>
        </div>
        <p className="text-xs text-muted-foreground ml-10">Admin Command Center</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate ? onNavigate(item.path) : navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path)
                  ? 'bg-[#00b388] text-white shadow-lg shadow-[#00b388]/20'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-accent">
          <div className="w-10 h-10 rounded-full bg-[#00b388] flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate font-semibold">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">admin@chime.com</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 mt-3 p-3 text-sm text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex lg:flex-col w-72 bg-card border-r border-border fixed lg:relative h-screen"
      >
        <SidebarContent />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 md:px-6 lg:px-8 py-4 md:py-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button 
                    title="Toggle navigation menu"
                    className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-72 p-0">
                  <SidebarContent onNavigate={handleNavigate} />
                </SheetContent>
              </Sheet>

              <div>
                <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
                {subtitle && <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-green-700">Live</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
