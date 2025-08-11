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
                .ForMember(dest => dest.MaterialNameName, opt => opt.MapFrom(src => src.MaterialName.Name))
                .ForMember(dest => dest.MaterialNameCode, opt => opt.MapFrom(src => src.MaterialName.Code))
                .ForMember(dest => dest.MaterialTypeName, opt => opt.MapFrom(src => src.MaterialType.Name))
                .ForMember(dest => dest.MaterialTypeCode, opt => opt.MapFrom(src => src.MaterialType.Code))
                .ForMember(dest => dest.MaterialQualityName, opt => opt.MapFrom(src => src.MaterialQuality.Name))
                .ForMember(dest => dest.MaterialQualityCode, opt => opt.MapFrom(src => src.MaterialQuality.Code))
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

            CreateMap<StockCategoryCreateDto, StockCategory>();

            // StockLocation Mappings
            CreateMap<StockLocation, StockLocationDto>()
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser != null ? src.CreatedByUser.Name : null))
                .ForMember(dest => dest.UpdatedByName, opt => opt.MapFrom(src => src.UpdatedByUser != null ? src.UpdatedByUser.Name : null))
                .ForMember(dest => dest.ItemCount, opt => opt.MapFrom(src => src.StockBalances.Count))
                .ForMember(dest => dest.TotalValue, opt => opt.MapFrom(src => src.StockBalances.Sum(b => b.CurrentQuantity * b.StockItem.PurchasePrice)));

            // StockLocation Create/Update Mappings
            CreateMap<StockLocationDtoCreate, StockLocation>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.StockBalances, opt => opt.Ignore());

            CreateMap<StockLocationDtoUpdate, StockLocation>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedByUser, opt => opt.Ignore())
                .ForMember(dest => dest.StockBalances, opt => opt.Ignore());

            // Unit Mappings
            CreateMap<Unit, UnitDto>()
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser.Name));

            // Supplier Mappings
            CreateMap<Supplier, SupplierDto>()
                .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser.Name))
                .ForMember(dest => dest.UpdatedByName, opt => opt.MapFrom(src => src.UpdatedByUser != null ? src.UpdatedByUser.Name : null));
            
            CreateMap<StockLot, StockLotResponseDto>()
            .ForMember(dest => dest.StockItemName, opt => opt.MapFrom(src => src.StockItem.Name))
            .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.Supplier.CompanyName))
            .ForMember(dest => dest.LocationName, opt => opt.MapFrom(src => src.Location.Name))
            .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedByUser.Name ))
            .ForMember(dest => dest.UpdatedByName, opt => opt.MapFrom(src => src.UpdatedByUser.Name));

            //StockLot Mappings
            CreateMap<StockLotCreateDto, StockLot>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CurrentWeight, opt => opt.Ignore())
                .ForMember(dest => dest.CurrentLength, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "ACTIVE"))
                .ForMember(dest => dest.IsBlocked, opt => opt.MapFrom(src => false));

            CreateMap<StockLotUpdateDto, StockLot>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.StockItemId, opt => opt.Ignore())
                .ForMember(dest => dest.LotNumber, opt => opt.Ignore())
                .ForMember(dest => dest.InitialWeight, opt => opt.Ignore())
                .ForMember(dest => dest.InitialLength, opt => opt.Ignore())
                .ForMember(dest => dest.CurrentWeight, opt => opt.Ignore())
                .ForMember(dest => dest.CurrentLength, opt => opt.Ignore())
                .ForMember(dest => dest.Width, opt => opt.Ignore())
                .ForMember(dest => dest.Thickness, opt => opt.Ignore())
                .ForMember(dest => dest.SupplierId, opt => opt.Ignore())
                .ForMember(dest => dest.ReceiptDate, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.CompanyId, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<StockLot, StockLotListDto>()
                .ForMember(dest => dest.StockItemName, opt => opt.MapFrom(src => src.StockItem.Name))
                .ForMember(dest => dest.LocationName, opt => opt.MapFrom(src => src.Location.Name));

             // MaterialName mappings
            CreateMap<MaterialName, MaterialNameDto>();
            CreateMap<MaterialNameDtoCreate, MaterialName>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

            // MaterialType mappings
            CreateMap<MaterialType, MaterialTypeDto>()
                .ForMember(dest => dest.MaterialNameName, opt => opt.MapFrom(src => src.MaterialName.Name));
            CreateMap<MaterialTypeDtoCreate, MaterialType>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

            // MaterialQuality mappings
            CreateMap<MaterialQuality, MaterialQualityDto>()
                .ForMember(dest => dest.MaterialTypeName, opt => opt.MapFrom(src => src.MaterialType.Name));
            CreateMap<MaterialQualityDtoCreate, MaterialQuality>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedBy, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));
        }
    }


    
}