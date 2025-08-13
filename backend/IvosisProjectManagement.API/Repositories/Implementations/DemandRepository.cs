using Microsoft.EntityFrameworkCore;
using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.Models.Demand;
using IvosisProjectManagement.API.DTOs.Demand;
using IvosisProjectManagement.API.DTOs.Common;
using IvosisProjectManagement.API.Repositories.Interfaces;

namespace IvosisProjectManagement.API.Repositories.Implementations
{
    public class DemandRepository : IDemandRepository
    {
        private readonly ApplicationDbContext _context;

        public DemandRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        #region Basic CRUD Operations

        public async Task<Demand?> GetByIdAsync(int id)
        {
            return await _context.Demands
                .Include(d => d.Status)
                .Include(d => d.Priority)
                .Include(d => d.Project)
                .Include(d => d.Company)
                .Include(d => d.CreatedByUser)
                .Include(d => d.UpdatedByUser)
                .Include(d => d.ApprovedByUser)
                .Include(d => d.DemandItems)
                    .ThenInclude(di => di.Unit)
                .Include(d => d.DemandItems)
                    .ThenInclude(di => di.StockItem)
                .Include(d => d.DemandItems)
                    .ThenInclude(di => di.SuggestedSupplier)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<Demand?> GetByNumberAsync(string demandNumber)
        {
            return await _context.Demands
                .Include(d => d.Status)
                .Include(d => d.Priority)
                .Include(d => d.Project)
                .Include(d => d.Company)
                .FirstOrDefaultAsync(d => d.DemandNumber == demandNumber);
        }

        public async Task<PagedResult<Demand>> GetPagedAsync(DemandFilterDto filter)
        {
            var query = _context.Demands
                .Include(d => d.Status)
                .Include(d => d.Priority)
                .Include(d => d.Project)
                .Include(d => d.Company)
                .Include(d => d.CreatedByUser)
                .AsQueryable();

            // Apply filters
            if (filter.ProjectId.HasValue)
                query = query.Where(d => d.ProjectId == filter.ProjectId.Value);

            if (filter.StatusId.HasValue)
                query = query.Where(d => d.StatusId == filter.StatusId.Value);

            if (filter.PriorityId.HasValue)
                query = query.Where(d => d.PriorityId == filter.PriorityId.Value);

            if (filter.StartDate.HasValue)
                query = query.Where(d => d.RequestedDate >= filter.StartDate.Value);

            if (filter.EndDate.HasValue)
                query = query.Where(d => d.RequestedDate <= filter.EndDate.Value);

            if (filter.CreatedBy != null && filter.CreatedBy != 0)
                query = query.Where(d => d.CreatedBy == filter.CreatedBy);

            if (filter.IsApproved.HasValue)
                query = query.Where(d => d.IsApproved == filter.IsApproved.Value);

            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(d => 
                    d.DemandNumber.ToLower().Contains(searchTerm) ||
                    d.Title.ToLower().Contains(searchTerm) ||
                    d.Description != null && d.Description.ToLower().Contains(searchTerm));
            }

            // Apply sorting
            query = filter.SortBy.ToLower() switch
            {
                "demandnumber" => filter.SortDirection.ToLower() == "desc" 
                    ? query.OrderByDescending(d => d.DemandNumber)
                    : query.OrderBy(d => d.DemandNumber),
                "title" => filter.SortDirection.ToLower() == "desc"
                    ? query.OrderByDescending(d => d.Title)
                    : query.OrderBy(d => d.Title),
                "requireddate" => filter.SortDirection.ToLower() == "desc"
                    ? query.OrderByDescending(d => d.RequiredDate)
                    : query.OrderBy(d => d.RequiredDate),
                "priority" => filter.SortDirection.ToLower() == "desc"
                    ? query.OrderByDescending(d => d.Priority.Level)
                    : query.OrderBy(d => d.Priority.Level),
                _ => filter.SortDirection.ToLower() == "desc"
                    ? query.OrderByDescending(d => d.CreatedAt)
                    : query.OrderBy(d => d.CreatedAt)
            };

            var totalRecords = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalRecords / filter.PageSize);

            var data = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return new PagedResult<Demand>
            {
                Items = data,
                TotalCount = totalRecords,
                TotalPages = totalPages,
                Page = filter.Page,
                PageSize = filter.PageSize
            };
        }

        public async Task<List<Demand>> GetByProjectIdAsync(int projectId)
        {
            return await _context.Demands
                .Include(d => d.Status)
                .Include(d => d.Priority)
                .Where(d => d.ProjectId == projectId)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Demand>> GetByCompanyIdAsync(int companyId)
        {
            return await _context.Demands
                .Include(d => d.Status)
                .Include(d => d.Priority)
                .Include(d => d.Project)
                .Where(d => d.CompanyId == companyId)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task<Demand> CreateAsync(Demand demand)
        {
            _context.Demands.Add(demand);
            await _context.SaveChangesAsync();
            return demand;
        }

        public async Task<Demand> UpdateAsync(Demand demand)
        {
            demand.UpdatedAt = DateTime.Now;
            _context.Demands.Update(demand);
            await _context.SaveChangesAsync();
            return demand;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var demand = await _context.Demands.FindAsync(id);
            if (demand == null) return false;

            _context.Demands.Remove(demand);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Demands.AnyAsync(d => d.Id == id);
        }

        public async Task<bool> ExistsByNumberAsync(string demandNumber)
        {
            return await _context.Demands.AnyAsync(d => d.DemandNumber == demandNumber);
        }

        #endregion

        #region Demand Items Operations

        public async Task<DemandItem?> GetItemByIdAsync(int itemId)
        {
            return await _context.DemandItems
                .Include(di => di.Demand)
                .Include(di => di.Unit)
                .Include(di => di.StockItem)
                .Include(di => di.SuggestedSupplier)
                .FirstOrDefaultAsync(di => di.Id == itemId);
        }

        public async Task<List<DemandItem>> GetItemsByDemandIdAsync(int demandId)
        {
            return await _context.DemandItems
                .Include(di => di.Unit)
                .Include(di => di.StockItem)
                .Include(di => di.SuggestedSupplier)
                .Where(di => di.DemandId == demandId)
                .OrderBy(di => di.Id)
                .ToListAsync();
        }

        public async Task<DemandItem> CreateItemAsync(DemandItem item)
        {
            _context.DemandItems.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<DemandItem> UpdateItemAsync(DemandItem item)
        {
            item.UpdatedAt = DateTime.Now;
            _context.DemandItems.Update(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<bool> DeleteItemAsync(int itemId)
        {
            var item = await _context.DemandItems.FindAsync(itemId);
            if (item == null) return false;

            _context.DemandItems.Remove(item);
            await _context.SaveChangesAsync();
            return true;
        }

        #endregion

        #region Approval Operations

        public async Task<List<DemandApproval>> GetApprovalsByDemandIdAsync(int demandId)
        {
            return await _context.DemandApprovals
                .Include(da => da.ApproverUser)
                .Where(da => da.DemandId == demandId)
                .OrderBy(da => da.SortOrder)
                .ToListAsync();
        }

        public async Task<List<DemandApproval>> GetPendingApprovalsByUserIdAsync(int userId)
        {
            return await _context.DemandApprovals
                .Include(da => da.Demand)
                    .ThenInclude(d => d.Priority)
                .Include(da => da.Demand)
                    .ThenInclude(d => d.Status)
                .Where(da => da.ApproverUserId == userId && da.ApprovalStatus == "PENDING")
                .OrderBy(da => da.CreatedAt)
                .ToListAsync();
        }

        public async Task<DemandApproval> CreateApprovalAsync(DemandApproval approval)
        {
            _context.DemandApprovals.Add(approval);
            await _context.SaveChangesAsync();
            return approval;
        }

        public async Task<DemandApproval> UpdateApprovalAsync(DemandApproval approval)
        {
            _context.DemandApprovals.Update(approval);
            await _context.SaveChangesAsync();
            return approval;
        }

        #endregion

        #region Comment Operations

        public async Task<List<DemandComment>> GetCommentsByDemandIdAsync(int demandId)
        {
            return await _context.DemandComments
                .Include(dc => dc.User)
                .Where(dc => dc.DemandId == demandId)
                .OrderByDescending(dc => dc.CreatedAt)
                .ToListAsync();
        }

        public async Task<DemandComment> CreateCommentAsync(DemandComment comment)
        {
            _context.DemandComments.Add(comment);
            await _context.SaveChangesAsync();
            return comment;
        }

        #endregion

        #region Status and Priority

        public async Task<List<DemandStatus>> GetAllStatusesAsync()
        {
            return await _context.DemandStatuses
                .Where(ds => ds.IsActive)
                .OrderBy(ds => ds.SortOrder)
                .ToListAsync();
        }

        public async Task<List<DemandPriority>> GetAllPrioritiesAsync()
        {
            return await _context.DemandPriorities
                .Where(dp => dp.IsActive)
                .OrderBy(dp => dp.Level)
                .ToListAsync();
        }

        public async Task<DemandStatus?> GetStatusByCodeAsync(string code)
        {
            return await _context.DemandStatuses
                .FirstOrDefaultAsync(ds => ds.Code == code && ds.IsActive);
        }

        public async Task<DemandPriority?> GetPriorityByLevelAsync(int level)
        {
            return await _context.DemandPriorities
                .FirstOrDefaultAsync(dp => dp.Level == level && dp.IsActive);
        }

        #endregion

        #region Business Logic Queries

        public async Task<List<Demand>> GetOverdueDemands(int? companyId = null)
        {
            var query = _context.Demands
                .Include(d => d.Status)
                .Include(d => d.Priority)
                .Include(d => d.Project)
                .Where(d => d.RequiredDate < DateTime.Now && 
                           !new[] { "COMPLETED", "CANCELLED", "ORDERED" }.Contains(d.Status.Code));

            if (companyId.HasValue)
                query = query.Where(d => d.CompanyId == companyId.Value);

            return await query
                .OrderBy(d => d.RequiredDate)
                .ToListAsync();
        }

        public async Task<List<Demand>> GetDueSoonDemands(int days = 7, int? companyId = null)
        {
            var dueDate = DateTime.Now.AddDays(days);
            var query = _context.Demands
                .Include(d => d.Status)
                .Include(d => d.Priority)
                .Include(d => d.Project)
                .Where(d => d.RequiredDate <= dueDate && d.RequiredDate >= DateTime.Now &&
                           !new[] { "COMPLETED", "CANCELLED", "ORDERED" }.Contains(d.Status.Code));

            if (companyId.HasValue)
                query = query.Where(d => d.CompanyId == companyId.Value);

            return await query
                .OrderBy(d => d.RequiredDate)
                .ToListAsync();
        }

        public async Task<DemandSummaryDto> GetSummaryAsync(int? companyId = null, int? userId = null)
        {
            var demandsQuery = _context.Demands
                .Include(d => d.Status)
                .Include(d => d.Priority)
                .AsQueryable();

            if (companyId.HasValue)
                demandsQuery = demandsQuery.Where(d => d.CompanyId == companyId.Value);

            var demands = await demandsQuery.ToListAsync();

            var approvalsQuery = _context.DemandApprovals.AsQueryable();
            if (userId.HasValue)
                approvalsQuery = approvalsQuery.Where(da => da.ApproverUserId == userId.Value);

            var myPendingApprovals = userId.HasValue 
                ? await approvalsQuery.CountAsync(da => da.ApprovalStatus == "PENDING")
                : 0;

            return new DemandSummaryDto
            {
                TotalDemands = demands.Count,
                PendingDemands = demands.Count(d => d.Status.Code == "PENDING"),
                ApprovedDemands = demands.Count(d => d.Status.Code == "APPROVED"),
                RejectedDemands = demands.Count(d => d.Status.Code == "REJECTED"),
                CompletedDemands = demands.Count(d => d.Status.Code == "COMPLETED"),
                TotalEstimatedBudget = demands.Sum(d => d.EstimatedBudget ?? 0),
                PendingBudget = demands.Where(d => d.Status.Code == "PENDING").Sum(d => d.EstimatedBudget ?? 0),
                ApprovedBudget = demands.Where(d => d.Status.Code == "APPROVED").Sum(d => d.EstimatedBudget ?? 0),
                
                CriticalDemands = demands.Count(d => d.Priority.Level == 5),
                UrgentDemands = demands.Count(d => d.Priority.Level == 4),
                HighDemands = demands.Count(d => d.Priority.Level == 3),
                NormalDemands = demands.Count(d => d.Priority.Level == 2),
                LowDemands = demands.Count(d => d.Priority.Level == 1),
                
                OverdueDemands = demands.Count(d => d.RequiredDate < DateTime.Now && 
                    !new[] { "COMPLETED", "CANCELLED", "ORDERED" }.Contains(d.Status.Code)),
                DueSoonDemands = demands.Count(d => d.RequiredDate <= DateTime.Now.AddDays(7) && 
                    d.RequiredDate >= DateTime.Now && 
                    !new[] { "COMPLETED", "CANCELLED", "ORDERED" }.Contains(d.Status.Code)),
                
                PendingApprovals = await _context.DemandApprovals.CountAsync(da => da.ApprovalStatus == "PENDING"),
                MyPendingApprovals = myPendingApprovals
            };
        }

        public async Task<string> GenerateNextDemandNumberAsync(int companyId)
        {
            var company = await _context.Companies.FindAsync(companyId);
            var companyCode = company?.Code ?? "GEN";
            var year = DateTime.Now.Year;

            var lastDemand = await _context.Demands
                .Where(d => d.CompanyId == companyId && 
                           d.DemandNumber.StartsWith($"TAL-{companyCode}-{year}-"))
                .OrderByDescending(d => d.DemandNumber)
                .FirstOrDefaultAsync();

            int nextNumber = 1;
            if (lastDemand != null)
            {
                var lastNumberPart = lastDemand.DemandNumber.Split('-').LastOrDefault();
                if (int.TryParse(lastNumberPart, out int lastNumber))
                {
                    nextNumber = lastNumber + 1;
                }
            }

            return $"TAL-{companyCode}-{year}-{nextNumber:D4}";
        }

        public async Task<bool> CanUserApproveDemandAsync(int demandId, int userId)
        {
            return await _context.DemandApprovals
                .AnyAsync(da => da.DemandId == demandId && 
                               da.ApproverUserId == userId && 
                               da.ApprovalStatus == "PENDING");
        }

        public async Task<int> GetPendingApprovalsCountAsync(int userId)
        {
            return await _context.DemandApprovals
                .CountAsync(da => da.ApproverUserId == userId && da.ApprovalStatus == "PENDING");
        }

        #endregion
    }
}