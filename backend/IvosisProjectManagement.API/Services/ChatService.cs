using IvosisProjectManagement.API.Data;
using Microsoft.EntityFrameworkCore;

public class ChatService : IChatService
{
    private readonly ApplicationDbContext _context;

    public ChatService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ChatMessage>> GetTaskMessagesAsync(int taskId)
    {
        return await _context.ChatMessages
            .Where(m => m.TaskId == taskId)
            .OrderBy(m => m.SentAt)
            .ToListAsync();
    }

   public async Task<ChatMessage> SaveMessageAsync(int taskId, int userId, string message)
    {
        var chatMessage = new ChatMessage
        {
            TaskId = taskId,
            UserId = userId,
            Message = message,
            SentAt = DateTime.UtcNow
        };

        _context.ChatMessages.Add(chatMessage);
        await _context.SaveChangesAsync();
        return chatMessage;
    }

    public async Task<ChatMessage> UpdateMessageAsync(int messageId, string newMessage)
    {
        var message = await _context.ChatMessages.FindAsync(messageId);
        if (message == null) return null;

        message.Message = newMessage;
        await _context.SaveChangesAsync();
        return message;
    }

    public async Task<bool> DeleteMessageAsync(int messageId)
    {
        var message = await _context.ChatMessages.FindAsync(messageId);
        if (message == null) return false;

        _context.ChatMessages.Remove(message);
        await _context.SaveChangesAsync();
        return true;
    }

}