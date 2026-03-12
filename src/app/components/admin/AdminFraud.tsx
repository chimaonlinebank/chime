import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Shield, Lock, TrendingDown } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import AdminLayout from './AdminLayout';

export default function AdminFraud() {
  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);

  const alerts = [
    {
      id: 1,
      user: 'User #45892',
      type: 'High-Value Transaction',
      amount: '$12,450.00',
      risk: 'high',
      time: '2 hours ago',
      reason: 'Transaction exceeds 10x average spending'
    },
    {
      id: 2,
      user: 'User #23451',
      type: 'Multiple Login Attempts',
      amount: '15 attempts',
      risk: 'medium',
      time: '1 hour ago',
      reason: 'Multiple failed login attempts from different IPs'
    },
    {
      id: 3,
      user: 'User #78234',
      type: 'Unusual Spending Pattern',
      amount: '$8,920.00',
      risk: 'medium',
      time: '30 mins ago',
      reason: 'Spending pattern differs from historical data'
    },
    {
      id: 4,
      user: 'User #56789',
      type: 'Geographic Anomaly',
      amount: '-',
      risk: 'low',
      time: 'Just now',
      reason: 'Transaction from different country than registered'
    }
  ];

  const stats = [
    { label: 'Active Alerts', value: 4, icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Blocked Users', value: 3, icon: Lock, color: 'text-red-600' },
    { label: 'Flagged Accounts', value: 12, icon: Shield, color: 'text-blue-600' },
    { label: 'Risk Score', value: '3.2/10', icon: TrendingDown, color: 'text-green-600' }
  ];

  return (
    <AdminLayout title="Fraud Monitoring">
      <div className="space-y-6">
        {/* Stats */}
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

        {/* Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <h3 className="font-semibold mb-4">Active Alerts</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {alerts.map(alert => (
                <motion.button
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert.id)}
                  whileHover={{ x: 4 }}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedAlert === alert.id
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-border hover:border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">{alert.type}</p>
                    <Badge
                      className={alert.risk === 'high' ? 'bg-red-100 text-red-700' : alert.risk === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}
                    >
                      {alert.risk}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.user}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Detail Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            {selectedAlert ? (
              <Card className="p-6">
                {(() => {
                  const alert = alerts.find(a => a.id === selectedAlert)!;
                  return (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          Alert Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Alert Type</p>
                            <p className="font-medium">{alert.type}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
                            <Badge className={alert.risk === 'high' ? 'bg-red-100 text-red-700' : alert.risk === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
                              {alert.risk.toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Amount</p>
                            <p className="font-semibold">{alert.amount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Time</p>
                            <p className="font-medium">{alert.time}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Reason</h4>
                        <p className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg">
                          {alert.reason}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <button className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                          Mark as Safe
                        </button>
                        <button className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                          Block User
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Select an Alert</p>
                <p className="text-muted-foreground">Choose an alert to view details and take action</p>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
