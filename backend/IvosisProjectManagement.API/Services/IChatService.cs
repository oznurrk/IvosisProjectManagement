public interface IChatService
{
    Task<List<ChatMessage>> GetTaskMessagesAsync(int taskId);
    Task<ChatMessage> SaveMessageAsync(int taskId, int userId, string message);
    Task<ChatMessage> UpdateMessageAsync(int messageId, string newMessage);
    Task<bool> DeleteMessageAsync(int messageId);

}
