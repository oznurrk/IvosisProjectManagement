public interface IChatService
{
    Task<List<ChatMessage>> GetTaskMessagesAsync(int taskId);
}
