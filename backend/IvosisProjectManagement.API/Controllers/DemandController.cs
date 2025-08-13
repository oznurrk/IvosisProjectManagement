using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using IvosisProjectManagement.API.Controllers;
using IvosisProjectManagement.API.Services.Interfaces;
using IvosisProjectManagement.API.DTOs.Demand;
using IvosisProjectManagement.API.DTOs.Common;

namespace IvosisProjectManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class DemandController : BaseController
    {
        private readonly IDemandService _demandService;
        private readonly ILogger<DemandController> _logger;

        public DemandController(IDemandService demandService, ILogger<DemandController> logger)
        {
            _demandService = demandService;
            _logger = logger;
        }

        #region Basic CRUD Operations

        /// <summary>
        /// Tüm talepleri sayfalı olarak getirir
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<Result<PagedResult<DemandDto>>>> GetPaged([FromQuery] DemandFilterDto filter)
        {
            try
            {
                // Kullanıcının erişim yetkisi kontrolü (sadece kendi firmasının taleplerine erişim)
                if (!HasGroupAccess() && GetCurrentCompanyId().HasValue)
                {
                    filter.CompanyId = GetCurrentCompanyId().Value;
                }

                var result = await _demandService.GetPagedAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep listesi getirme hatası");
                return StatusCode(500, Result<PagedResult<DemandDto>>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// ID'ye göre talep getirir
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Result<DemandDto>>> GetById(int id)
        {
            try
            {
                var result = await _demandService.GetByIdAsync(id);
                
                if (!result.Success)
                {
                    return NotFound(result);
                }

                // Yetki kontrolü - kullanıcı sadece kendi firmasının taleplerine erişebilir
                if (!HasGroupAccess() && GetCurrentCompanyId().HasValue)
                {
                    if (result.Data?.CompanyCode != GetCurrentCompanyCode())
                    {
                        return Forbid();
                    }
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep getirme hatası: {Id}", id);
                return StatusCode(500, Result<DemandDto>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Talep numarasına göre talep getirir
        /// </summary>
        [HttpGet("by-number/{demandNumber}")]
        public async Task<ActionResult<Result<DemandDto>>> GetByNumber(string demandNumber)
        {
            try
            {
                var result = await _demandService.GetByNumberAsync(demandNumber);
                
                if (!result.Success)
                {
                    return NotFound(result);
                }

                // Yetki kontrolü
                if (!HasGroupAccess() && GetCurrentCompanyId().HasValue)
                {
                    if (result.Data?.CompanyCode != GetCurrentCompanyCode())
                    {
                        return Forbid();
                    }
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep getirme hatası: {DemandNumber}", demandNumber);
                return StatusCode(500, Result<DemandDto>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Proje ID'sine göre talepleri getirir
        /// </summary>
        [HttpGet("by-project/{projectId}")]
        public async Task<ActionResult<Result<List<DemandDto>>>> GetByProjectId(int projectId)
        {
            try
            {
                var result = await _demandService.GetByProjectIdAsync(projectId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Proje talepleri getirme hatası: {ProjectId}", projectId);
                return StatusCode(500, Result<List<DemandDto>>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Yeni talep oluşturur
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Result<DemandDto>>> Create([FromBody] DemandCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(Result<DemandDto>.Failure("Gönderilen veriler geçerli değil."));
                }

                var currentUserId = GetCurrentUserId();
                if (currentUserId == 0)
                {
                    return Unauthorized(Result<DemandDto>.Failure("Kullanıcı kimlik doğrulaması başarısız."));
                }

                var result = await _demandService.CreateAsync(createDto, currentUserId);
                
                if (result.Success)
                {
                    return CreatedAtAction(nameof(GetById), new { id = result.Data?.Id }, result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep oluşturma hatası. User: {UserId}", GetCurrentUserId());
                return StatusCode(500, Result<DemandDto>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Talebi günceller
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<Result<DemandDto>>> Update(int id, [FromBody] DemandUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(Result<DemandDto>.Failure("Gönderilen veriler geçerli değil."));
                }

                var currentUserId = GetCurrentUserId();
                if (currentUserId == 0)
                {
                    return Unauthorized(Result<DemandDto>.Failure("Kullanıcı kimlik doğrulaması başarısız."));
                }

                var result = await _demandService.UpdateAsync(id, updateDto, currentUserId);
                
                if (result.Success)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep güncelleme hatası: {Id}. User: {UserId}", id, GetCurrentUserId());
                return StatusCode(500, Result<DemandDto>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Talebi siler
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<Result<bool>>> Delete(int id)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (currentUserId == 0)
                {
                    return Unauthorized(Result<bool>.Failure("Kullanıcı kimlik doğrulaması başarısız."));
                }

                var result = await _demandService.DeleteAsync(id, currentUserId);
                
                if (result.Success)
                {
                    return Ok(result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep silme hatası: {Id}. User: {UserId}", id, GetCurrentUserId());
                return StatusCode(500, Result<bool>.Failure("Sunucu hatası oluştu."));
            }
        }

        #endregion

        #region Demand Items Operations

        /// <summary>
        /// Talep kalemlerini getirir
        /// </summary>
        [HttpGet("{demandId}/items")]
        public async Task<ActionResult<Result<List<DemandItemDto>>>> GetItems(int demandId)
        {
            try
            {
                var result = await _demandService.GetItemsByDemandIdAsync(demandId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep kalemleri getirme hatası: {DemandId}", demandId);
                return StatusCode(500, Result<List<DemandItemDto>>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Yeni talep kalemi ekler
        /// </summary>
        [HttpPost("{demandId}/items")]
        public async Task<ActionResult<Result<DemandItemDto>>> CreateItem(int demandId, [FromBody] DemandItemCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(Result<DemandItemDto>.Failure("Gönderilen veriler geçerli değil."));
                }

                var currentUserId = GetCurrentUserId();
                var result = await _demandService.CreateItemAsync(demandId, createDto, currentUserId);
                
                if (result.Success)
                {
                    return CreatedAtAction(nameof(GetItems), new { demandId }, result);
                }

                return BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep kalemi oluşturma hatası: {DemandId}", demandId);
                return StatusCode(500, Result<DemandItemDto>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Talep kalemini günceller
        /// </summary>
        [HttpPut("items/{itemId}")]
        public async Task<ActionResult<Result<DemandItemDto>>> UpdateItem(int itemId, [FromBody] DemandItemUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(Result<DemandItemDto>.Failure("Gönderilen veriler geçerli değil."));
                }

                var currentUserId = GetCurrentUserId();
                var result = await _demandService.UpdateItemAsync(itemId, updateDto, currentUserId);
                
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep kalemi güncelleme hatası: {ItemId}", itemId);
                return StatusCode(500, Result<DemandItemDto>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Talep kalemini siler
        /// </summary>
        [HttpDelete("items/{itemId}")]
        public async Task<ActionResult<Result<bool>>> DeleteItem(int itemId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var result = await _demandService.DeleteItemAsync(itemId, currentUserId);
                
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep kalemi silme hatası: {ItemId}", itemId);
                return StatusCode(500, Result<bool>.Failure("Sunucu hatası oluştu."));
            }
        }

        #endregion

        #region Approval Operations

        /// <summary>
        /// Talep onaylarını getirir
        /// </summary>
        [HttpGet("{demandId}/approvals")]
        public async Task<ActionResult<Result<List<DemandApprovalDetailDto>>>> GetApprovals(int demandId)
        {
            try
            {
                var result = await _demandService.GetApprovalsByDemandIdAsync(demandId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep onayları getirme hatası: {DemandId}", demandId);
                return StatusCode(500, Result<List<DemandApprovalDetailDto>>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Kullanıcının bekleyen onaylarını getirir
        /// </summary>
        [HttpGet("my-pending-approvals")]
        public async Task<ActionResult<Result<List<DemandApprovalDetailDto>>>> GetMyPendingApprovals()
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                if (currentUserId == 0)
                {
                    return Unauthorized(Result<List<DemandApprovalDetailDto>>.Failure("Kullanıcı kimlik doğrulaması başarısız."));
                }

                var result = await _demandService.GetMyPendingApprovalsAsync(currentUserId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bekleyen onaylar getirme hatası. User: {UserId}", GetCurrentUserId());
                return StatusCode(500, Result<List<DemandApprovalDetailDto>>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Onay işlemini gerçekleştirir
        /// </summary>
        [HttpPost("approvals/process")]
        public async Task<ActionResult<Result<bool>>> ProcessApproval([FromBody] DemandApprovalProcessDto processDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(Result<bool>.Failure("Gönderilen veriler geçerli değil."));
                }

                var currentUserId = GetCurrentUserId();
                if (currentUserId == 0)
                {
                    return Unauthorized(Result<bool>.Failure("Kullanıcı kimlik doğrulaması başarısız."));
                }

                var result = await _demandService.ProcessApprovalAsync(processDto, currentUserId);
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Onay işleme hatası: {ApprovalId}", processDto.ApprovalId);
                return StatusCode(500, Result<bool>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Talep için onay akışı oluşturur
        /// </summary>
        [HttpPost("{demandId}/approvals/workflow")]
        public async Task<ActionResult<Result<bool>>> CreateApprovalWorkflow(int demandId, [FromBody] List<DemandApprovalCreateDto> approvals)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(Result<bool>.Failure("Gönderilen veriler geçerli değil."));
                }

                var currentUserId = GetCurrentUserId();
                var result = await _demandService.CreateApprovalWorkflowAsync(demandId, approvals, currentUserId);
                
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Onay akışı oluşturma hatası: {DemandId}", demandId);
                return StatusCode(500, Result<bool>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Talebi onaylar
        /// </summary>
        [HttpPost("{demandId}/approve")]
        public async Task<ActionResult<Result<bool>>> ApproveDemand(int demandId, [FromBody] DemandApprovalDto approvalDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(Result<bool>.Failure("Gönderilen veriler geçerli değil."));
                }

                var currentUserId = GetCurrentUserId();
                var result = await _demandService.ApproveDemandAsync(demandId, approvalDto, currentUserId);
                
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep onaylama hatası: {DemandId}", demandId);
                return StatusCode(500, Result<bool>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Talebi reddeder
        /// </summary>
        [HttpPost("{demandId}/reject")]
        public async Task<ActionResult<Result<bool>>> RejectDemand(int demandId, [FromBody] string rejectionReason)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var result = await _demandService.RejectDemandAsync(demandId, rejectionReason, currentUserId);
                
                return result.Success ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep reddetme hatası: {DemandId}", demandId);
                return StatusCode(500, Result<bool>.Failure("Sunucu hatası oluştu."));
            }
        }

        #endregion

        #region Comment Operations

        /// <summary>
        /// Talep yorumlarını getirir
        /// </summary>
        [HttpGet("{demandId}/comments")]
        public async Task<ActionResult<Result<List<DemandCommentDto>>>> GetComments(int demandId)
        {
            try
            {
                var result = await _demandService.GetCommentsByDemandIdAsync(demandId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep yorumları getirme hatası: {DemandId}", demandId);
                return StatusCode(500, Result<List<DemandCommentDto>>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Talebe yorum ekler
        /// </summary>
        [HttpPost("comments")]
        public async Task<ActionResult<Result<DemandCommentDto>>> CreateComment([FromBody] DemandCommentCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(Result<DemandCommentDto>.Failure("Gönderilen veriler geçerli değil."));
                }

                var currentUserId = GetCurrentUserId();
                var result = await _demandService.CreateCommentAsync(createDto, currentUserId);
                
                return result.Success ? CreatedAtAction(nameof(GetComments), new { demandId = createDto.DemandId }, result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Yorum oluşturma hatası: {DemandId}", createDto.DemandId);
                return StatusCode(500, Result<DemandCommentDto>.Failure("Sunucu hatası oluştu."));
            }
        }

        #endregion

        #region Status and Priority Operations

        /// <summary>
        /// Tüm talep durumlarını getirir
        /// </summary>
        [HttpGet("statuses")]
        public async Task<ActionResult<Result<List<DemandStatusDto>>>> GetAllStatuses()
        {
            try
            {
                var result = await _demandService.GetAllStatusesAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep durumları getirme hatası");
                return StatusCode(500, Result<List<DemandStatusDto>>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Tüm talep önceliklerini getirir
        /// </summary>
        [HttpGet("priorities")]
        public async Task<ActionResult<Result<List<DemandPriorityDto>>>> GetAllPriorities()
        {
            try
            {
                var result = await _demandService.GetAllPrioritiesAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep öncelikleri getirme hatası");
                return StatusCode(500, Result<List<DemandPriorityDto>>.Failure("Sunucu hatası oluştu."));
            }
        }

        #endregion

        #region Business Logic Operations

        /// <summary>
        /// Talep özetini getirir
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<Result<DemandSummaryDto>>> GetSummary()
        {
            try
            {
                var companyId = HasGroupAccess() ? null : GetCurrentCompanyId();
                var userId = GetCurrentUserId();
                
                var result = await _demandService.GetSummaryAsync(companyId, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep özeti getirme hatası");
                return StatusCode(500, Result<DemandSummaryDto>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Geciken talepleri getirir
        /// </summary>
        [HttpGet("overdue")]
        public async Task<ActionResult<Result<List<DemandDto>>>> GetOverdueDemands()
        {
            try
            {
                var companyId = HasGroupAccess() ? null : GetCurrentCompanyId();
                var result = await _demandService.GetOverdueDemandsAsync(companyId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Geciken talepler getirme hatası");
                return StatusCode(500, Result<List<DemandDto>>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Yaklaşan talepleri getirir
        /// </summary>
        [HttpGet("due-soon")]
        public async Task<ActionResult<Result<List<DemandDto>>>> GetDueSoonDemands([FromQuery] int days = 7)
        {
            try
            {
                var companyId = HasGroupAccess() ? null : GetCurrentCompanyId();
                var result = await _demandService.GetDueSoonDemandsAsync(days, companyId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Yaklaşan talepler getirme hatası");
                return StatusCode(500, Result<List<DemandDto>>.Failure("Sunucu hatası oluştu."));
            }
        }

        /// <summary>
        /// Yeni talep numarası oluşturur
        /// </summary>
        [HttpGet("generate-number/{companyId}")]
        public async Task<ActionResult<Result<string>>> GenerateNextDemandNumber(int companyId)
        {
            try
            {
                // Yetki kontrolü - kullanıcı sadece kendi firması için numara oluşturabilir
                if (!HasGroupAccess() && GetCurrentCompanyId() != companyId)
                {
                    return Forbid();
                }

                var result = await _demandService.GenerateNextDemandNumberAsync(companyId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Talep numarası oluşturma hatası: {CompanyId}", companyId);
                return StatusCode(500, Result<string>.Failure("Sunucu hatası oluştu."));
            }
        }

        #endregion

        #region Health Check and Info

        /// <summary>
        /// API sağlık kontrolü
        /// </summary>
        [HttpGet("health")]
        [AllowAnonymous]
        public IActionResult Health()
        {
            return Ok(new { status = "healthy", timestamp = DateTime.UtcNow, module = "demand" });
        }

        /// <summary>
        /// API bilgileri
        /// </summary>
        [HttpGet("info")]
        public IActionResult Info()
        {
            return Ok(new 
            { 
                module = "Demand Management",
                version = "1.0.0",
                description = "Talep yönetimi modülü",
                endpoints = new[]
                {
                    "GET /api/demand - Sayfalı talep listesi",
                    "GET /api/demand/{id} - Talep detayı",
                    "POST /api/demand - Yeni talep",
                    "PUT /api/demand/{id} - Talep güncelleme",
                    "DELETE /api/demand/{id} - Talep silme",
                    "GET /api/demand/summary - Talep özeti",
                    "GET /api/demand/my-pending-approvals - Bekleyen onaylar"
                }
            });
        }

        #endregion
    }
}