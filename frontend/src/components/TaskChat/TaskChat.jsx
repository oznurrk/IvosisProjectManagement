import { useEffect, useState } from "react";
import { MessageSquare, X, Send, Users, Wifi, WifiOff, Edit2, Trash2, Check } from "lucide-react";
import {
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
} from "@microsoft/signalr";

const TaskChatWidget = ({ taskId, userId, userName, apiBaseUrl, authToken, position = "bottom-right" }) => {
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [loading, setLoading] = useState(false);

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  // API Functions with proper error handling and authentication
  const chatAPI = {
    // GET /api/Chat/{taskId}
    getMessages: async (taskId) => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/Chat/${taskId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) throw new Error('Yetkilendirme hatası');
          if (response.status === 404) throw new Error('Görev bulunamadı');
          throw new Error('Mesajlar getirilemedi');
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Mesajlar yüklenirken hata:', error);
        throw error;
      }
    },

    // POST /api/Chat?taskId={taskId}&userId={userId}&message={message}
    sendMessage: async (taskId, userId, message) => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/Chat?taskId=${taskId}&userId=${userId}&message=${encodeURIComponent(message)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) throw new Error('Yetkilendirme hatası');
          throw new Error('Mesaj gönderilemedi');
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Mesaj gönderilirken hata:', error);
        throw error;
      }
    },

    // PUT /api/Chat/{messageId}?newMessage={newMessage}
    updateMessage: async (messageId, newMessage) => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/Chat/${messageId}?newMessage=${encodeURIComponent(newMessage)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) throw new Error('Yetkilendirme hatası');
          if (response.status === 404) throw new Error('Mesaj bulunamadı');
          throw new Error('Mesaj güncellenemedi');
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Mesaj güncellenirken hata:', error);
        throw error;
      }
    },

    // DELETE /api/Chat/{messageId}
    deleteMessage: async (messageId) => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/Chat/${messageId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) throw new Error('Yetkilendirme hatası');
          if (response.status === 404) throw new Error('Mesaj bulunamadı');
          throw new Error('Mesaj silinemedi');
        }
        
        return true;
      } catch (error) {
        console.error('Mesaj silinirken hata:', error);
        throw error;
      }
    }
  };

  // SignalR Connection Setup
  useEffect(() => {
    if (!taskId || !apiBaseUrl || !authToken) {
      console.warn("taskId, apiBaseUrl veya authToken eksik.");
      return;
    }

    const connect = new HubConnectionBuilder()
      .withUrl(`${apiBaseUrl}/chatHub`, { 
        withCredentials: true,
        accessTokenFactory: () => authToken
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    const startConnection = async () => {
      try {
        await connect.start();
        console.log("✅ SignalR bağlantısı kuruldu");
        setIsConnected(true);

        await connect.invoke("JoinTaskGroup", taskId);
        console.log(`👥 Gruba katıldı: ${taskId}`);
      } catch (err) {
        console.error("❌ Bağlantı kurulurken hata oluştu:", err);
        setIsConnected(false);
      }
    };

    // SignalR Event Handlers
    connect.on("ReceiveMessage", (messageData) => {
      const newMessage = {
        id: messageData.id || Date.now(),
        taskId: messageData.taskId,
        userId: messageData.userId,
        userName: messageData.userName || userName,
        message: messageData.message,
        sentAt: new Date(messageData.sentAt || Date.now())
      };

      setMessages((prev) => [...prev, newMessage]);
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    });

    connect.on("MessageUpdated", (messageData) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageData.id 
          ? { 
              ...msg, 
              message: messageData.message, 
              isEdited: true,
              updatedAt: new Date()
            }
          : msg
      ));
    });

    connect.on("MessageDeleted", (messageId) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    });

    connect.onreconnecting(() => {
      setIsConnected(false);
    });

    connect.onreconnected(async () => {
      setIsConnected(true);
      try {
        await connect.invoke("JoinTaskGroup", taskId);
      } catch (err) {
        console.error("Yeniden bağlanırken gruba katılma hatası:", err);
      }
    });

    setConnection(connect);
    startConnection();

    return () => {
      if (connect.state === HubConnectionState.Connected) {
        connect.invoke("LeaveTaskGroup", taskId).catch(console.error);
      }
      connect.stop();
    };
  }, [taskId, apiBaseUrl, authToken, isOpen]);

  // Load initial messages
  useEffect(() => {
    if (!taskId || !apiBaseUrl || !authToken) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const data = await chatAPI.getMessages(taskId);
        
        const formattedMessages = data.map((m) => ({
          id: m.id,
          taskId: m.taskId,
          userId: m.userId,
          userName: m.userName || `User ${m.userId}`,
          message: m.message,
          sentAt: new Date(m.sentAt)
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error("Mesajlar yüklenirken hata:", error);
        
        // Hata türüne göre kullanıcı bildirimi
        if (error.message.includes('Yetkilendirme')) {
          alert('Giriş yapmanız gerekiyor!');
        } else {
          alert('Mesajlar yüklenirken bir hata oluştu!');
        }
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [taskId, apiBaseUrl, authToken]);

  // Send message function
  const sendMessage = async () => {
    if (!message.trim() || !userId) return;

    try {
      setLoading(true);
      
      // API üzerinden mesaj gönder
      const savedMessage = await chatAPI.sendMessage(taskId, userId, message.trim());
      
      // SignalR üzerinden gerçek zamanlı bildirim gönder
      if (connection && connection.state === HubConnectionState.Connected) {
        await connection.invoke("SendMessageToTask", taskId, userName, message.trim());
      }

      // Eğer SignalR çalışmıyorsa manuel olarak mesajı ekle
      if (!isConnected) {
        const newMessage = {
          id: savedMessage.id,
          taskId: savedMessage.taskId,
          userId: savedMessage.userId,
          userName: userName,
          message: savedMessage.message,
          sentAt: new Date(savedMessage.sentAt)
        };
        setMessages(prev => [...prev, newMessage]);
      }

      setMessage("");
    } catch (err) {
      console.error("❌ Mesaj gönderilemedi:", err);
      
      if (err.message.includes('Yetkilendirme')) {
        alert('Giriş yapmanız gerekiyor!');
      } else {
        alert('Mesaj gönderilirken bir hata oluştu!');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update message function
  const updateMessage = async (messageId, newText) => {
    if (!newText.trim()) return;

    try {
      setLoading(true);
      
      const updatedMessage = await chatAPI.updateMessage(messageId, newText.trim());

      // SignalR üzerinden güncelleme bildir
      if (connection && connection.state === HubConnectionState.Connected) {
        await connection.invoke("UpdateMessage", messageId, newText.trim());
      }

      // Eğer SignalR çalışmıyorsa manuel güncelle
      if (!isConnected) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, message: newText.trim(), isEdited: true }
            : msg
        ));
      }

      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      console.error("Mesaj güncellenirken hata:", error);
      
      if (error.message.includes('Yetkilendirme')) {
        alert('Bu işlem için yetkiniz yok!');
      } else if (error.message.includes('Mesaj bulunamadı')) {
        alert('Mesaj bulunamadı!');
      } else {
        alert('Mesaj güncellenirken bir hata oluştu!');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete message function
  const deleteMessage = async (messageId) => {
    if (!confirm("Bu mesajı silmek istediğinizden emin misiniz?")) return;

    try {
      setLoading(true);
      
      await chatAPI.deleteMessage(messageId);

      // SignalR üzerinden silme bildir
      if (connection && connection.state === HubConnectionState.Connected) {
        await connection.invoke("DeleteMessage", messageId);
      }

      // Eğer SignalR çalışmıyorsa manuel sil
      if (!isConnected) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
    } catch (error) {
      console.error("Mesaj silinirken hata:", error);
      
      if (error.message.includes('Yetkilendirme')) {
        alert('Bu işlem için yetkiniz yok!');
      } else if (error.message.includes('Mesaj bulunamadı')) {
        alert('Mesaj bulunamadı!');
      } else {
        alert('Mesaj silinirken bir hata oluştu!');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const startEditing = (messageId, currentText) => {
    setEditingMessageId(messageId);
    setEditingText(currentText);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleEditKeyPress = (e, messageId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      updateMessage(messageId, editingText);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  // Validation check
  if (!taskId || !userId || !apiBaseUrl || !authToken) {
    return (
      <div className={`fixed ${positionClasses[position]} z-50`}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium">Chat Widget Hatası</p>
          <p className="text-xs">Gerekli parametreler eksik: taskId, userId, apiBaseUrl, authToken</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare size={20} />
              <div>
                <h3 className="font-semibold text-sm">Görev Sohbeti #{taskId}</h3>
                <div className="flex items-center space-x-1 text-xs opacity-90">
                  {isConnected ? (
                    <>
                      <Wifi size={12} />
                      <span>Çevrimiçi</span>
                    </>
                  ) : (
                    <>
                      <WifiOff size={12} />
                      <span>Bağlanıyor...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="hover:bg-white/20 p-1 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {loading && messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Mesajlar yükleniyor...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-500 text-sm">Henüz mesaj yok</p>
                <p className="text-gray-400 text-xs">İlk mesajı gönderin!</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isCurrentUser = msg.userId === userId;
                const isEditing = editingMessageId === msg.id;
                
                return (
                  <div
                    key={i}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-2xl text-sm relative group ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md shadow-sm border'
                      }`}
                    >
                      {!isCurrentUser && (
                        <div className="text-xs font-medium text-blue-600 mb-1">
                          {msg.userName}
                        </div>
                      )}
                      
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyPress={(e) => handleEditKeyPress(e, msg.id)}
                            className="w-full p-2 text-gray-800 bg-white border rounded resize-none text-sm"
                            rows="2"
                            autoFocus
                          />
                          <div className="flex space-x-1">
                            <button
                              onClick={() => updateMessage(msg.id, editingText)}
                              className="text-green-600 hover:text-green-700"
                              disabled={loading}
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>{msg.message}</div>
                          {msg.isEdited && (
                            <div className={`text-xs italic ${
                              isCurrentUser ? 'text-blue-100' : 'text-gray-400'
                            }`}>
                              (düzenlendi)
                            </div>
                          )}
                        </>
                      )}
                      
                      <div className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {formatTime(msg.sentAt)}
                      </div>

                      {/* Message Actions - Only for current user */}
                      {isCurrentUser && !isEditing && (
                        <div className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-lg border p-1 flex space-x-1">
                          <button
                            onClick={() => startEditing(msg.id, msg.message)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Düzenle"
                            disabled={loading}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => deleteMessage(msg.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Sil"
                            disabled={loading}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Mesaj yazın..."
                disabled={loading}
                maxLength={1000}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={sendMessage}
                disabled={!message.trim() || loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1 text-right">
              {message.length}/1000
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <MessageSquare size={24} />
        
        {/* Connection Status Indicator */}
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-400' : 'bg-red-400'
        }`}>
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
        </div>

        {/* Unread Messages Badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>
    </div>
  );
};

export default TaskChatWidget;