import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Clock, DollarSign, X, Mail, Phone, Calendar, FileText } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import AdminLayout from './AdminLayout';

// Shared users database (same as in AdminUsers)
const users = [
  { id: '#45892', name: 'John Anderson', email: 'john.a@email.com', balance: '$8,247.56', currency: 'USD', status: 'active', riskScore: 'low', joined: '2024-01-15' },
  { id: '#45891', name: 'Sarah Martinez', email: 'sarah.m@email.com', balance: '$12,450.00', currency: 'USD', status: 'active', riskScore: 'low', joined: '2024-01-14' },
  { id: '#45890', name: 'Michael Chen', email: 'michael.c@email.com', balance: '$3,892.34', currency: 'USD', status: 'restricted', riskScore: 'medium', joined: '2024-01-12' },
  { id: '#45889', name: 'Emily Davis', email: 'emily.d@email.com', balance: '€15,672.89', currency: 'EUR', status: 'active', riskScore: 'low', joined: '2024-01-10' },
  { id: '#45888', name: 'David Miller', email: 'david.m@email.com', balance: '$987.23', currency: 'USD', status: 'under_review', riskScore: 'high', joined: '2024-01-08' },
  { id: '#45887', name: 'Lisa Thompson', email: 'lisa.t@email.com', balance: '£24,567.12', currency: 'GBP', status: 'active', riskScore: 'low', joined: '2024-01-05' },
  { id: '#45886', name: 'James Wilson', email: 'james.w@email.com', balance: '$6,234.78', currency: 'USD', status: 'active', riskScore: 'low', joined: '2024-01-03' },
  { id: '#45885', name: 'Maria Garcia', email: 'maria.g@email.com', balance: '₹18,901.45', currency: 'INR', status: 'active', riskScore: 'low', joined: '2023-12-28' }
];

const withdrawals = [
  {
    id: 'WTH-001',
    user: 'David Miller',
    email: 'david.m@email.com',
    phone: '+1 (555) 123-4567',
    amount: '$3,000.00',
    fee: '$30',
    destination: 'Bank Account ****1234',
    status: 'pending',
    created: '30 minutes ago',
    reference: 'WTH-2024-001',
    bankName: 'Wells Fargo',
    accountNumber: '****1234',
    uploadedImage: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23666%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-size=%2216%22 font-family=%22Arial%22%3EWithdrawal Request - David Miller%3C/text%3E%3C/svg%3E'
  },
  {
    id: 'WTH-002',
    user: 'Lisa Thompson',
    email: 'lisa.t@email.com',
    phone: '+1 (555) 234-5678',
    amount: '$5,000.00',
    fee: '$50',
    destination: 'Bank Account ****5678',
    status: 'pending',
    created: '1 hour ago',
    reference: 'WTH-2024-002',
    bankName: 'Chase Bank',
    accountNumber: '****5678',
    uploadedImage: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23666%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-size=%2216%22 font-family=%22Arial%22%3EWithdrawal Request - Lisa Thompson%3C/text%3E%3C/svg%3E'
  },
  {
    id: 'WTH-003',
    user: 'James Wilson',
    email: 'james.w@email.com',
    phone: '+1 (555) 345-6789',
    amount: '$2,000.00',
    fee: '$20',
    destination: 'Bank Account ****9012',
    status: 'completed',
    created: '2 hours ago',
    reference: 'WTH-2024-003',
    bankName: 'BofA',
    accountNumber: '****9012',
    uploadedImage: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23666%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-size=%2216%22 font-family=%22Arial%22%3EWithdrawal Request - James Wilson%3C/text%3E%3C/svg%3E'
  },
  {
    id: 'WTH-004',
    user: 'Maria Garcia',
    email: 'maria.g@email.com',
    phone: '+1 (555) 456-7890',
    amount: '$1,500.00',
    fee: '$15',
    destination: 'Bank Account ****3456',
    status: 'rejected',
    created: '1 day ago',
    reference: 'WTH-2024-004',
    bankName: 'Capital One',
    accountNumber: '****3456',
    uploadedImage: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23666%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-size=%2216%22 font-family=%22Arial%22%3EWithdrawal Request - Maria Garcia%3C/text%3E%3C/svg%3E'
  }
];

export default function AdminWithdrawals() {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [showFullPanel, setShowFullPanel] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'completed':
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

  const handleProcess = (id: string) => {
    if (!selected) return;

    // Find user by email
    const user = users.find(u => u.email === selected.email);
    if (!user) {
      setStatusMsg('User not found');
      return;
    }

    // Extract withdrawal amount and fee (remove $ and commas)
    const withdrawalAmount = parseFloat(selected.amount.replace(/[$,]/g, ''));
    const feeAmount = parseFloat(selected.fee.replace(/[$,]/g, ''));
    const totalDeducted = withdrawalAmount + feeAmount;
    
    // Extract current balance as number
    const currentBalance = parseFloat(user.balance.replace(/[$,]/g, ''));
    const newBalance = currentBalance - totalDeducted;
    
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

    // Create debit notification for user
    const notification = {
      id: `NOTIF-${Date.now()}`,
      type: 'debit_alert',
      title: 'Withdrawal Processed ✓',
      message: `Your withdrawal of ${selected.amount} (Fee: ${selected.fee}) to ${selected.destination} has been processed. Your new balance is ${formattedNewBalance}`,
      amount: `-${selected.amount}`,
      status: 'success',
      timestamp: new Date().toLocaleDateString(),
      reference: selected.reference,
      fee: selected.fee
    };

    // Store notification in localStorage
    const existingNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
    existingNotifications.unshift(notification);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(existingNotifications));

    // Update user balance in localStorage
    localStorage.setItem(`user_balance_${user.id}`, formattedNewBalance);

    // Update withdrawal status
    const withdrawalIndex = withdrawals.findIndex(w => w.id === id);
    if (withdrawalIndex !== -1) {
      withdrawals[withdrawalIndex].status = 'completed';
    }

    setStatusMsg(`✓ Withdrawal ${id} processed. Debit alert sent to ${selected.user}. New balance: ${formattedNewBalance}`);
    setTimeout(() => {
      setStatusMsg('');
      setShowFullPanel(false);
      setSelectedWithdrawal(null);
    }, 2500);
  };

  const handleReject = (id: string) => {
    if (!rejectionReason.trim()) {
      setStatusMsg('Please enter a rejection reason');
      return;
    }

    if (!selected) return;

    // Find user by email
    const user = users.find(u => u.email === selected.email);
    if (!user) {
      setStatusMsg('User not found');
      return;
    }

    // Create rejection notification with admin reason
    const notification = {
      id: `NOTIF-${Date.now()}`,
      type: 'transaction_failed',
      title: 'Withdrawal Rejected ✗',
      message: `Your withdrawal of ${selected.amount} to ${selected.destination} has been rejected. Reason: ${rejectionReason}`,
      amount: selected.amount,
      status: 'failed',
      timestamp: new Date().toLocaleDateString(),
      reference: selected.reference,
      adminReason: rejectionReason
    };

    // Store notification in localStorage
    const existingNotifications = JSON.parse(localStorage.getItem(`notifications_${user.id}`) || '[]');
    existingNotifications.unshift(notification);
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify(existingNotifications));

    // Update withdrawal status
    const withdrawalIndex = withdrawals.findIndex(w => w.id === id);
    if (withdrawalIndex !== -1) {
      withdrawals[withdrawalIndex].status = 'rejected';
    }

    setStatusMsg(`✗ Withdrawal ${id} rejected. Notification sent to ${selected.user}`);
    setRejectionReason('');
    setTimeout(() => {
      setStatusMsg('');
      setShowFullPanel(false);
      setSelectedWithdrawal(null);
    }, 2500);
  };

  const stats = [
    { label: 'Pending Withdrawals', value: 2, icon: Clock, color: 'text-amber-600' },
    { label: 'Total Completed', value: '$9,500', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Total Rejected', value: '$1,500', icon: XCircle, color: 'text-red-600' },
    { label: 'Total Fees Collected', value: '$115', icon: DollarSign, color: 'text-blue-600' }
  ];

  const selected = withdrawals.find(w => w.id === selectedWithdrawal);

  const calculateNetAmount = (selected: typeof withdrawals[0]) => {
    const amount = parseFloat(selected.amount.replace(/[$,]/g, ''));
    const fee = parseFloat(selected.fee.replace(/[$,]/g, ''));
    return `$${(amount - fee).toFixed(2)}`;
  };

  return (
    <AdminLayout title="Withdrawals">
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
          <h3 className="font-semibold text-lg">Withdrawal Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {withdrawals.map(withdrawal => (
              <motion.button
                key={withdrawal.id}
                onClick={() => {
                  setSelectedWithdrawal(withdrawal.id);
                  setShowFullPanel(true);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-left"
              >
                <Card className={`p-4 cursor-pointer transition-all border-2 ${
                  selectedWithdrawal === withdrawal.id && showFullPanel
                    ? 'border-[#00b388] bg-[#e6f9f4]'
                    : 'border-border hover:border-[#00b388]/50'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{withdrawal.user}</p>
                        <p className="text-xs text-muted-foreground mt-1">{withdrawal.email}</p>
                      </div>
                      <Badge className={getStatusColor(withdrawal.status)}>
                        {withdrawal.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <p className="font-bold text-red-600">{withdrawal.amount}</p>
                      <p className="text-xs text-muted-foreground">{withdrawal.fee} fee</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{withdrawal.created}</p>
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
                {/* Withdrawal Details */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Withdrawal Details</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Withdrawal ID</p>
                      <p className="font-medium">{selected.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Reference</p>
                      <p className="font-medium">{selected.reference}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Amount</p>
                      <p className="font-bold text-lg text-red-600">{selected.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Fee</p>
                      <p className="font-semibold text-orange-600">{selected.fee}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Net Amount</p>
                      <p className="font-bold text-green-600">{calculateNetAmount(selected)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Status</p>
                      <Badge className={getStatusColor(selected.status)}>
                        {selected.status.toUpperCase()}
                      </Badge>
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
                        <p className="text-xs text-muted-foreground">Requested</p>
                        <p className="font-medium">{selected.created}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Destination Information */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Destination Information</h3>
                  <div className="space-y-3 bg-red-50/30 border border-red-200/50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Bank Name</p>
                      <p className="font-medium">{selected.bankName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Account Number</p>
                      <p className="font-medium font-mono">{selected.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Destination</p>
                      <p className="font-medium">{selected.destination}</p>
                    </div>
                  </div>
                </div>

                {/* Media Display - Withdrawal Document */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Withdrawal Evidence</h3>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 bg-gray-50/50">
                    {selected.uploadedImage ? (
                      <div className="space-y-2">
                        <img 
                          src={selected.uploadedImage} 
                          alt="Withdrawal evidence" 
                          className="w-full rounded-lg border border-border max-h-96 object-contain"
                        />
                        <p className="text-xs text-muted-foreground text-center">Document: {selected.reference}</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No document provided</p>
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
                        placeholder="Explain why this withdrawal is being rejected..."
                        className="w-full p-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00b388]"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleProcess(selected.id)}
                        className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Process Withdrawal
                      </button>
                      <button
                        onClick={() => handleReject(selected.id)}
                        className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject Withdrawal
                      </button>
                    </div>
                  </div>
                )}

                {selected.status !== 'pending' && (
                  <div className={`p-4 rounded-lg text-center ${
                    selected.status === 'completed' 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    <p className="text-sm font-semibold">
                      This withdrawal has already been {selected.status}
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
