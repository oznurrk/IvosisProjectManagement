using AutoMapper;
using IvosisProjectManagement.API.Models.Demand;
using IvosisProjectManagement.API.DTOs.Demand;
using System.Text.Json;

namespace IvosisProjectManagement.API.Profiles
{
    public class DemandProfile : Profile
    {
        // Helper metodları
        private static List<string> ParseAttachmentsFromJson(string? json)
        {
            if (string.IsNullOrEmpty(json))
                return new List<string>();
            
            try
            {
                return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        private static string? SerializeAttachmentsToJson(List<string>? attachments)
        {
            if (attachments == null || !attachments.Any())
                return null;
            
            try
            {
                return JsonSerializer.Serialize(attachments);
            }
            catch
            {
                return null;
            }
        }

        public DemandProfile()
        {
            // =============================================
            // DEMAND STATUS MAPPINGS
            // =============================================

            CreateMap<DemandStatus, DemandStatusDto>()
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser != null ? src.CreatedByUser.Name : null));

            CreateMap<DemandStatusCreateDto, DemandStatus>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.Demands, opt => opt.Ignore());

            // =============================================
            // DEMAND PRIORITY MAPPINGS
            // =============================================

            CreateMap<DemandPriority, DemandPriorityDto>();

            // =============================================
            // DEMAND MAPPINGS
            // =============================================

            CreateMap<Demand, DemandDto>()
                .ForMember(dest => dest.ProjectName, opt => opt.MapFrom(src => src.Project.Name))
                .ForMember(dest => dest.StatusName, opt => opt.MapFrom(src => src.Status.Name))
                .ForMember(dest => dest.StatusCode, opt => opt.MapFrom(src => src.Status.Code))
                .ForMember(dest => dest.StatusColor, opt => opt.MapFrom(src => src.Status.Color))
                .ForMember(dest => dest.PriorityName, opt => opt.MapFrom(src => src.Priority.Name))
                .ForMember(dest => dest.PriorityCode, opt => opt.MapFrom(src => src.Priority.Code))
                .ForMember(dest => dest.PriorityLevel, opt => opt.MapFrom(src => src.Priority.Level))
                .ForMember(dest => dest.PriorityColor, opt => opt.MapFrom(src => src.Priority.Color))
                .ForMember(dest => dest.ApprovedByName, opt => opt.MapFrom(src => src.ApprovedByUser != null ? src.ApprovedByUser.Name : null))
                .ForMember(dest => dest.CompanyName, opt => opt.MapFrom(src => src.Company.Name))
                .ForMember(dest => dest.CompanyCode, opt => opt.MapFrom(src => src.Company.Code))
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser.Name))
                .ForMember(dest => dest.UpdatedByName, opt => opt.MapFrom(src => src.UpdatedByUser != null ? src.UpdatedByUser.Name : null))
                .ForMember(dest => dest.TotalItems, opt => opt.MapFrom(src => src.DemandItems.Count))
                .ForMember(dest => dest.ApprovedItems, opt => opt.MapFrom(src => src.DemandItems.Count(di => di.Status == "APPROVED")))
                .ForMember(dest => dest.TotalEstimatedAmount, opt => opt.MapFrom(src => src.DemandItems.Sum(di => di.EstimatedTotalPrice ?? 0)))
                .ForMember(dest => dest.Attachments, opt => opt.MapFrom(src => ParseAttachmentsFromJson(src.Attachments)))
                .ForMember(dest => dest.DemandItems, opt => opt.MapFrom(src => src.DemandItems));

            CreateMap<DemandCreateDto, Demand>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.DemandNumber, opt => opt.Ignore())
                .ForMember(dest => dest.StatusId, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.Priority, opt => opt.Ignore())
                .ForMember(dest => dest.Project, opt => opt.Ignore())
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsApproved, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovalNotes, opt => opt.Ignore())
                .ForMember(dest => dest.RequestedDate, opt => opt.MapFrom(src => DateTime.Now))
                .ForMember(dest => dest.Attachments, opt => opt.MapFrom(src => SerializeAttachmentsToJson(src.Attachments)))
                .ForMember(dest => dest.DemandItems, opt => opt.Ignore())
                .ForMember(dest => dest.DemandApprovals, opt => opt.Ignore())
                .ForMember(dest => dest.DemandComments, opt => opt.Ignore());

            CreateMap<DemandUpdateDto, Demand>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.DemandNumber, opt => opt.Ignore())
                .ForMember(dest => dest.ProjectId, opt => opt.Ignore())
                .ForMember(dest => dest.CompanyId, opt => opt.Ignore())
                .ForMember(dest => dest.StatusId, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.Priority, opt => opt.Ignore())
                .ForMember(dest => dest.Project, opt => opt.Ignore())
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.RequestedDate, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovedDate, opt => opt.Ignore())
                .ForMember(dest => dest.IsApproved, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovalNotes, opt => opt.Ignore())
                .ForMember(dest => dest.Attachments, opt => opt.MapFrom(src => SerializeAttachmentsToJson(src.Attachments)))
                .ForMember(dest => dest.DemandItems, opt => opt.Ignore())
                .ForMember(dest => dest.DemandApprovals, opt => opt.Ignore())
                .ForMember(dest => dest.DemandComments, opt => opt.Ignore());

            // =============================================
            // DEMAND ITEM MAPPINGS
            // =============================================

            CreateMap<DemandItem, DemandItemDto>()
                .ForMember(dest => dest.StockItemCode, opt => opt.MapFrom(src => src.StockItem != null ? src.StockItem.ItemCode : null))
                .ForMember(dest => dest.UnitName, opt => opt.MapFrom(src => src.Unit.Name))
                .ForMember(dest => dest.SuggestedSupplierName, opt => opt.MapFrom(src => src.SuggestedSupplier != null ? src.SuggestedSupplier.CompanyName : null))
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser.Name))
                .ForMember(dest => dest.UpdatedByName, opt => opt.MapFrom(src => src.UpdatedByUser != null ? src.UpdatedByUser.Name : null))
                .ForMember(dest => dest.ItemSpecifications, opt => opt.MapFrom(src => src.ItemSpecifications));

            CreateMap<DemandItemCreateDto, DemandItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.DemandId, opt => opt.Ignore())
                .ForMember(dest => dest.Demand, opt => opt.Ignore())
                .ForMember(dest => dest.StockItem, opt => opt.Ignore())
                .ForMember(dest => dest.Unit, opt => opt.Ignore())
                .ForMember(dest => dest.SuggestedSupplier, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "PENDING"));

            CreateMap<DemandItemUpdateDto, DemandItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.DemandId, opt => opt.Ignore())
                .ForMember(dest => dest.Demand, opt => opt.Ignore())
                .ForMember(dest => dest.StockItemId, opt => opt.Ignore())
                .ForMember(dest => dest.StockItem, opt => opt.Ignore())
                .ForMember(dest => dest.UnitId, opt => opt.Ignore())
                .ForMember(dest => dest.Unit, opt => opt.Ignore())
                .ForMember(dest => dest.SuggestedSupplier, opt => opt.Ignore())
                .ForMember(dest => dest.Currency, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedByUser, opt => opt.Ignore());

            // =============================================
            // DEMAND APPROVAL MAPPINGS
            // =============================================

            CreateMap<DemandApproval, DemandApprovalDetailDto>()
                .ForMember(dest => dest.DemandNumber, opt => opt.MapFrom(src => src.Demand.DemandNumber))
                .ForMember(dest => dest.DemandTitle, opt => opt.MapFrom(src => src.Demand.Title))
                .ForMember(dest => dest.ApproverName, opt => opt.MapFrom(src => src.ApproverUser.Name))
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser.Name))
                .ForMember(dest => dest.UpdatedByName, opt => opt.MapFrom(src => src.UpdatedByUser != null ? src.UpdatedByUser.Name : null));

            CreateMap<DemandApprovalCreateDto, DemandApproval>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Demand, opt => opt.Ignore())
                .ForMember(dest => dest.ApproverUser, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovalStatus, opt => opt.MapFrom(src => "PENDING"))
                .ForMember(dest => dest.ApprovalDate, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovalNotes, opt => opt.Ignore())
                .ForMember(dest => dest.IsCompleted, opt => opt.MapFrom(src => false))
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedByUser, opt => opt.Ignore());

            // =============================================
            // DEMAND COMMENT MAPPINGS
            // =============================================

            CreateMap<DemandComment, DemandCommentDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.Name));

            CreateMap<DemandCommentCreateDto, DemandComment>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Demand, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

            // =============================================
            // REVERSE MAPPINGS FOR UPDATES
            // =============================================

            // Bu mapping'ler Entity'deki değişiklikleri DTO'ya yansıtmak için kullanılır
            CreateMap<Demand, DemandUpdateDto>()
                .ForMember(dest => dest.Attachments, opt => opt.MapFrom(src => ParseAttachmentsFromJson(src.Attachments)));

            CreateMap<DemandItem, DemandItemUpdateDto>();
        }
    }
}