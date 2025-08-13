using AutoMapper;
using IvosisProjectManagement.API.DTOs.Demand;
using IvosisProjectManagement.API.DTOs.Common;
using IvosisProjectManagement.API.Models.Demand;
using IvosisProjectManagement.API.Repositories.Interfaces;
using IvosisProjectManagement.API.Services.Interfaces;

namespace IvosisProjectManagement.API.Services.Implementations
{
    public class DemandService : IDemandService
    {
        private readonly IDemandRepository _demandRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<DemandService> _logger;

        public DemandService(
            IDemandRepository demandRepository, 
            IMapper mapper, 
            ILogger<DemandService> logger)
        {
            _demandRepository = demandRepository;
            _mapper = mapper;
            _logger = logger;
        }

        #region Basic CRUD Operations

        public async Task<Result<DemandDto>> GetByIdAsync(int id)
        {
            try
            {
                var demand = await _demandRepository.GetByIdAsync(id);
                if (demand == null)
                {
                    return Result<DemandDto>.Failure("Talep bulunamadı.");
                }

                var demandDto = _mapper.Map<DemandDto>(demand);
                return Result<DemandDto>.SuccessResult(demandDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep getirme hatası: {Id}", id);
                return Result<DemandDto>.Failure("Talep getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<DemandDto>> GetByNumberAsync(string demandNumber)
        {
            try
            {
                var demand = await _demandRepository.GetByNumberAsync(demandNumber);
                if (demand == null)
                {
                    return Result<DemandDto>.Failure("Talep bulunamadı.");
                }

                var demandDto = _mapper.Map<DemandDto>(demand);
                return Result<DemandDto>.SuccessResult(demandDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep getirme hatası: {DemandNumber}", demandNumber);
                return Result<DemandDto>.Failure("Talep getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<PagedResult<DemandDto>>> GetPagedAsync(DemandFilterDto filter)
        {
            try
            {
                var pagedDemands = await _demandRepository.GetPagedAsync(filter);
                var demandDtos = _mapper.Map<List<DemandDto>>(pagedDemands.Items);

                var result = new PagedResult<DemandDto>
                {
                    Items = demandDtos,
                    TotalCount = pagedDemands.TotalCount,
                    TotalPages = pagedDemands.TotalPages,
                    Page = pagedDemands.Page,
                    PageSize = pagedDemands.PageSize
                };

                return Result<PagedResult<DemandDto>>.SuccessResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Sayfalı talep listesi getirme hatası");
                return Result<PagedResult<DemandDto>>.Failure("Talep listesi getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<List<DemandDto>>> GetByProjectIdAsync(int projectId)
        {
            try
            {
                var demands = await _demandRepository.GetByProjectIdAsync(projectId);
                var demandDtos = _mapper.Map<List<DemandDto>>(demands);
                return Result<List<DemandDto>>.SuccessResult(demandDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Proje talepler getirme hatası: {ProjectId}", projectId);
                return Result<List<DemandDto>>.Failure("Proje talepleri getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<DemandDto>> CreateAsync(DemandCreateDto createDto, int currentUserId)
        {
            try
            {
                // Generate demand number
                var demandNumberResult = await GenerateNextDemandNumberAsync(createDto.ProjectId);
                if (!demandNumberResult.Success)
                {
                    return Result<DemandDto>.Failure("Talep numarası oluşturulamadı.");
                }

                // Get default status (DRAFT)
                var defaultStatus = await _demandRepository.GetStatusByCodeAsync("DRAFT");
                if (defaultStatus == null)
                {
                    return Result<DemandDto>.Failure("Varsayılan talep durumu bulunamadı.");
                }

                var demand = _mapper.Map<Demand>(createDto);
                demand.DemandNumber = demandNumberResult.Data!;
                demand.StatusId = defaultStatus.Id;
                demand.CreatedBy = currentUserId;
                demand.CreatedAt = DateTime.Now;

                // Create demand
                var createdDemand = await _demandRepository.CreateAsync(demand);

                // Create demand items
                foreach (var itemDto in createDto.Items)
                {
                    var item = _mapper.Map<DemandItem>(itemDto);
                    item.DemandId = createdDemand.Id;
                    item.CreatedBy = currentUserId;
                    item.CreatedAt = DateTime.Now;
                    await _demandRepository.CreateItemAsync(item);
                }

                // Get full demand with relations
                var fullDemand = await _demandRepository.GetByIdAsync(createdDemand.Id);
                var demandDto = _mapper.Map<DemandDto>(fullDemand);

                _logger.LogInformation("Yeni talep oluşturuldu: {DemandNumber} by User: {UserId}", 
                    demand.DemandNumber, currentUserId);

                return Result<DemandDto>.SuccessResult(demandDto, "Talep başarıyla oluşturuldu.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep oluşturma hatası. User: {UserId}", currentUserId);
                return Result<DemandDto>.Failure("Talep oluşturulurken bir hata oluştu.");
            }
        }

        public async Task<Result<DemandDto>> UpdateAsync(int id, DemandUpdateDto updateDto, int currentUserId)
        {
            try
            {
                var existingDemand = await _demandRepository.GetByIdAsync(id);
                if (existingDemand == null)
                {
                    return Result<DemandDto>.Failure("Talep bulunamadı.");
                }

                // Check if user can update
                if (!CanUserModifyDemand(existingDemand, currentUserId))
                {
                    return Result<DemandDto>.Failure("Bu talebi güncelleme yetkiniz yok.");
                }

                // Update demand properties
                _mapper.Map(updateDto, existingDemand);
                existingDemand.UpdatedBy = currentUserId;
                existingDemand.UpdatedAt = DateTime.Now;

                var updatedDemand = await _demandRepository.UpdateAsync(existingDemand);
                var demandDto = _mapper.Map<DemandDto>(updatedDemand);

                _logger.LogInformation("Talep güncellendi: {DemandNumber} by User: {UserId}", 
                    existingDemand.DemandNumber, currentUserId);

                return Result<DemandDto>.SuccessResult(demandDto, "Talep başarıyla güncellendi.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep güncelleme hatası: {Id} by User: {UserId}", id, currentUserId);
                return Result<DemandDto>.Failure("Talep güncellenirken bir hata oluştu.");
            }
        }

        public async Task<Result<bool>> DeleteAsync(int id, int currentUserId)
        {
            try
            {
                var demand = await _demandRepository.GetByIdAsync(id);
                if (demand == null)
                {
                    return Result<bool>.Failure("Talep bulunamadı.");
                }

                // Check if user can delete
                if (!CanUserModifyDemand(demand, currentUserId))
                {
                    return Result<bool>.Failure("Bu talebi silme yetkiniz yok.");
                }

                // Check if demand can be deleted (only DRAFT status)
                if (demand.Status.Code != "DRAFT")
                {
                    return Result<bool>.Failure("Sadece taslak durumundaki talepler silinebilir.");
                }

                var deleted = await _demandRepository.DeleteAsync(id);
                if (!deleted)
                {
                    return Result<bool>.Failure("Talep silinemedi.");
                }

                _logger.LogInformation("Talep silindi: {DemandNumber} by User: {UserId}", 
                    demand.DemandNumber, currentUserId);

                return Result<bool>.SuccessResult(true, "Talep başarıyla silindi.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep silme hatası: {Id} by User: {UserId}", id, currentUserId);
                return Result<bool>.Failure("Talep silinirken bir hata oluştu.");
            }
        }

        #endregion

        #region Demand Items Operations

        public async Task<Result<List<DemandItemDto>>> GetItemsByDemandIdAsync(int demandId)
        {
            try
            {
                var items = await _demandRepository.GetItemsByDemandIdAsync(demandId);
                var itemDtos = _mapper.Map<List<DemandItemDto>>(items);
                return Result<List<DemandItemDto>>.SuccessResult(itemDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep kalemleri getirme hatası: {DemandId}", demandId);
                return Result<List<DemandItemDto>>.Failure("Talep kalemleri getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<DemandItemDto>> CreateItemAsync(int demandId, DemandItemCreateDto createDto, int currentUserId)
        {
            try
            {
                var demand = await _demandRepository.GetByIdAsync(demandId);
                if (demand == null)
                {
                    return Result<DemandItemDto>.Failure("Talep bulunamadı.");
                }

                if (!CanUserModifyDemand(demand, currentUserId))
                {
                    return Result<DemandItemDto>.Failure("Bu talebe kalem ekleme yetkiniz yok.");
                }

                var item = _mapper.Map<DemandItem>(createDto);
                item.DemandId = demandId;
                item.CreatedBy = currentUserId;
                item.CreatedAt = DateTime.Now;

                var createdItem = await _demandRepository.CreateItemAsync(item);
                var itemDto = _mapper.Map<DemandItemDto>(createdItem);

                return Result<DemandItemDto>.SuccessResult(itemDto, "Talep kalemi başarıyla eklendi.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep kalemi oluşturma hatası: {DemandId}", demandId);
                return Result<DemandItemDto>.Failure("Talep kalemi oluşturulurken bir hata oluştu.");
            }
        }

        public async Task<Result<DemandItemDto>> UpdateItemAsync(int itemId, DemandItemUpdateDto updateDto, int currentUserId)
        {
            try
            {
                var item = await _demandRepository.GetItemByIdAsync(itemId);
                if (item == null)
                {
                    return Result<DemandItemDto>.Failure("Talep kalemi bulunamadı.");
                }

                if (!CanUserModifyDemand(item.Demand, currentUserId))
                {
                    return Result<DemandItemDto>.Failure("Bu talep kalemini güncelleme yetkiniz yok.");
                }

                _mapper.Map(updateDto, item);
                item.UpdatedBy = currentUserId;
                item.UpdatedAt = DateTime.Now;

                var updatedItem = await _demandRepository.UpdateItemAsync(item);
                var itemDto = _mapper.Map<DemandItemDto>(updatedItem);

                return Result<DemandItemDto>.SuccessResult(itemDto, "Talep kalemi başarıyla güncellendi.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep kalemi güncelleme hatası: {ItemId}", itemId);
                return Result<DemandItemDto>.Failure("Talep kalemi güncellenirken bir hata oluştu.");
            }
        }

        public async Task<Result<bool>> DeleteItemAsync(int itemId, int currentUserId)
        {
            try
            {
                var item = await _demandRepository.GetItemByIdAsync(itemId);
                if (item == null)
                {
                    return Result<bool>.Failure("Talep kalemi bulunamadı.");
                }

                if (!CanUserModifyDemand(item.Demand, currentUserId))
                {
                    return Result<bool>.Failure("Bu talep kalemini silme yetkiniz yok.");
                }

                var deleted = await _demandRepository.DeleteItemAsync(itemId);
                return deleted 
                    ? Result<bool>.SuccessResult(true, "Talep kalemi başarıyla silindi.")
                    : Result<bool>.Failure("Talep kalemi silinemedi.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep kalemi silme hatası: {ItemId}", itemId);
                return Result<bool>.Failure("Talep kalemi silinirken bir hata oluştu.");
            }
        }

        #endregion

        #region Approval Operations

        public async Task<Result<List<DemandApprovalDetailDto>>> GetApprovalsByDemandIdAsync(int demandId)
        {
            try
            {
                var approvals = await _demandRepository.GetApprovalsByDemandIdAsync(demandId);
                var approvalDtos = _mapper.Map<List<DemandApprovalDetailDto>>(approvals);
                return Result<List<DemandApprovalDetailDto>>.SuccessResult(approvalDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep onayları getirme hatası: {DemandId}", demandId);
                return Result<List<DemandApprovalDetailDto>>.Failure("Talep onayları getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<List<DemandApprovalDetailDto>>> GetMyPendingApprovalsAsync(int userId)
        {
            try
            {
                var approvals = await _demandRepository.GetPendingApprovalsByUserIdAsync(userId);
                var approvalDtos = _mapper.Map<List<DemandApprovalDetailDto>>(approvals);
                return Result<List<DemandApprovalDetailDto>>.SuccessResult(approvalDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bekleyen onaylar getirme hatası: {UserId}", userId);
                return Result<List<DemandApprovalDetailDto>>.Failure("Bekleyen onaylar getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<bool>> ProcessApprovalAsync(DemandApprovalProcessDto processDto, int currentUserId)
        {
            try
            {
                var approval = await _demandRepository.GetApprovalsByDemandIdAsync(processDto.ApprovalId);
                var userApproval = approval.FirstOrDefault(a => a.Id == processDto.ApprovalId && a.ApproverUserId == currentUserId);
                
                if (userApproval == null)
                {
                    return Result<bool>.Failure("Onay kaydı bulunamadı veya yetkiniz yok.");
                }

                if (userApproval.ApprovalStatus != "PENDING")
                {
                    return Result<bool>.Failure("Bu onay zaten işlenmiş.");
                }

                userApproval.ApprovalStatus = processDto.ApprovalStatus;
                userApproval.ApprovalDate = DateTime.Now;
                userApproval.ApprovalNotes = processDto.ApprovalNotes;
                userApproval.IsCompleted = true;

                await _demandRepository.UpdateApprovalAsync(userApproval);

                // Check if all required approvals are completed
                await CheckAndUpdateDemandStatus(userApproval.DemandId);

                _logger.LogInformation("Talep onay işlemi: {ApprovalId} - {Status} by User: {UserId}", 
                    processDto.ApprovalId, processDto.ApprovalStatus, currentUserId);

                return Result<bool>.SuccessResult(true, "Onay işlemi başarıyla tamamlandı.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Onay işleme hatası: {ApprovalId}", processDto.ApprovalId);
                return Result<bool>.Failure("Onay işlenirken bir hata oluştu.");
            }
        }

        public async Task<Result<bool>> CreateApprovalWorkflowAsync(int demandId, List<DemandApprovalCreateDto> approvals, int currentUserId)
        {
            try
            {
                foreach (var approvalDto in approvals)
                {
                    var approval = _mapper.Map<DemandApproval>(approvalDto);
                    approval.DemandId = demandId;
                    approval.CreatedBy = currentUserId;
                    approval.CreatedAt = DateTime.Now;
                    await _demandRepository.CreateApprovalAsync(approval);
                }

                return Result<bool>.SuccessResult(true, "Onay akışı başarıyla oluşturuldu.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Onay akışı oluşturma hatası: {DemandId}", demandId);
                return Result<bool>.Failure("Onay akışı oluşturulurken bir hata oluştu.");
            }
        }

        #endregion

        #region Comment Operations

        public async Task<Result<List<DemandCommentDto>>> GetCommentsByDemandIdAsync(int demandId)
        {
            try
            {
                var comments = await _demandRepository.GetCommentsByDemandIdAsync(demandId);
                var commentDtos = _mapper.Map<List<DemandCommentDto>>(comments);
                return Result<List<DemandCommentDto>>.SuccessResult(commentDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep yorumları getirme hatası: {DemandId}", demandId);
                return Result<List<DemandCommentDto>>.Failure("Talep yorumları getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<DemandCommentDto>> CreateCommentAsync(DemandCommentCreateDto createDto, int currentUserId)
        {
            try
            {
                var comment = _mapper.Map<DemandComment>(createDto);
                comment.UserId = currentUserId;
                comment.CreatedAt = DateTime.Now;

                var createdComment = await _demandRepository.CreateCommentAsync(comment);
                var commentDto = _mapper.Map<DemandCommentDto>(createdComment);

                return Result<DemandCommentDto>.SuccessResult(commentDto, "Yorum başarıyla eklendi.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Yorum oluşturma hatası: {DemandId}", createDto.DemandId);
                return Result<DemandCommentDto>.Failure("Yorum oluşturulurken bir hata oluştu.");
            }
        }

        #endregion

        #region Status and Priority Operations

        public async Task<Result<List<DemandStatusDto>>> GetAllStatusesAsync()
        {
            try
            {
                var statuses = await _demandRepository.GetAllStatusesAsync();
                var statusDtos = _mapper.Map<List<DemandStatusDto>>(statuses);
                return Result<List<DemandStatusDto>>.SuccessResult(statusDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep durumları getirme hatası");
                return Result<List<DemandStatusDto>>.Failure("Talep durumları getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<List<DemandPriorityDto>>> GetAllPrioritiesAsync()
        {
            try
            {
                var priorities = await _demandRepository.GetAllPrioritiesAsync();
                var priorityDtos = _mapper.Map<List<DemandPriorityDto>>(priorities);
                return Result<List<DemandPriorityDto>>.SuccessResult(priorityDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep öncelikleri getirme hatası");
                return Result<List<DemandPriorityDto>>.Failure("Talep öncelikleri getirilirken bir hata oluştu.");
            }
        }

        #endregion

        #region Business Logic Operations

        public async Task<Result<DemandSummaryDto>> GetSummaryAsync(int? companyId = null, int? userId = null)
        {
            try
            {
                var summary = await _demandRepository.GetSummaryAsync(companyId, userId);
                return Result<DemandSummaryDto>.SuccessResult(summary);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep özeti getirme hatası");
                return Result<DemandSummaryDto>.Failure("Talep özeti getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<List<DemandDto>>> GetOverdueDemandsAsync(int? companyId = null)
        {
            try
            {
                var demands = await _demandRepository.GetOverdueDemands(companyId);
                var demandDtos = _mapper.Map<List<DemandDto>>(demands);
                return Result<List<DemandDto>>.SuccessResult(demandDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Geciken talepler getirme hatası");
                return Result<List<DemandDto>>.Failure("Geciken talepler getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<List<DemandDto>>> GetDueSoonDemandsAsync(int days = 7, int? companyId = null)
        {
            try
            {
                var demands = await _demandRepository.GetDueSoonDemands(days, companyId);
                var demandDtos = _mapper.Map<List<DemandDto>>(demands);
                return Result<List<DemandDto>>.SuccessResult(demandDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Yaklaşan talepler getirme hatası");
                return Result<List<DemandDto>>.Failure("Yaklaşan talepler getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<bool>> ApproveDemandAsync(int demandId, DemandApprovalDto approvalDto, int currentUserId)
        {
            try
            {
                var demand = await _demandRepository.GetByIdAsync(demandId);
                if (demand == null)
                {
                    return Result<bool>.Failure("Talep bulunamadı.");
                }

                // Check if user can approve
                var canApprove = await _demandRepository.CanUserApproveDemandAsync(demandId, currentUserId);
                if (!canApprove)
                {
                    return Result<bool>.Failure("Bu talebi onaylama yetkiniz yok.");
                }

                demand.IsApproved = approvalDto.IsApproved;
                demand.ApprovedBy = currentUserId;
                demand.ApprovedDate = DateTime.Now;
                demand.ApprovalNotes = approvalDto.ApprovalNotes;

                // Update status
                var newStatus = approvalDto.IsApproved 
                    ? await _demandRepository.GetStatusByCodeAsync("APPROVED")
                    : await _demandRepository.GetStatusByCodeAsync("REJECTED");

                if (newStatus != null)
                {
                    demand.StatusId = newStatus.Id;
                }

                await _demandRepository.UpdateAsync(demand);

                var message = approvalDto.IsApproved ? "Talep başarıyla onaylandı." : "Talep reddedildi.";
                return Result<bool>.SuccessResult(true, message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep onaylama hatası: {DemandId}", demandId);
                return Result<bool>.Failure("Talep onaylanırken bir hata oluştu.");
            }
        }

        public async Task<Result<bool>> RejectDemandAsync(int demandId, string rejectionReason, int currentUserId)
        {
            var approvalDto = new DemandApprovalDto
            {
                IsApproved = false,
                ApprovalNotes = rejectionReason
            };

            return await ApproveDemandAsync(demandId, approvalDto, currentUserId);
        }

        public async Task<Result<string>> GenerateNextDemandNumberAsync(int companyId)
        {
            try
            {
                var demandNumber = await _demandRepository.GenerateNextDemandNumberAsync(companyId);
                return Result<string>.SuccessResult(demandNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep numarası oluşturma hatası: {CompanyId}", companyId);
                return Result<string>.Failure("Talep numarası oluşturulurken bir hata oluştu.");
            }
        }

        #endregion

        #region Private Helper Methods

        private bool CanUserModifyDemand(Demand demand, int userId)
        {
            // User can modify if:
            // 1. They created the demand and it's in DRAFT status
            // 2. They have admin role (this should be checked based on user roles)
            // 3. Other business rules...

            return demand.CreatedBy == userId && demand.Status.Code == "DRAFT";
        }

        private async Task CheckAndUpdateDemandStatus(int demandId)
        {
            var approvals = await _demandRepository.GetApprovalsByDemandIdAsync(demandId);
            var requiredApprovals = approvals.Where(a => a.IsRequired).ToList();

            if (requiredApprovals.All(a => a.IsCompleted))
            {
                var hasRejection = requiredApprovals.Any(a => a.ApprovalStatus == "REJECTED");
                var demand = await _demandRepository.GetByIdAsync(demandId);

                if (demand != null)
                {
                    var newStatus = hasRejection
                        ? await _demandRepository.GetStatusByCodeAsync("REJECTED")
                        : await _demandRepository.GetStatusByCodeAsync("APPROVED");

                    if (newStatus != null)
                    {
                        demand.StatusId = newStatus.Id;
                        demand.IsApproved = !hasRejection;
                        if (!hasRejection)
                        {
                            demand.ApprovedDate = DateTime.Now;
                        }

                        await _demandRepository.UpdateAsync(demand);
                    }
                }
            }
        }

        #endregion
    }
}