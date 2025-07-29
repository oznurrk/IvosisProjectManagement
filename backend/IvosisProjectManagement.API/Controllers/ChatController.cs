using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpGet("{taskId}")]
    public async Task<IActionResult> GetMessages(int taskId)
    {
        var messages = await _chatService.GetTaskMessagesAsync(taskId);
        return Ok(messages);
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage(int taskId, int userId, string message)
    {
        var saved = await _chatService.SaveMessageAsync(taskId, userId, message);
        return Ok(saved);
    }

    [HttpPut("{messageId}")]
    public async Task<IActionResult> UpdateMessage(int messageId, string newMessage)
    {
        var updated = await _chatService.UpdateMessageAsync(messageId, newMessage);
        if (updated == null) return NotFound();
        return Ok(updated);
    }

    [HttpDelete("{messageId}")]
    public async Task<IActionResult> DeleteMessage(int messageId)
    {
        var result = await _chatService.DeleteMessageAsync(messageId);
        if (!result) return NotFound();
        return Ok();
    }
}