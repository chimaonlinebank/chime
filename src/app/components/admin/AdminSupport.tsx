import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MessageSquare } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import AdminLayout from './AdminLayout';

// Support tickets fetched from storage in component

export default function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Fetch tickets from storage on component mount
  useEffect(() => {
    const storedTickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    setTickets(storedTickets);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const selected = tickets.find(t => t.id === selectedTicket);

  return (
    <AdminLayout title="Support Tickets">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tickets List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <h3 className="font-semibold mb-4">Tickets</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {tickets.map(ticket => (
              <motion.button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket.id)}
                whileHover={{ x: 4 }}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedTicket === ticket.id
                    ? 'border-[#00b388] bg-[#e6f9f4]'
                    : 'border-border hover:border-[#00b388]/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-sm">{ticket.id}</p>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>
                <p className="text-sm truncate">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground mt-1">{ticket.user}</p>
                <p className="text-xs text-muted-foreground">{ticket.created}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Ticket Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          {selected ? (
            <div className="space-y-6">
              {/* Header */}
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{selected.id}</p>
                    <h2 className="text-lg font-semibold">{selected.subject}</h2>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(selected.status)}>
                      {selected.status}
                    </Badge>
                    <Badge className={getPriorityColor(selected.priority)}>
                      {selected.priority}
                    </Badge>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-sm"><span className="font-semibold">From:</span> {selected.user} ({selected.email})</p>
                  <p className="text-sm text-muted-foreground mt-1"><span className="font-semibold">Created:</span> {selected.created}</p>
                </div>
              </Card>

              {/* Message */}
              <Card className="p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Customer Message
                </h4>
                <p className="text-sm leading-relaxed">{selected.message}</p>
              </Card>

              {/* Reply */}
              <Card className="p-6">
                <h4 className="font-semibold mb-4">Send Reply</h4>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the customer..."
                  className="w-full p-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00b388]/50"
                  rows={4}
                />
                <div className="flex gap-3 mt-4">
                  <button className="flex-1 px-4 py-2 bg-[#00b388] text-white font-semibold rounded-lg hover:bg-[#009670] transition-colors">
                    Send Reply
                  </button>
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                    Mark as Resolved
                  </button>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Select a Ticket</p>
              <p className="text-muted-foreground">Choose a support ticket to view details and respond</p>
            </Card>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
