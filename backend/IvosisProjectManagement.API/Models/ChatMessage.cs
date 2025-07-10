using IvosisProjectManagement.API.Models;

public class ChatMessage
{
    public int Id { get; set; }
    public int TaskId { get; set; }
    public int UserId { get; set; }
    public string Message { get; set; }
    public DateTime SentAt { get; set; }
    public virtual TaskItem Task { get; set; }
    public virtual User User { get; set; }
}
