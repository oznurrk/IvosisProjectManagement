namespace IvosisProjectManagement.API.DTOs.Demand
{
    public class DemandCommentDto
    {
        public int Id { get; set; }
        public int DemandId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
        public string CommentType { get; set; } = "GENERAL";
        public bool IsInternal { get; set; } = true;
        public DateTime CreatedAt { get; set; }
    }

    public class DemandCommentCreateDto
    {
        public int DemandId { get; set; }
        public string Comment { get; set; } = string.Empty;
        public string CommentType { get; set; } = "GENERAL";
        public bool IsInternal { get; set; } = true;
    }
}