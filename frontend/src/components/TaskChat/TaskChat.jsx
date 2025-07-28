import { useEffect, useState } from "react";
import { MessageSquare, X, Send, Users, Wifi, WifiOff } from "lucide-react";
import {
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
} from "@microsoft/signalr";

const TaskChatWidget = ({ taskId, userName, apiBaseUrl, position = "bottom-right" }) => {
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  useEffect(() => {
    if (!taskId || !apiBaseUrl) {
      console.warn("taskId veya apiBaseUrl eksik.");
      return;
    }

    const connect = new HubConnectionBuilder()
      .withUrl(`${apiBaseUrl}/chatHub`, { withCredentials: true })
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

    connect.on("ReceiveMessage", (user, receivedMessage) => {
      setMessages((prev) => [...prev, { user, message: receivedMessage, timestamp: new Date() }]);
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    });

    connect.onreconnecting(() => {
      setIsConnected(false);
    });

    connect.onreconnected(() => {
      setIsConnected(true);
    });

    setConnection(connect);
    startConnection();

    return () => {
      if (connect.state === HubConnectionState.Connected) {
        connect.invoke("LeaveTaskGroup", taskId).catch(console.error);
      }
      connect.stop();
    };
  }, [taskId, apiBaseUrl, isOpen]);

  useEffect(() => {
    if (!taskId || !apiBaseUrl) return;

    fetch(`${apiBaseUrl}/api/Chat/GetTaskChat/${taskId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.map((m) => ({ 
          user: `${m.userId}`, 
          message: m.message,
          timestamp: new Date(m.timestamp || Date.now())
        })));
      })
      .catch(err => console.error("Mesajlar yüklenirken hata:", err));
  }, [taskId, apiBaseUrl]);

  const sendMessage = async () => {
    if (
      connection &&
      connection.state === HubConnectionState.Connected &&
      message.trim()
    ) {
      try {
        await connection.invoke("SendMessageToTask", taskId, userName, message);
        setMessage("");
      } catch (err) {
        console.error("❌ Mesaj gönderilemedi:", err);
      }
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
                <h3 className="font-semibold text-sm">Görev Sohbeti</h3>
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
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-500 text-sm">Henüz mesaj yok</p>
                <p className="text-gray-400 text-xs">İlk mesajı gönderin!</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isCurrentUser = msg.user === userName;
                return (
                  <div
                    key={i}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md shadow-sm border'
                      }`}
                    >
                      {!isCurrentUser && (
                        <div className="text-xs font-medium text-blue-600 mb-1">
                          {msg.user}
                        </div>
                      )}
                      <div>{msg.message}</div>
                      <div className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </div>
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
                disabled={!isConnected}
              />
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={sendMessage}
                disabled={!isConnected || !message.trim()}
              >
                <Send size={16} />
              </button>
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