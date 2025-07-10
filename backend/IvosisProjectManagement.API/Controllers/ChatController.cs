using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpGet("GetTaskChat/{taskId}")]
    public async Task<IActionResult> GetTaskChat(int taskId)
    {
        var messages = await _chatService.GetTaskMessagesAsync(taskId);
        return Ok(messages);
    }
}
