import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Send, Paperclip, Search, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { useAuthContext } from '../../../context/AuthProvider';
import { bankingDb } from '../../../services/bankingDatabase';

interface AdminChatProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: number;
  sender: string;
  senderType: 'user' | 'admin';
  message: string;
  timestamp: string;
  userId?: string;
  fileData?: string;
  fileType?: string;
}

export default function AdminChat({ isOpen, onClose }: AdminChatProps) {
  const { user: adminUser } = useAuthContext();
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => 
    JSON.parse(localStorage.getItem('chatMessages') || '[]')
  );
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [usersList, setUsersList] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all registered users
  useEffect(() => {
    if (isOpen) {
      let users = bankingDb.getAllUsers();
      
      // If no users are present in the in-memory DB, leave the list empty.
      // Production: ensure backend returns users; do not inject mock/demo users here.
      
      const enrichedUsers = users.map(user => {
        const userMessages = messages.filter(
          msg => msg.sender === user.email || msg.userId === user.id
        );
        const lastMessage = userMessages[userMessages.length - 1];
        const unreadCount = userMessages.filter(
          msg => msg.senderType === 'user' && !msg.message.startsWith('[READ]')
        ).length;

        return {
          ...user,
          lastMessage: lastMessage?.message || 'No messages yet',
          lastMessageTime: lastMessage?.timestamp || new Date().toISOString(),
          unreadCount,
          messageCount: userMessages.length
        };
      });
      setUsersList(enrichedUsers.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      ));
    }
  }, [isOpen, messages]);

  // Real-time sync
  useEffect(() => {
    const handleUpdate = () => {
      setMessages(JSON.parse(localStorage.getItem('chatMessages') || '[]'));
    };
    window.addEventListener('chatUpdate', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    const interval = setInterval(handleUpdate, 1000);
    return () => {
      window.removeEventListener('chatUpdate', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedUser]);

  const getSelectedUserMessages = () => {
    if (!selectedUser) return [];
    return messages.filter(
      msg => msg.sender === selectedUser.email || msg.userId === selectedUser.id
    );
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedUser) return;
    
    const newMessage: ChatMessage = {
      id: Date.now(),
      sender: adminUser?.email || 'admin@chime.com',
      senderType: 'admin',
      message: input.trim(),
      timestamp: new Date().toISOString(),
      userId: selectedUser.id
    };

    const updated = [...messages, newMessage];
    localStorage.setItem('chatMessages', JSON.stringify(updated));
    window.dispatchEvent(new Event('chatUpdate'));
    setInput('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedUser) return;
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const fileData = event.target?.result as string;
        const newMessage: ChatMessage = {
          id: Date.now(),
          sender: adminUser?.email || 'admin@chime.com',
          senderType: 'admin',
          message: file.name,
          fileData,
          fileType: file.type,
          timestamp: new Date().toISOString(),
          userId: selectedUser.id
        };
        const updated = [...messages, newMessage];
        localStorage.setItem('chatMessages', JSON.stringify(updated));
        window.dispatchEvent(new Event('chatUpdate'));
      };
      
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setView('chat');
  };

  const filteredUsers = usersList.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUserMessages = getSelectedUserMessages();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-end sm:justify-center"
    >
      <motion.div
        initial={{ y: '100%', x: 0 }}
        animate={{ y: 0, x: 0 }}
        exit={{ y: '100%', x: 0 }}
        className="w-full sm:w-[500px] h-screen sm:h-[90vh] sm:rounded-3xl bg-white flex flex-col shadow-2xl"
      >
        {/* Header */}
        <motion.div className="sticky top-0 z-10 bg-white border-b border-border px-4 py-4 flex items-center justify-between sm:rounded-t-3xl">
          <div className="flex items-center gap-3">
            {view === 'chat' && (
              <motion.button
                onClick={() => setView('list')}
                whileHover={{ scale: 1.1, rotate: -10 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#FFE5E5' }}
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" style={{ color: '#FF6B6B' }} />
              </motion.button>
            )}
            <div>
              <div className="text-base font-semibold">
                {view === 'list' ? 'Customer Support' : selectedUser?.name}
              </div>
              {view === 'chat' && (
                <div className="flex items-center gap-2 mt-1">
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-green-500"
                  />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              )}
            </div>
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {view === 'list' ? (
          // Conversation List View
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search users..."
                  className="pl-10 h-10 bg-[#f9fafb] border-0 rounded-lg"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                  <User className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">No users found</p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const userMessages = messages.filter(
                    msg => msg.sender === user.email || msg.userId === user.id
                  );
                  return (
                    <motion.button
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      whileHover={{ backgroundColor: '#f3f4f6' }}
                      className="w-full text-left px-4 py-4 border-b border-border transition-colors hover:bg-accent"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#00b388] flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 justify-between">
                            <p className="font-semibold text-sm">{user.name}</p>
                            {userMessages.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(userMessages[userMessages.length - 1].timestamp).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {userMessages.length > 0
                              ? userMessages[userMessages.length - 1].message
                              : 'No messages'}
                          </p>
                        </div>
                        {user.unreadCount > 0 && (
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="flex-shrink-0 min-w-fit"
                          >
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-[#00b388] rounded-full">
                              {user.unreadCount}
                            </span>
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          // Chat View
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {selectedUserMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-[#e6f9f4] flex items-center justify-center mb-3">
                    <User className="w-8 h-8 text-[#00b388]" />
                  </div>
                  <p className="text-sm">Start a conversation with {selectedUser?.name}</p>
                </div>
              ) : (
                selectedUserMessages.map((msg) => {
                  const isImage = msg.fileType?.startsWith('image/');
                  const isVideo = msg.fileType?.startsWith('video/');
                  const isAudio = msg.fileType?.startsWith('audio/');

                  return msg.senderType === 'user' ? (
                    <div key={msg.id} className="flex justify-end">
                      <Card className="max-w-[80%] p-4 rounded-xl bg-[#00b388] text-white">
                        {msg.fileData ? (
                          <div className="space-y-2">
                            {isImage && (
                              <img src={msg.fileData} alt={msg.message} className="max-w-full rounded-lg max-h-96" />
                            )}
                            {isVideo && (
                              <video controls className="max-w-full rounded-lg max-h-96">
                                <source src={msg.fileData} type={msg.fileType} />
                              </video>
                            )}
                            {isAudio && (
                              <audio controls className="w-full">
                                <source src={msg.fileData} type={msg.fileType} />
                              </audio>
                            )}
                            <div className="text-xs text-white/70">{msg.message}</div>
                          </div>
                        ) : (
                          <div className="text-sm break-words">{msg.message}</div>
                        )}
                        <div className="text-xs text-white/70 mt-2">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex justify-start">
                      <Card className="max-w-[80%] p-4 rounded-xl bg-[#f3f4f6]">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-[#00b388] flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-xs font-semibold">Customer Support</span>
                        </div>
                        {msg.fileData ? (
                          <div className="space-y-2">
                            {isImage && (
                              <img src={msg.fileData} alt={msg.message} className="max-w-full rounded-lg max-h-96" />
                            )}
                            {isVideo && (
                              <video controls className="max-w-full rounded-lg max-h-96">
                                <source src={msg.fileData} type={msg.fileType} />
                              </video>
                            )}
                            {isAudio && (
                              <audio controls className="w-full">
                                <source src={msg.fileData} type={msg.fileType} />
                              </audio>
                            )}
                            <div className="text-sm">{msg.message}</div>
                          </div>
                        ) : (
                          <div className="text-sm break-words">{msg.message}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </Card>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 bg-white border-t border-border px-4 py-4 shadow-lg sm:rounded-b-3xl">
              <div className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                  title="Upload file"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  title="Upload file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 min-h-12 bg-[#f9fafb] border-0 rounded-lg px-3 text-sm shadow-sm focus:shadow-md"
                  maxLength={1000}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-12 h-12 bg-[#00b388] hover:bg-[#009670] text-white rounded-lg disabled:opacity-50 shadow-md hover:shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
