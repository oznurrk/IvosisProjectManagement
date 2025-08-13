namespace IvosisProjectManagement.API.DTOs.Demand
{
    public class DemandDto : BaseDto
    {
        public string DemandNumber { get; set; } = string.Empty;
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        
        // Status and Priority Info
        public int StatusId { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public string StatusCode { get; set; } = string.Empty;
        public string? StatusColor { get; set; }
        
        public int PriorityId { get; set; }
        public string PriorityName { get; set; } = string.Empty;
        public string PriorityCode { get; set; } = string.Empty;
        public int PriorityLevel { get; set; }
        public string? PriorityColor { get; set; }
        
        // Date Information
        public DateTime RequestedDate { get; set; }
        public DateTime RequiredDate { get; set; }
        public DateTime? ApprovedDate { get; set; }
        
        // Approval Information
        public bool IsApproved { get; set; }
        public int? ApprovedBy { get; set; }
        public string? ApprovedByName { get; set; }
        public string? ApprovalNotes { get; set; }
        
        // Budget Information
        public decimal? EstimatedBudget { get; set; }
        public string Currency { get; set; } = "TRY";
        
        // Additional Info
        public string? Notes { get; set; }
        public List<string>? Attachments { get; set; }
        
        // Company Info
        public string CompanyName { get; set; } = string.Empty;
        public string CompanyCode { get; set; } = string.Empty;
        
        // Statistics
        public int TotalItems { get; set; }
        public int ApprovedItems { get; set; }
        public decimal? TotalEstimatedAmount { get; set; }
        
        // Items
        public List<DemandItemDto> DemandItems { get; set; } = new List<DemandItemDto>();
    }

    public class DemandCreateDto
    {
        public int ProjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int PriorityId { get; set; }
        public DateTime RequiredDate { get; set; }
        public decimal? EstimatedBudget { get; set; }
        public string Currency { get; set; } = "TRY";
        public string? Notes { get; set; }
        public List<string>? Attachments { get; set; }
        public List<DemandItemCreateDto> Items { get; set; } = new List<DemandItemCreateDto>();
    }

    public class DemandUpdateDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int PriorityId { get; set; }
        public DateTime RequiredDate { get; set; }
        public decimal? EstimatedBudget { get; set; }
        public string Currency { get; set; } = "TRY";
        public string? Notes { get; set; }
        public List<string>? Attachments { get; set; }
    }

    public class DemandApprovalDto
    {
        public bool IsApproved { get; set; }
        public string? ApprovalNotes { get; set; }
    }

    public class DemandFilterDto:CompanyDto
    {
        public int? ProjectId { get; set; }
        public int? StatusId { get; set; }
        public int? PriorityId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IsApproved { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SearchTerm { get; set; }
        public string SortBy { get; set; } = "CreatedAt";
        public string SortDirection { get; set; } = "desc";
    }
}