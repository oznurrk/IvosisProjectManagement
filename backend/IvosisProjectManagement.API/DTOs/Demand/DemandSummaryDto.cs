namespace IvosisProjectManagement.API.DTOs.Demand
{
    public class DemandSummaryDto
    {
        public int TotalDemands { get; set; }
        public int PendingDemands { get; set; }
        public int ApprovedDemands { get; set; }
        public int RejectedDemands { get; set; }
        public int CompletedDemands { get; set; }
        public decimal TotalEstimatedBudget { get; set; }
        public decimal PendingBudget { get; set; }
        public decimal ApprovedBudget { get; set; }
        
        // By Priority
        public int CriticalDemands { get; set; }
        public int UrgentDemands { get; set; }
        public int HighDemands { get; set; }
        public int NormalDemands { get; set; }
        public int LowDemands { get; set; }
        
        // By Time
        public int OverdueDemands { get; set; }
        public int DueSoonDemands { get; set; } // 7 gün içinde
        
        // Approval Statistics
        public int PendingApprovals { get; set; }
        public int MyPendingApprovals { get; set; }
        public double AverageApprovalDays { get; set; }
    }
}