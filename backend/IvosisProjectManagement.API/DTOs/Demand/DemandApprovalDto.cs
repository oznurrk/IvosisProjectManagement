namespace IvosisProjectManagement.API.DTOs.Demand
{
    public class DemandApprovalDetailDto:BaseDto
    {
        public int Id { get; set; }
        public int DemandId { get; set; }
        public string DemandNumber { get; set; } = string.Empty;
        public string DemandTitle { get; set; } = string.Empty;
        
        // Approval Information
        public int ApprovalLevel { get; set; }
        public int ApproverUserId { get; set; }
        public string ApproverName { get; set; } = string.Empty;
        public string ApprovalStatus { get; set; } = "PENDING";
        public DateTime? ApprovalDate { get; set; }
        public string? ApprovalNotes { get; set; }
        
        // Workflow Information
        public int SortOrder { get; set; }
        public bool IsRequired { get; set; }
        public bool IsCompleted { get; set; }
        
        // Time Information
        public DateTime CreatedAt { get; set; }
        public int WaitingDays => ApprovalDate.HasValue ? 0 : (DateTime.Now - CreatedAt).Days;
    }

    public class DemandApprovalCreateDto
    {
        public int DemandId { get; set; }
        public int ApprovalLevel { get; set; }
        public int ApproverUserId { get; set; }
        public int SortOrder { get; set; }
        public bool IsRequired { get; set; } = true;
    }

    public class DemandApprovalProcessDto
    {
        public int ApprovalId { get; set; }
        public string ApprovalStatus { get; set; } = "APPROVED"; // APPROVED, REJECTED
        public string? ApprovalNotes { get; set; }
    }
}