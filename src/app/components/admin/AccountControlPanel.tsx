import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, X, Copy, Calendar, Users, DollarSign } from 'lucide-react';
import { Card } from '../ui/card';
import { Logo } from '../Logo';
import { type Account, type Profile } from '../../../services/supabaseDbService';

interface AccountControlPanelProps {
  profile: Profile;
  account?: Account | null;
  balance?: number;
  onClose: () => void;
}

export default function AccountControlPanel({ profile, account, balance = 0, onClose }: AccountControlPanelProps) {
  const [showBalance, setShowBalance] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showRoutingNumber, setShowRoutingNumber] = useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const primaryAccount = account || null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const maskNumber = (num: string, show: boolean): string => {
    if (show) return num;
    return '•'.repeat(num.length);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#00b388] to-[#009670] px-6 py-6 text-white flex items-center justify-between rounded-t-2xl">
            <div>
              <h2 className="text-2xl font-bold">{profile.first_name} {profile.last_name}</h2>
              <p className="text-sm opacity-90">{profile.email}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current Balance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Current Balance
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-3xl font-bold text-blue-900 dark:text-white">
                {showBalance ? `$${balance.toFixed(2) || '0.00'}` : '••••••'}
              </p>
              {primaryAccount && (
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                  {primaryAccount.currency} • Account #{primaryAccount.account_number.slice(-4)}
                </p>
              )}
            </motion.div>

            {/* Account Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4" />
                Account Details
              </h3>

              {/* Personal Information */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Full Name</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {profile.first_name
                      ? `${profile.first_name} ${profile.last_name || ''}`.trim()
                      : `${profile.name || ''}`}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Gender</p>
                  <p className="text-gray-900 dark:text-white font-medium capitalize">{profile.gender || 'Not specified'}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Date of Birth</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {profile.date_of_birth 
                      ? new Date(profile.date_of_birth).toLocaleDateString()
                      : 'Not specified'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Nationality</p>
                  <p className="text-gray-900 dark:text-white font-medium">{profile.nationality || 'Not specified'}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Address</p>
                  <p className="text-gray-900 dark:text-white font-medium text-sm">{profile.house_address || 'Not specified'}</p>
                </div>
              </div>
            </motion.div>

            {/* Occupation & Income */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white">Employment Information</h3>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Occupation</p>
                  <p className="text-gray-900 dark:text-white font-medium">{profile.occupation || 'Not specified'}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Salary Range</p>
                  <p className="text-gray-900 dark:text-white font-medium">{profile.salary_range || 'Not specified'}</p>
                </div>
              </div>
            </motion.div>

            {/* Bank Account Details */}
            {primaryAccount && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">Bank Account</h3>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Routing Number</p>
                      <button
                        onClick={() => setShowRoutingNumber(!showRoutingNumber)}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                      >
                        {showRoutingNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 dark:text-white font-mono font-medium">
                        {maskNumber(primaryAccount.routing_number, showRoutingNumber)}
                      </p>
                      <button
                        onClick={() => handleCopy(primaryAccount.routing_number, 'routing')}
                        className="text-[#00b388] hover:text-[#009670] transition flex items-center gap-1"
                      >
                        <Copy className="w-4 h-4" />
                        {copiedField === 'routing' && <span className="text-xs">Copied!</span>}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Account Number</p>
                      <button
                        onClick={() => setShowAccountNumber(!showAccountNumber)}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                      >
                        {showAccountNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 dark:text-white font-mono font-medium">
                        {maskNumber(primaryAccount.account_number, showAccountNumber)}
                      </p>
                      <button
                        onClick={() => handleCopy(primaryAccount.account_number, 'account')}
                        className="text-[#00b388] hover:text-[#009670] transition flex items-center gap-1"
                      >
                        <Copy className="w-4 h-4" />
                        {copiedField === 'account' && <span className="text-xs">Copied!</span>}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Account Type</p>
                    <p className="text-gray-900 dark:text-white font-medium capitalize">{primaryAccount.account_type}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Currency</p>
                    <p className="text-gray-900 dark:text-white font-medium">{primaryAccount.currency}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Status</p>
                    <span className="inline-block mt-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">
                      {primaryAccount.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Account Creation Timestamp */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {profile.created_at
                ? `Account created on ${new Date(profile.created_at).toLocaleDateString()} at ${new Date(profile.created_at).toLocaleTimeString()}`
                : 'Account creation date unavailable'}
            </motion.div>
          </div>

          {/* Close Button */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-full py-3 bg-[#00b388] text-white font-semibold rounded-lg hover:bg-[#009670] transition-colors"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


