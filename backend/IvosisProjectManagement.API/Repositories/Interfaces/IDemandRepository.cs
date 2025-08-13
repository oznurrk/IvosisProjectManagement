using IvosisProjectManagement.API.DTOs.Demand;
using IvosisProjectManagement.API.DTOs.Common;
using IvosisProjectManagement.API.Models.Demand;

namespace IvosisProjectManagement.API.Repositories.Interfaces
{
    public interface IDemandRepository
    {
        // Basic CRUD Operations
        Task<Demand?> GetByIdAsync(int id);
        Task<Demand?> GetByNumberAsync(string demandNumber);
        Task<PagedResult<Demand>> GetPagedAsync(DemandFilterDto filter);
        Task<List<Demand>> GetByProjectIdAsync(int projectId);
        Task<List<Demand>> GetByCompanyIdAsync(int companyId);
        Task<Demand> CreateAsync(Demand demand);
        Task<Demand> UpdateAsync(Demand demand);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> ExistsByNumberAsync(string demandNumber);

        // Demand Items Operations
        Task<DemandItem?> GetItemByIdAsync(int itemId);
        Task<List<DemandItem>> GetItemsByDemandIdAsync(int demandId);
        Task<DemandItem> CreateItemAsync(DemandItem item);
        Task<DemandItem> UpdateItemAsync(DemandItem item);
        Task<bool> DeleteItemAsync(int itemId);

        // Approval Operations
        Task<List<DemandApproval>> GetApprovalsByDemandIdAsync(int demandId);
        Task<List<DemandApproval>> GetPendingApprovalsByUserIdAsync(int userId);
        Task<DemandApproval> CreateApprovalAsync(DemandApproval approval);
        Task<DemandApproval> UpdateApprovalAsync(DemandApproval approval);

        // Comment Operations
        Task<List<DemandComment>> GetCommentsByDemandIdAsync(int demandId);
        Task<DemandComment> CreateCommentAsync(DemandComment comment);

        // Status and Priority
        Task<List<DemandStatus>> GetAllStatusesAsync();
        Task<List<DemandPriority>> GetAllPrioritiesAsync();
        Task<DemandStatus?> GetStatusByCodeAsync(string code);
        Task<DemandPriority?> GetPriorityByLevelAsync(int level);

        // Business Logic Queries
        Task<List<Demand>> GetOverdueDemands(int? companyId = null);
        Task<List<Demand>> GetDueSoonDemands(int days = 7, int? companyId = null);
        Task<DemandSummaryDto> GetSummaryAsync(int? companyId = null, int? userId = null);
        Task<string> GenerateNextDemandNumberAsync(int companyId);
        Task<bool> CanUserApproveDemandAsync(int demandId, int userId);
        Task<int> GetPendingApprovalsCountAsync(int userId);
    }
}