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
}