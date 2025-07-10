using IvosisProjectManagement.API.Data;
using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    private readonly ApplicationDbContext _context;

    public ChatHub(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task SendMessageToTask(int taskId, string userName, string message)
    {
        var userId = int.Parse(Context.User?.FindFirst("userId")?.Value ?? "0");

        // Veritabanına kaydet
        var chatMessage = new ChatMessage
        {
            TaskId = taskId,
            UserId = userId,
            Message = message,
            SentAt = DateTime.Now
        };

        _context.ChatMessages.Add(chatMessage);
        await _context.SaveChangesAsync();

        // Gruba yayınla
        await Clients.Group($"Task-{taskId}").SendAsync("ReceiveMessage", userName, message);
    }

    public async Task JoinTaskGroup(int taskId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Task-{taskId}");
    }

    public async Task LeaveTaskGroup(int taskId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Task-{taskId}");
    }
}
