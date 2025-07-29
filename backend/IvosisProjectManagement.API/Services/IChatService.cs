public interface IChatService
{
   Task<List<ChatMessage>> GetTaskMessagesAsync(int taskId);
    Task<ChatMessage> SaveMessageAsync(int taskId, int userId, string message);
    Task<ChatMessage> UpdateMessageAsync(int id, string message);
    Task<bool> DeleteMessageAsync(int id);

}
