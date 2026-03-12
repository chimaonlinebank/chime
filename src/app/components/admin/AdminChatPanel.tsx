// AdminChatPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';

interface AdminChatPanelProps {
  selectedUser: { email: string };
}
export default function AdminChatPanel({ selectedUser }: AdminChatPanelProps) {
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('chatMessages') || '[]'));
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter messages for selected user
  const filtered = messages.filter(
    (msg: any) => msg.sender === selectedUser.email || msg.recipientEmail === selectedUser.email
  );

  // Real-time sync
  useEffect(() => {
    const handleUpdate = () => {
      setMessages(JSON.parse(localStorage.getItem('chatMessages') || '[]'));
    };
    window.addEventListener('chatUpdate', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    const interval = setInterval(handleUpdate, 2000);
    return () => {
      window.removeEventListener('chatUpdate', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filtered]);

  const sendMessage = () => {
    if (!input.trim() || input.length > 1000) return;
    const newMessage = {
      id: Date.now(),
      sender: 'admin@chime.com',
      senderType: 'admin',
      recipientEmail: selectedUser.email,
      message: input.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated = [...messages, newMessage];
    localStorage.setItem('chatMessages', JSON.stringify(updated));
    window.dispatchEvent(new Event('chatUpdate'));
    setInput('');
  };

  return (
    <div className="flex flex-col h-full border-t border-border">
      {/* Panel Header */}
      <div className="px-4 py-4 border-b border-border">
        <div className="text-sm font-semibold mb-1">Live Chat Support</div>
        <div className="text-xs text-muted-foreground">Respond to user messages</div>
      </div>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-white adminchatpanel-messages-area">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">No messages yet</div>
        ) : (
          filtered.map((msg: any, idx: number) => (
            msg.senderType === 'user' ? (
              <div key={msg.id} className="flex justify-start mb-3">
                <Card className="max-w-[85%] p-3 rounded-xl bg-[#f3f4f6]">
                  <div className="flex items-start gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-semibold">User</span>
                  </div>
                  <div className="text-sm break-words">{msg.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </Card>
              </div>
            ) : (
              <div key={msg.id} className="flex justify-end mb-3">
                <Card className="max-w-[85%] p-3 rounded-xl bg-[#00b388] text-white">
                  <div className="text-sm break-words">{msg.message}</div>
                  <div className="text-xs text-white/70 mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </Card>
              </div>
            )
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input Area */}
      <div className="px-4 py-4 border-t border-border bg-white">
        <div className="flex items-end gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your response..."
            className="flex-1 min-h-10 bg-[#f9fafb] border-0 rounded-lg px-2 text-sm"
            maxLength={1000}
          />
          <Button onClick={sendMessage} disabled={!input.trim()} className="w-10 h-10 bg-[#00b388] hover:bg-[#009670] text-white rounded-lg disabled:opacity-50">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
