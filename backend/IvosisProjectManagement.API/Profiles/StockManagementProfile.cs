using AutoMapper;
using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.Models;
namespace IvosisProjectManagement.API.Profiles
{
    public class StockManagementProfile : Profile
    {
        public StockManagementProfile()
        {
            // StockItem Mappings
            CreateMap<StockItem, StockItemDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
                .ForMember(dest => dest.UnitName, opt => opt.MapFrom(src => src.Unit.Name))
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser.Name))
                .ForMember(dest => dest.UpdatedByName, opt => opt.MapFrom(src => src.UpdatedByUser != null ? src.UpdatedByUser.Name : null))
                .ForMember(dest => dest.CurrentStock, opt => opt.MapFrom(src => src.StockBalances.Sum(b => b.CurrentQuantity)))
                .ForMember(dest => dest.AvailableStock, opt => opt.MapFrom(src => src.StockBalances.Sum(b => b.AvailableQuantity)))
                .ForMember(dest => dest.ReservedStock, opt => opt.MapFrom(src => src.StockBalances.Sum(b => b.ReservedQuantity)))
                .ForMember(dest => dest.StockStatus, opt => opt.MapFrom(src => 
                    src.StockBalances.Sum(b => b.AvailableQuantity) <= src.MinimumStock ? "LOW_STOCK" :
                    src.StockBalances.Sum(b => b.CurrentQuantity) >= src.MaximumStock ? "OVERSTOCK" : "NORMAL"));

            CreateMap<StockItemDtoCreate, StockItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore());

            CreateMap<StockItemDtoUpdate, StockItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore());

            // StockMovement Mappings
            CreateMap<StockMovement, StockMovementDto>()
                .ForMember(dest => dest.ItemCode, opt => opt.MapFrom(src => src.StockItem.ItemCode))
                .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.StockItem.Name))
                .ForMember(dest => dest.LocationName, opt => opt.MapFrom(src => src.Location.Name))
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.StockItem.Category.Name))
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser.Name));

            CreateMap<CreateStockMovementDto, StockMovement>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.MovementDate, opt => opt.MapFrom(src => src.MovementDate ?? DateTime.Now))
                .ForMember(dest => dest.TotalAmount, opt => opt.MapFrom(src => src.Quantity * src.UnitPrice));

            // StockBalance Mappings
            CreateMap<StockBalance, StockBalanceDto>()
                .ForMember(dest => dest.ItemCode, opt => opt.MapFrom(src => src.StockItem.ItemCode))
                .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.StockItem.Name))
                .ForMember(dest => dest.LocationName, opt => opt.MapFrom(src => src.Location.Name))
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.StockItem.Category.Name))
                .ForMember(dest => dest.UnitName, opt => opt.MapFrom(src => src.StockItem.Unit.Name))
                .ForMember(dest => dest.MinimumStock, opt => opt.MapFrom(src => src.StockItem.MinimumStock))
                .ForMember(dest => dest.MaximumStock, opt => opt.MapFrom(src => src.StockItem.MaximumStock))
                .ForMember(dest => dest.StockStatus, opt => opt.MapFrom(src => 
                    src.AvailableQuantity <= src.StockItem.MinimumStock ? "LOW_STOCK" :
                    src.CurrentQuantity >= src.StockItem.MaximumStock ? "OVERSTOCK" : "NORMAL"));

            // StockAlert Mappings
            CreateMap<StockAlert, StockAlertDto>()
                .ForMember(dest => dest.ItemCode, opt => opt.MapFrom(src => src.StockItem.ItemCode))
                .ForMember(dest => dest.ItemName, opt => opt.MapFrom(src => src.StockItem.Name))
                .ForMember(dest => dest.LocationName, opt => opt.MapFrom(src => src.Location.Name))
                .ForMember(dest => dest.ReadByName, opt => opt.MapFrom(src => src.ReadByUser != null ? src.ReadByUser.Name : null));

            // StockCategory Mappings
            CreateMap<StockCategory, StockCategoryDto>()
                .ForMember(dest => dest.ParentCategoryName, opt => opt.MapFrom(src => src.ParentCategory != null ? src.ParentCategory.Name : null))
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser.Name))
                .ForMember(dest => dest.UpdatedByName, opt => opt.MapFrom(src => src.UpdatedByUser != null ? src.UpdatedByUser.Name : null))
                .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.StockItems.Count));

            // StockLocation Mappings
            CreateMap<StockLocation, StockLocationDto>()
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser.Name))
                .ForMember(dest => dest.UpdatedByName, opt => opt.MapFrom(src => src.UpdatedByUser != null ? src.UpdatedByUser.Name : null))
                .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.StockBalances.Count))
                .ForMember(dest => dest.TotalValue, opt => opt.MapFrom(src => src.StockBalances.Sum(b => b.CurrentQuantity * b.StockItem.PurchasePrice)));

            // Unit Mappings
            CreateMap<Unit, UnitDto>()
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser.Name));

            // Supplier Mappings
            CreateMap<Supplier, SupplierDto>()
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser.Name))
                .ForMember(dest => dest.UpdatedByName, opt => opt.MapFrom(src => src.UpdatedByUser != null ? src.UpdatedByUser.Name : null));
        }
    }

    // Additional DTOs for Unit and Supplier
    public class UnitDto : BaseDto
    {
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
    }

    public class SupplierDto : BaseDto
    {
        public string CompanyName { get; set; }
        public string TaxNumber { get; set; }
        public string TaxOffice { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string District { get; set; }
        public string PostalCode { get; set; }
        public string ContactPerson { get; set; }
        public string ContactPhone { get; set; }
        public string ContactEmail { get; set; }
        public string Website { get; set; }
        public int? PaymentTerms { get; set; }
        public decimal? CreditLimit { get; set; }
        public bool IsActive { get; set; }
    }
}