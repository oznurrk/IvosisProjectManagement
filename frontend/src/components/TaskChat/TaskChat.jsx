import { useEffect, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";


const TaskChat = ({ taskId, userName, apiBaseUrl }) => {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

     useEffect(() => {
        const connect = new HubConnectionBuilder()
            .withUrl(`${apiBaseUrl}/chatHub`, { withCredentials: true })
            .configureLogging(LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        connect.start()
            .then(() => {
                console.log("Connected to SignalR");
                connect.invoke("JoinTaskGroup", taskId);
            })
            .catch(console.error);

        connect.on("ReceiveMessage", (user, receivedMessage) => {
            setMessages(prev => [...prev, { user, message: receivedMessage }]);
        });

        setConnection(connect);

        return () => {
            connect.invoke("LeaveTaskGroup", taskId);
            connect.stop();
        };
    }, [taskId, apiBaseUrl]);

     useEffect(() => {
        fetch(`${apiBaseUrl}/api/Chat/GetTaskChat/${taskId}`)
            .then(res => res.json())
            .then(data => {
                setMessages(data.map(m => ({ user:  `${m.userId}`, message: m.message })));
            });
    }, [taskId, apiBaseUrl]);

    const sendMessage = async () => {
        if (connection && message.trim()) {
            await connection.invoke("SendMessageToTask", taskId, userName, message);
            setMessage("");
        }
    };

    return(
        <div className="p-4 border rounded-xl w-full max-w-lg mx-auto">
            <div className="h-64 overflow-y-auto mb-4 p-2 bg-gray-100 rounded">
                {messages.map((msg, i) => (
                    <div key={i} className="mb-1">
                        <strong>{msg.user}: </strong>{msg.message}
                    </div>
                ))}
            </div>
            <div className="flex">
                <input
                    className="flex-1 border p-2 rounded-l"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mesaj yaz..."
                />
                <button
                    className="bg-blue-500 text-white px-4 rounded-r"
                    onClick={sendMessage}
                >
                    Gönder
                </button>
            </div>
        </div>
    );
};

export default TaskChat;