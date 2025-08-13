using IvosisProjectManagement.API.DTOs.Demand;
using IvosisProjectManagement.API.DTOs.Common;

namespace IvosisProjectManagement.API.Services.Interfaces
{
    public interface IDemandService
    {
       // Basic CRUD Operations
        Task<Result<DemandDto>> GetByIdAsync(int id);
        Task<Result<DemandDto>> GetByNumberAsync(string demandNumber);
        Task<Result<PagedResult<DemandDto>>> GetPagedAsync(DemandFilterDto filter);
        Task<Result<List<DemandDto>>> GetByProjectIdAsync(int projectId);
        Task<Result<DemandDto>> CreateAsync(DemandCreateDto createDto, int currentUserId);
        Task<Result<DemandDto>> UpdateAsync(int id, DemandUpdateDto updateDto, int currentUserId);
        Task<Result<bool>> DeleteAsync(int id, int currentUserId);

        // Demand Items Operations
        Task<Result<List<DemandItemDto>>> GetItemsByDemandIdAsync(int demandId);
        Task<Result<DemandItemDto>> CreateItemAsync(int demandId, DemandItemCreateDto createDto, int currentUserId);
        Task<Result<DemandItemDto>> UpdateItemAsync(int itemId, DemandItemUpdateDto updateDto, int currentUserId);
        Task<Result<bool>> DeleteItemAsync(int itemId, int currentUserId);

        // Approval Operations
        Task<Result<List<DemandApprovalDetailDto>>> GetApprovalsByDemandIdAsync(int demandId);
        Task<Result<List<DemandApprovalDetailDto>>> GetMyPendingApprovalsAsync(int userId);
        Task<Result<bool>> ProcessApprovalAsync(DemandApprovalProcessDto processDto, int currentUserId);
        Task<Result<bool>> CreateApprovalWorkflowAsync(int demandId, List<DemandApprovalCreateDto> approvals, int currentUserId);

        // Comment Operations
        Task<Result<List<DemandCommentDto>>> GetCommentsByDemandIdAsync(int demandId);
        Task<Result<DemandCommentDto>> CreateCommentAsync(DemandCommentCreateDto createDto, int currentUserId);

        // Status and Priority Operations
        Task<Result<List<DemandStatusDto>>> GetAllStatusesAsync();
        Task<Result<List<DemandPriorityDto>>> GetAllPrioritiesAsync();

        // Business Logic Operations
        Task<Result<DemandSummaryDto>> GetSummaryAsync(int? companyId = null, int? userId = null);
        Task<Result<List<DemandDto>>> GetOverdueDemandsAsync(int? companyId = null);
        Task<Result<List<DemandDto>>> GetDueSoonDemandsAsync(int days = 7, int? companyId = null);
        Task<Result<bool>> ApproveDemandAsync(int demandId, DemandApprovalDto approvalDto, int currentUserId);
        Task<Result<bool>> RejectDemandAsync(int demandId, string rejectionReason, int currentUserId);
        Task<Result<string>> GenerateNextDemandNumberAsync(int companyId);
    }
}
