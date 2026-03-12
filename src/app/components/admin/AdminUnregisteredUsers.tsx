import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Mail, Calendar, MapPin, Zap, Eye } from 'lucide-react';
import AdminLayout from './AdminLayout';
import AccountControlPanel from './AccountControlPanel';
import { Card } from '../ui/card';
import { bankingDb } from '../../../services/bankingDatabase';
import { formatCurrency } from '../ui/utils';
import { UserProfile } from '../../../types/banking';

export default function AdminUnregisteredUsers() {
  const [unregisteredUsers, setUnregisteredUsers] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [_activeTab, setActiveTab] = useState<'unregistered' | 'active'>('unregistered');

  useEffect(() => {
    const loadUsers = () => {
      try {
        const allUsers = bankingDb.getAllUsers();
        const unregistered = allUsers.filter(u => u.status === 'UNREGISTERED');
        const active = allUsers.filter(u => u.status === 'ACTIVE');
        setUnregisteredUsers(unregistered);
        setActiveUsers(active);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
    
    // Refresh every 5 seconds
    const interval = setInterval(loadUsers, 5000);
    window.addEventListener('storage', loadUsers);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadUsers);
    };
  }, []);

  const handleSendReminder = (userId: string, email: string) => {
    // TODO: Wire to Supabase email service
    alert(`Reminder sent to ${email}`);
  };

  const handleFollowUp = (userId: string, email: string) => {
    // TODO: Wire to follow-up flow
    alert(`Follow-up initiated for ${email}`);
  };

  const handleViewAccount = (user: UserProfile) => {
    setSelectedUser(user);
  };

  return (
    <AdminLayout 
      title="User Management" 
      subtitle={`${unregisteredUsers.length} pending | ${activeUsers.length} active`}
    >
      {/* Account Control Panel Modal */}
      {selectedUser && (
        <AccountControlPanel 
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      <div className="space-y-6">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="p-6 bg-gradient-to-br from-pink-50 to-rose-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Registrations</p>
                <h3 className="text-3xl font-bold text-pink-600">{unregisteredUsers.length}</h3>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Signup Methods</p>
                <h3 className="text-3xl font-bold text-blue-600">
                  {unregisteredUsers.filter(u => u.signupMethod === 'google').length}G / {unregisteredUsers.filter(u => u.signupMethod === 'email').length}E
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Google / Email</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Accounts</p>
                <h3 className="text-3xl font-bold text-emerald-600">{activeUsers.length}</h3>
                <p className="text-xs text-muted-foreground mt-1">Completed registration</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Conversion Rate</p>
                <h3 className="text-3xl font-bold text-amber-600">0%</h3>
                <p className="text-xs text-muted-foreground mt-1">Track performance</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-border">
              <div className="p-6 flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('unregistered')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    _activeTab === 'unregistered'
                      ? 'bg-[#00b388] text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Pending Registration ({unregisteredUsers.length})
                </button>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    _activeTab === 'active'
                      ? 'bg-[#00b388] text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Active Accounts ({activeUsers.length})
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : _activeTab === 'unregistered' ? (
              unregisteredUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <UserPlus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No unregistered users</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    All users have completed account creation!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border bg-muted/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Method</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Signed Up</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unregisteredUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-sm">{user.email}</p>
                              <p className="text-xs text-muted-foreground mt-1">ID: {user.id.slice(0, 12)}...</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {user.signupMethod === 'google' ? '🔵 Google' : '📧 Email'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSendReminder(user.id, user.email)}
                                className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                              >
                                Remind
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleFollowUp(user.id, user.email)}
                                className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                              >
                                Follow Up
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              activeUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <UserPlus className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No active accounts yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Users will appear here after completing account creation
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border bg-muted/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Account Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-border hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-mono text-sm">{user.accountNumber?.slice(-4) || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewAccount(user)}
                              className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View Account
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </Card>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h4 className="font-semibold text-blue-900 mb-2">User Account Lifecycle</h4>
          <p className="text-sm text-blue-800 mb-3">
            Track users through the complete account creation process:
          </p>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li>📧 <strong>Signup:</strong> User completes Google/Email signup (UNREGISTERED status)</li>
            <li>📋 <strong>Account Creation:</strong> User completes 3-step form with personal, occupation, and account details</li>
            <li>⏳ <strong>Processing:</strong> System generates routing & account numbers (30-second loading)</li>
            <li>✅ <strong>Active:</strong> User account becomes active and receives $10 welcome bonus</li>
            <li>💳 <strong>Full Access:</strong> User can send money, add money, manage savings, and use virtual cards</li>
          </ul>
          <p className="text-xs text-blue-700 mt-3">
            💡 Tip: Click "View Account" on active users to see their complete account details including routing number, account number, and current balance.
          </p>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
