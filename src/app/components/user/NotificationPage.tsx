import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Bell, CheckCircle2, X, Info, Trash2 } from 'lucide-react';
import { useAuthContext } from '../../../context/AuthProvider';
import { supabaseDbService, type Notification as DbNotification } from '../../../services/supabaseDbService';

export interface Notification {
  id: string;
  message: string;
  status: 'approved' | 'declined' | 'info' | 'draft';
  timestamp: string;
  read?: boolean;
}

export default function NotificationPage() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const toUi = (n: DbNotification): Notification => ({
      id: n.id,
      message: n.message,
      status: (['approved', 'declined', 'info', 'draft'].includes(n.type || '') ? n.type : 'info') as Notification['status'],
      timestamp: n.created_at ? new Date(n.created_at).toLocaleString() : '',
      read: n.read,
    });

    const load = async () => {
      if (!user?.id) {
        setNotifications([]);
        return;
      }
      const items = await supabaseDbService.getNotifications(user.id, 100);
      setNotifications(items.map(toUi));
    };

    load();
  }, [user?.id]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (user?.id) {
      supabaseDbService.markNotificationsRead(user.id);
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    supabaseDbService.deleteNotification(id);
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="w-7 h-7 text-[#00b388]" /> Notifications
        </h1>
        <Button onClick={markAllRead} variant="outline" className="shadow-sm hover:shadow-md">Mark all as read</Button>
      </div>
      <Card className="p-6 max-w-2xl mx-auto shadow-xl">
        {notifications.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <Info className="w-10 h-10 mx-auto mb-4" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => (
              <li key={n.id} className={`py-4 flex items-start gap-4 ${!n.read ? 'bg-[#f6f6f6]' : ''}`}>
                <div className="flex-shrink-0">
                  {n.status === 'approved' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                  {n.status === 'declined' && <X className="w-6 h-6 text-red-500" />}
                  {n.status === 'info' && <Info className="w-6 h-6 text-blue-500" />}
                  {n.status === 'draft' && <Trash2 className="w-6 h-6 text-orange-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{n.message}</span>
                    {!n.read && <span className="ml-2 px-2 py-0.5 rounded-full bg-[#00b388] text-white text-xs">New</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{n.timestamp}</span>
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteNotification(n.id)} className="shadow-sm hover:shadow-md">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
