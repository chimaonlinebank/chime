import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Card } from '../ui/card';

export interface Notification {
  id: string;
  message: string;
  status: 'approved' | 'declined' | 'info';
  timestamp: string;
}

export default function NotificationBar() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Listen for notification events
    const handler = (e: any) => {
      const { status, message } = e.detail;
      setNotifications((prev) => [
        {
          id: Date.now().toString(),
          message,
          status,
          timestamp: new Date().toLocaleString(),
        },
        ...prev,
      ]);
    };
    window.addEventListener('addMoneyNotification', handler);
    return () => window.removeEventListener('addMoneyNotification', handler);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        className="bg-accent rounded-full p-3 shadow-lg flex items-center gap-2"
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
      >
        <Bell className="w-6 h-6 text-muted-foreground" />
        {notifications.length > 0 && (
          <span className="bg-[#00b388] text-white rounded-full px-2 py-0.5 text-xs font-bold">
            {notifications.length}
          </span>
        )}
      </button>
      {open && (
        <Card className="mt-2 w-80 max-h-96 overflow-y-auto p-4 shadow-xl">
          <h2 className="text-lg font-semibold mb-3">Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li key={n.id} className="border-b border-border pb-2 last:border-none">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${n.status === 'approved' ? 'bg-green-500' : n.status === 'declined' ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                    <span className="text-xs text-muted-foreground">{n.timestamp}</span>
                  </div>
                  <p className="text-sm mt-1">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
