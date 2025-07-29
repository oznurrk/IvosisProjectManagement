namespace IvosisProjectManagement.API.Dtos
{
    public class ChatMessageDto
    {
        public int UserId { get; set; }
        public string Message { get; set; }
        public DateTime SentAt { get; set; }
    }
    public class ChatMessageUpdateDto
    {
        public int Id { get; set; }
        public string Message { get; set; }
    }
    public class ChatMessageCreateDto
    {
        public int TaskId { get; set; }
        public int UserId { get; set; }
        public string Message { get; set; }
    }
}