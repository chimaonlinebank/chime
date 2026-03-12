import { useState } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Clock, DollarSign, X, Mail, Phone, Calendar, FileText } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import AdminLayout from './AdminLayout';
import { bankingDb } from '../../../services/bankingDatabase';

// Deposits are now fetched from bankingDb and localStorage in component

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [selectedDeposit, setSelectedDeposit] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [showFullPanel, setShowFullPanel] = useState(false);

  React.useEffect(() => {
    // Fetch deposits data from localStorage
    // In production: fetch from backend API
    const storedDeposits = JSON.parse(localStorage.getItem('fundTransactions') || '[]');
    setDeposits(storedDeposits);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusGradient = (userName: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600'
    ];
    const hash = userName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleApprove = (id: string) => {
    if (!selected) return;

    // Find user by email
    const allUsers = bankingDb.getAllUsers();
    const user = allUsers.find((u: any) => u.email === selected.email);
    if (!user) {
      setStatusMsg('User not found');
      return;
    }

    // Extract deposit amount (remove $ and commas)
    const amountStr = typeof selected.amount === 'string' ? selected.amount : String(selected.amount);
    const depositAmount = parseFloat(amountStr.replace(/[$,]/g, ''));
    
    // Extract current balance as number
    const balance = user?.balance ?? '0';
    const balanceStr = typeof balance === 'string' ? balance : String(balance);
    const currentBalance = parseFloat(balanceStr.replace(/[$,]/g, '')) || 0;
    const newBalance = currentBalance + depositAmount;
    
    // Get currency symbol
    const getCurrencySymbol = (currency: string) => {
      const symbols: { [key: string]: string } = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'INR': '₹',
        'JPY': '¥',
        'AUD': 'A$',
        'CAD': 'C$'
      };
      return symbols[currency] || '$';
    };

    const currencySymbol = getCurrencySymbol(user.currency || 'USD');
    const formattedNewBalance = `${currencySymbol}${newBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

    // Create credit notification for user
    const notification = {
      id: `NOTIF-${Date.now()}`,
      type: 'credit_alert',
      title: 'Deposit Approved ✓',
      message: `You have received ${selected.amount} from your deposit via ${selected.method}. Your new balance is ${formattedNewBalance}`,
      amount: `+${selected.amount}`,
      status: 'success',
      timestamp: new Date().toLocaleDateString(),
      reference: selected.reference
    };

    // Store notification in localStorage
    const existingNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
    existingNotifications.unshift(notification);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(existingNotifications));

    // Update user balance in localStorage
    localStorage.setItem(`user_balance_${user.id}`, formattedNewBalance);

    // Update deposit status
    const depositIndex = deposits.findIndex(d => d.id === id);
    if (depositIndex !== -1) {
      deposits[depositIndex].status = 'approved';
    }

    setStatusMsg(`✓ Deposit ${id} approved. Credit alert sent to ${selected.user}. Balance updated to ${formattedNewBalance}`);
    setTimeout(() => {
      setStatusMsg('');
      setShowFullPanel(false);
      setSelectedDeposit(null);
    }, 2500);
  };

  const handleReject = (id: string) => {
    if (!rejectionReason.trim()) {
      setStatusMsg('Please enter a rejection reason');
      return;
    }

    if (!selected) return;

    // Find user by email
    const allUsers = bankingDb.getAllUsers();
    const user = allUsers.find((u: any) => u.email === selected.email);
    if (!user) {
      setStatusMsg('User not found');
      return;
    }

    // Create rejection notification with admin reason
    const notification = {
      id: `NOTIF-${Date.now()}`,
      type: 'transaction_failed',
      title: 'Deposit Rejected ✗',
      message: `Your deposit of ${selected.amount} via ${selected.method} has been rejected. Reason: ${rejectionReason}`,
      amount: `-${selected.amount}`,
      status: 'failed',
      timestamp: new Date().toLocaleDateString(),
      reference: selected.reference,
      adminReason: rejectionReason
    };

    // Store notification in localStorage
    const existingNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
    existingNotifications.unshift(notification);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(existingNotifications));

    // Update deposit status
    const depositIndex = deposits.findIndex(d => d.id === id);
    if (depositIndex !== -1) {
      deposits[depositIndex].status = 'rejected';
    }

    setStatusMsg(`✗ Deposit ${id} rejected. Notification sent to ${selected.user}`);
    setRejectionReason('');
    setTimeout(() => {
      setStatusMsg('');
      setShowFullPanel(false);
      setSelectedDeposit(null);
    }, 2500);
  };

  const stats = [
    { label: 'Pending Deposits', value: 2, icon: Clock, color: 'text-amber-600' },
    { label: 'Total Approved', value: '$27,500', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Total Rejected', value: '$1,500', icon: XCircle, color: 'text-red-600' },
    { label: 'Avg. Deposit', value: '$4,750', icon: DollarSign, color: 'text-blue-600' }
  ];

  const selected = deposits.find(d => d.id === selectedDeposit);

  return (
    <AdminLayout title="Deposits">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm font-semibold"
          >
            {statusMsg}
          </motion.div>
        )}

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Deposit Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {deposits.map(deposit => (
              <motion.button
                key={deposit.id}
                onClick={() => {
                  setSelectedDeposit(deposit.id);
                  setShowFullPanel(true);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-left"
              >
                <Card className={`p-4 cursor-pointer transition-all border-2 ${
                  selectedDeposit === deposit.id && showFullPanel
                    ? 'border-[#00b388] bg-[#e6f9f4]'
                    : 'border-border hover:border-[#00b388]/50'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{deposit.user}</p>
                        <p className="text-xs text-muted-foreground mt-1">{deposit.email}</p>
                      </div>
                      <Badge className={getStatusColor(deposit.status)}>
                        {deposit.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <p className="font-bold text-green-600">{deposit.amount}</p>
                      <p className="text-xs text-muted-foreground">{deposit.method}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{deposit.created}</p>
                  </div>
                </Card>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Full-Page Review Panel */}
      <AnimatePresence>
        {showFullPanel && selected && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-black/50 lg:inset-y-0 lg:right-0 lg:left-auto lg:w-1/2 flex items-stretch"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-background w-full overflow-y-auto"
            >
              {/* Header with User Info */}
              <div className={`bg-gradient-to-r ${getStatusGradient(selected.user)} px-6 py-8 text-white sticky top-0`}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selected.user}</h2>
                    <p className="text-white/80 text-sm mt-2">{selected.email}</p>
                  </div>
                  <button
                    onClick={() => setShowFullPanel(false)}
                    title="Close panel"
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Deposit Details */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Deposit Details</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Deposit ID</p>
                      <p className="font-medium">{selected.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Reference</p>
                      <p className="font-medium">{selected.reference}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Amount</p>
                      <p className="font-bold text-lg text-green-600">{selected.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Status</p>
                      <Badge className={getStatusColor(selected.status)}>
                        {selected.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Method</p>
                      <p className="font-medium">{selected.method}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Created</p>
                      <p className="font-medium text-sm">{selected.created}</p>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div>
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    User Information
                  </h3>
                  <div className="space-y-3 bg-gray-50/50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{selected.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium">{selected.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Submitted</p>
                        <p className="font-medium">{selected.created}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Information */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Bank Information</h3>
                  <div className="space-y-3 bg-amber-50/30 border border-amber-200/50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Bank Name</p>
                      <p className="font-medium">{selected.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Account Number</p>
                      <p className="font-medium font-mono">{selected.accountNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Media Display - Uploaded Image */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Upload Evidence</h3>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 bg-gray-50/50">
                    {selected.uploadedImage ? (
                      <div className="space-y-2">
                        <img 
                          src={selected.uploadedImage} 
                          alt="Deposit evidence" 
                          className="w-full rounded-lg border border-border max-h-96 object-contain"
                        />
                        <p className="text-xs text-muted-foreground text-center">Uploaded: {selected.reference}</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No upload evidence provided</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Section */}
                {selected.status === 'pending' && (
                  <div className="space-y-4 border-t pt-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Rejection Reason (Optional)</label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        title="Rejection reason"
                        placeholder="Explain why this deposit is being rejected..."
                        className="w-full p-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00b388]"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selected.id)}
                        className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Approve Deposit
                      </button>
                      <button
                        onClick={() => handleReject(selected.id)}
                        className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject Deposit
                      </button>
                    </div>
                  </div>
                )}

                {selected.status !== 'pending' && (
                  <div className={`p-4 rounded-lg text-center ${
                    selected.status === 'approved' 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    <p className="text-sm font-semibold">
                      This deposit has already been {selected.status}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop Click to Close */}
      {showFullPanel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowFullPanel(false)}
          className="fixed inset-0 z-40"
        />
      )}
    </AdminLayout>
  );
}
