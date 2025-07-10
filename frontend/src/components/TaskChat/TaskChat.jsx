import { useEffect, useState } from "react";
import {
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
} from "@microsoft/signalr";

const TaskChat = ({ taskId, userName, apiBaseUrl }) => {
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  

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
      }
    };

    connect.on("ReceiveMessage", (user, receivedMessage) => {
      setMessages((prev) => [...prev, { user, message: receivedMessage }]);
    });

    setConnection(connect);
    startConnection();

    return () => {
      if (connect.state === HubConnectionState.Connected) {
        connect.invoke("LeaveTaskGroup", taskId).catch(console.error);
      }
      connect.stop();
    };
  }, [taskId, apiBaseUrl]);

  useEffect(() => {
    if (!taskId || !apiBaseUrl) return;

    fetch(`${apiBaseUrl}/api/Chat/GetTaskChat/${taskId}`)
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.map((m) => ({ user: `${m.userId}`, message: m.message })));
      });
  }, [taskId, apiBaseUrl]);

  const sendMessage = async () => {
    console.log("🔄 Bağlantı durumu:", connection?.state);
    console.log("✉️ Mesaj:", message);

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
    } else {
      console.warn("⚠️ Bağlantı hazır değil veya mesaj boş.");
    }
  };

  return (
    <div className="p-4 border rounded-xl w-full max-w-lg mx-auto bg-white shadow">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-700">🗨️ Görev Sohbeti</h2>
        <span
          className={`text-sm font-medium ${
            isConnected ? "text-green-600" : "text-red-500"
          }`}
        >
          {isConnected ? "Bağlı" : "Bağlanıyor..."}
        </span>
      </div>

      <div className="h-64 overflow-y-auto mb-4 p-2 bg-gray-100 rounded">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm italic">Henüz mesaj yok.</p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="mb-1 text-sm">
              <strong className="text-blue-700">{msg.user}:</strong> {msg.message}
            </div>
          ))
        )}
      </div>

      <div className="flex">
        <input
          className="flex-1 border p-2 rounded-l text-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mesaj yaz..."
        />
        <button
          className="bg-blue-500 text-white px-4 rounded-r text-sm disabled:opacity-50 transition-all"
          onClick={sendMessage}
          disabled={!isConnected || !message.trim()}
        >
          Gönder
        </button>
      </div>
    </div>
  );
};

export default TaskChat;
