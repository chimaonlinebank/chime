import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../ui/card';
import AdminLayout from './AdminLayout';
import { TrendingUp, Users, CreditCard, DollarSign } from 'lucide-react';

const userData = [
  { date: 'Feb 16', active: 187, inactive: 61 },
  { date: 'Feb 17', active: 195, inactive: 58 },
  { date: 'Feb 18', active: 202, inactive: 55 },
  { date: 'Feb 19', active: 210, inactive: 52 },
  { date: 'Feb 20', active: 218, inactive: 49 },
  { date: 'Feb 21', active: 228, inactive: 45 },
  { date: 'Feb 22', active: 235, inactive: 42 }
];

const transactionData = [
  { date: 'Feb 16', volume: 145000 },
  { date: 'Feb 17', volume: 168000 },
  { date: 'Feb 18', volume: 182000 },
  { date: 'Feb 19', volume: 156000 },
  { date: 'Feb 20', volume: 198000 },
  { date: 'Feb 21', volume: 210000 },
  { date: 'Feb 22', volume: 234000 }
];

const typeData = [
  { name: 'Deposits', value: 45, color: '#00b388' },
  { name: 'Withdrawals', value: 35, color: '#f59e0b' },
  { name: 'Transfers', value: 20, color: '#3b82f6' }
];

export default function AdminReports() {
  const metrics = [
    { label: 'Total Revenue', value: '$1.2M', change: '+12.5%', icon: DollarSign },
    { label: 'Active Users', value: '235K', change: '+8.2%', icon: Users },
    { label: 'Transactions', value: '1.3M', change: '+15.3%', icon: CreditCard },
    { label: 'Conversion Rate', value: '3.8%', change: '+0.5%', icon: TrendingUp }
  ];

  return (
    <AdminLayout title="Reports & Analytics">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {metrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
                    <p className="text-2xl font-semibold">{metric.value}</p>
                    <p className="text-xs text-green-600 mt-2">{metric.change} vs last week</p>
                  </div>
                  <metric.icon className="w-6 h-6 text-[#00b388]" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">User Growth</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" fill="#00b388" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inactive" fill="#f3f4f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Transaction Volume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Transaction Volume</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={transactionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="volume" stroke="#00b388" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Transaction Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Transaction Types</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <p className="text-sm">Daily Active Users</p>
                  <p className="font-semibold">235K</p>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <p className="text-sm">Average Session Time</p>
                  <p className="font-semibold">24.3 min</p>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <p className="text-sm">Churn Rate</p>
                  <p className="font-semibold">2.1%</p>
                </div>
                <div className="flex items-center justify-between py-2">
                  <p className="text-sm">NPS Score</p>
                  <p className="font-semibold">72/100</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
