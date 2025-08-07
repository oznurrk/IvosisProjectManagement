namespace IvosisProjectManagement.API.DTOs
{
    public class TaskItemUpdateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int UpdatedBy { get; set; }
    }
}