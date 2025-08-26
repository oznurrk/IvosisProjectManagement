using AutoMapper;
using Microsoft.EntityFrameworkCore;
using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.DTOs.Common;
using IvosisProjectManagement.API.Models;
using IvosisProjectManagement.API.Repositories.Interfaces;
using IvosisProjectManagement.API.Services.Interfaces;
using IvosisProjectManagement.API.Data;

namespace IvosisProjectManagement.API.Services.Implementations
{
    public class SupplierService : ISupplierService
    {
        private readonly ISupplierRepository _supplierRepository;
        private readonly IMapper _mapper;
        private readonly ApplicationDbContext _context;

        public SupplierService(
            ISupplierRepository supplierRepository,
            IMapper mapper,
            ApplicationDbContext context)
        {
            _supplierRepository = supplierRepository;
            _mapper = mapper;
            _context = context;
        }

        public async Task<Result<List<SupplierDto>>> GetAllAsync(int? companyId)
        {
            try
            {
               var query = _context.Suppliers.AsQueryable();

                if (companyId.HasValue)
                {
                    query = query.Where(s => s.CompanyId == companyId.Value);
                }

                var suppliers = await query.ToListAsync();
                var supplierDtos = _mapper.Map<List<SupplierDto>>(suppliers);

                return Result<List<SupplierDto>>.SuccessResult(supplierDtos);
            }
            catch (Exception ex)
            {
                return Result<List<SupplierDto>>.Failure("Tedarikçiler getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<SupplierDto>> GetByIdAsync(int id, int? companyId)
        {
            try
            {
                var query = _context.Suppliers
                    .Include(s => s.CreatedByUser)
                    .Include(s => s.UpdatedByUser)
                    .Include(s => s.SupplierCompanies)
                        .ThenInclude(sc => sc.Company)
                    .Where(s => s.Id == id);

                if (companyId.HasValue)
                {
                    query = query.Where(s => s.CompanyId == companyId.Value);
                }

                var supplier = await query.FirstOrDefaultAsync();
                if (supplier == null)
                {
                    return Result<SupplierDto>.Failure("Tedarikçi bulunamadı.");
                }

                var supplierDto = _mapper.Map<SupplierDto>(supplier);
                return Result<SupplierDto>.SuccessResult(supplierDto);
            }
            catch (Exception ex)
            {
                return Result<SupplierDto>.Failure("Tedarikçi getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<SupplierDto>> CreateAsync(SupplierCreateDto createDto, int userId, int? companyId)
        {
            try
            {
                // Tax number uniqueness check
                var isTaxNumberUnique = await _supplierRepository.IsTaxNumberUniqueAsync(createDto.TaxNumber);
                if (!isTaxNumberUnique)
                {
                    return Result<SupplierDto>.Failure("Bu vergi numarası zaten kayıtlı.");
                }

                var supplier = _mapper.Map<Supplier>(createDto);
                supplier.CreatedBy = userId;
                supplier.CompanyId = companyId;
                supplier.CreatedAt = DateTime.Now;

                var createdSupplier = await _supplierRepository.AddAsync(supplier);

                // Reload with includes
                var supplierWithIncludes = await _context.Suppliers
                    .Include(s => s.CreatedByUser)
                    .Include(s => s.UpdatedByUser)
                    .Include(s => s.SupplierCompanies)
                        .ThenInclude(sc => sc.Company)
                    .FirstOrDefaultAsync(s => s.Id == createdSupplier.Id);

                var supplierDto = _mapper.Map<SupplierDto>(supplierWithIncludes);
                return Result<SupplierDto>.SuccessResult(supplierDto, "Tedarikçi başarıyla oluşturuldu.");
            }
            catch (Exception ex)
            {
                return Result<SupplierDto>.Failure("Tedarikçi oluşturulurken bir hata oluştu.");
            }
        }

        public async Task<Result<SupplierDto>> UpdateAsync(int id, SupplierUpdateDto updateDto, int userId, int? companyId)
        {
            try
            {
                var query = _context.Suppliers.Where(s => s.Id == id);
                if (companyId.HasValue)
                {
                    query = query.Where(s => s.CompanyId == companyId.Value);
                }

                var supplier = await query.FirstOrDefaultAsync();
                if (supplier == null)
                {
                    return Result<SupplierDto>.Failure("Tedarikçi bulunamadı.");
                }

                _mapper.Map(updateDto, supplier);
                supplier.UpdatedBy = userId;
                supplier.UpdatedAt = DateTime.Now;

                await _supplierRepository.UpdateAsync(supplier);

                // Reload with includes
                var supplierWithIncludes = await _context.Suppliers
                    .Include(s => s.CreatedByUser)
                    .Include(s => s.UpdatedByUser)
                    .Include(s => s.SupplierCompanies)
                        .ThenInclude(sc => sc.Company)
                    .FirstOrDefaultAsync(s => s.Id == id);

                var supplierDto = _mapper.Map<SupplierDto>(supplierWithIncludes);
                return Result<SupplierDto>.SuccessResult(supplierDto, "Tedarikçi başarıyla güncellendi.");
            }
            catch (Exception ex)
            {
                return Result<SupplierDto>.Failure("Tedarikçi güncellenirken bir hata oluştu.");
            }
        }

        public async Task<Result<bool>> DeleteAsync(int id, int? companyId)
        {
            try
            {
                var query = _context.Suppliers.Where(s => s.Id == id);
                if (companyId.HasValue)
                {
                    query = query.Where(s => s.CompanyId == companyId.Value);
                }

                var supplier = await query.FirstOrDefaultAsync();
                if (supplier == null)
                {
                    return Result<bool>.Failure("Tedarikçi bulunamadı.");
                }

                // Check if supplier is used in other entities
                var hasRelatedData = await _context.StockLots.AnyAsync(sl => sl.SupplierId == id) ||
                                   await _context.DemandItems.AnyAsync(di => di.SuggestedSupplierId == id);

                if (hasRelatedData)
                {
                    return Result<bool>.Failure("Bu tedarikçi başka kayıtlarda kullanıldığı için silinemez.");
                }

                var result = await _supplierRepository.DeleteAsync(id);
                if (result)
                {
                    return Result<bool>.SuccessResult(true, "Tedarikçi başarıyla silindi.");
                }

                return Result<bool>.Failure("Tedarikçi silinirken bir hata oluştu.");
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure("Tedarikçi silinirken bir hata oluştu.");
            }
        }

        public async Task<Result<List<SupplierListDto>>> GetListAsync(int? companyId)
        {
            try
            {
                var query = _context.Suppliers
                    .Include(s => s.CreatedByUser)
                    .AsQueryable();

                if (companyId.HasValue)
                {
                    query = query.Where(s => s.CompanyId == companyId.Value);
                }

                var suppliers = await query
                    .Select(s => new SupplierListDto
                    {
                        Id = s.Id,
                        CompanyName = s.CompanyName,
                        TaxNumber = s.TaxNumber,
                        ContactPerson = s.ContactPerson,
                        ContactPhone = s.ContactPhone,
                        ContactEmail = s.ContactEmail,
                        IsActive = s.IsActive,
                        CreatedAt = s.CreatedAt,
                        CreatedByName = s.CreatedByUser != null ? s.CreatedByUser.Name : null
                    })
                    .ToListAsync();

                return Result<List<SupplierListDto>>.SuccessResult(suppliers);
            }
            catch (Exception ex)
            {
                return Result<List<SupplierListDto>>.Failure("Tedarikçi listesi getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<bool>> ToggleStatusAsync(int id, int userId, int? companyId)
        {
            try
            {
                var query = _context.Suppliers.Where(s => s.Id == id);
                if (companyId.HasValue)
                {
                    query = query.Where(s => s.CompanyId == companyId.Value);
                }

                var supplier = await query.FirstOrDefaultAsync();
                if (supplier == null)
                {
                    return Result<bool>.Failure("Tedarikçi bulunamadı.");
                }

                supplier.IsActive = !supplier.IsActive;
                supplier.UpdatedBy = userId;
                supplier.UpdatedAt = DateTime.Now;

                await _supplierRepository.UpdateAsync(supplier);

                string status = supplier.IsActive ? "aktif" : "pasif";
                return Result<bool>.SuccessResult(true, $"Tedarikçi durumu {status} olarak güncellendi.");
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure("Tedarikçi durumu güncellenirken bir hata oluştu.");
            }
        }

        public async Task<Result<List<SupplierCompanyDto>>> GetSupplierCompaniesBySupplierIdAsync(int supplierId, int? companyId)
        {
            try
            {
                var query = _context.SupplierCompanies
                    .Include(sc => sc.Company)
                    .Include(sc => sc.Supplier)
                    .Where(sc => sc.SupplierId == supplierId);

                if (companyId.HasValue)
                {
                    query = query.Where(sc => sc.CompanyId == companyId.Value);
                }

                var supplierCompanies = await query.ToListAsync();
                var supplierCompanyDtos = _mapper.Map<List<SupplierCompanyDto>>(supplierCompanies);

                return Result<List<SupplierCompanyDto>>.SuccessResult(supplierCompanyDtos);
            }
            catch (Exception ex)
            {
                return Result<List<SupplierCompanyDto>>.Failure("Tedarikçi şirket ilişkileri getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<SupplierCompanyDto>> AddSupplierCompanyAsync(SupplierCompanyCreateDto createDto, int userId)
        {
            try
            {
                // Check if relationship already exists
                var exists = await _context.SupplierCompanies
                    .AnyAsync(sc => sc.SupplierId == createDto.SupplierId && sc.CompanyId == createDto.CompanyId);

                if (exists)
                {
                    return Result<SupplierCompanyDto>.Failure("Bu tedarikçi-şirket ilişkisi zaten mevcut.");
                }

                var supplierCompany = new SupplierCompany
                {
                    SupplierId = createDto.SupplierId,
                    CompanyId = createDto.CompanyId,
                    IsActive = createDto.IsActive,
                    CreatedBy = userId,
                    CreatedAt = DateTime.Now
                };

                _context.SupplierCompanies.Add(supplierCompany);
                await _context.SaveChangesAsync();

                // Reload with includes
                var supplierCompanyWithIncludes = await _context.SupplierCompanies
                    .Include(sc => sc.Company)
                    .Include(sc => sc.Supplier)
                    .FirstOrDefaultAsync(sc => sc.Id == supplierCompany.Id);

                var supplierCompanyDto = _mapper.Map<SupplierCompanyDto>(supplierCompanyWithIncludes);
                return Result<SupplierCompanyDto>.SuccessResult(supplierCompanyDto, "Tedarikçi-şirket ilişkisi başarıyla oluşturuldu.");
            }
            catch (Exception ex)
            {
                return Result<SupplierCompanyDto>.Failure("Tedarikçi-şirket ilişkisi oluşturulurken bir hata oluştu.");
            }
        }

        public async Task<Result<bool>> RemoveSupplierCompanyAsync(int supplierId, int companyId, int userId)
        {
            try
            {
                var supplierCompany = await _context.SupplierCompanies
                    .FirstOrDefaultAsync(sc => sc.SupplierId == supplierId && sc.CompanyId == companyId);

                if (supplierCompany == null)
                {
                    return Result<bool>.Failure("Tedarikçi-şirket ilişkisi bulunamadı.");
                }

                _context.SupplierCompanies.Remove(supplierCompany);
                await _context.SaveChangesAsync();

                return Result<bool>.SuccessResult(true, "Tedarikçi-şirket ilişkisi başarıyla silindi.");
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure("Tedarikçi-şirket ilişkisi silinirken bir hata oluştu.");
            }
        }
        public async Task<Result<List<SupplierDto>>> SearchSuppliersAsync(string searchTerm, int? companyId)
        {
            try
            {
                var suppliers = await _supplierRepository.SearchSuppliersAsync(searchTerm, companyId);
                var supplierDtos = _mapper.Map<List<SupplierDto>>(suppliers);
                return Result<List<SupplierDto>>.SuccessResult(supplierDtos);
            }
            catch (Exception ex)
            {
                return Result<List<SupplierDto>>.Failure("Tedarikçi arama işleminde bir hata oluştu.");
            }
        }

        public async Task<Result<List<SupplierDto>>> GetActiveSuppliersByCompanyAsync(int companyId)
        {
            try
            {
                var suppliers = await _supplierRepository.GetActiveSuppliersByCompanyAsync(companyId);
                var supplierDtos = _mapper.Map<List<SupplierDto>>(suppliers);
                return Result<List<SupplierDto>>.SuccessResult(supplierDtos);
            }
            catch (Exception ex)
            {
                return Result<List<SupplierDto>>.Failure("Aktif tedarikçiler getirilirken bir hata oluştu.");
            }
        }

        public async Task<Result<bool>> ValidateTaxNumberAsync(string taxNumber, int? excludeId = null)
        {
            try
            {
                var isUnique = await _supplierRepository.IsTaxNumberUniqueAsync(taxNumber, excludeId);
                if (!isUnique)
                {
                    return Result<bool>.Failure("Bu vergi numarası zaten kayıtlı.");
                }
                return Result<bool>.SuccessResult(true, "Vergi numarası kullanılabilir.");
            }
            catch (Exception ex)
            {
                return Result<bool>.Failure("Vergi numarası kontrolü yapılırken bir hata oluştu.");
            }
        }

        public async Task<Result<Dictionary<string, object>>> GetSupplierStatisticsAsync(int? companyId)
        {
            try
            {
                var query = _context.Suppliers.AsQueryable();
                if (companyId.HasValue)
                {
                    query = query.Where(s => s.CompanyId == companyId.Value);
                }

                var totalSuppliers = await query.CountAsync();
                var activeSuppliers = await query.CountAsync(s => s.IsActive);
                var inactiveSuppliers = totalSuppliers - activeSuppliers;

                var suppliersWithCreditLimit = await query.CountAsync(s => s.CreditLimit.HasValue && s.CreditLimit > 0);
                var totalCreditLimit = await query.Where(s => s.CreditLimit.HasValue).SumAsync(s => s.CreditLimit.Value);

                var suppliersCreatedThisMonth = await query.CountAsync(s => s.CreatedAt.Month == DateTime.Now.Month && s.CreatedAt.Year == DateTime.Now.Year);

                var topCities = await query
                    .Where(s => !string.IsNullOrEmpty(s.City))
                    .GroupBy(s => s.City)
                    .Select(g => new { City = g.Key, Count = g.Count() })
                    .OrderByDescending(x => x.Count)
                    .Take(5)
                    .ToListAsync();

                var statistics = new Dictionary<string, object>
                {
                    ["totalSuppliers"] = totalSuppliers,
                    ["activeSuppliers"] = activeSuppliers,
                    ["inactiveSuppliers"] = inactiveSuppliers,
                    ["suppliersWithCreditLimit"] = suppliersWithCreditLimit,
                    ["totalCreditLimit"] = totalCreditLimit,
                    ["suppliersCreatedThisMonth"] = suppliersCreatedThisMonth,
                    ["topCities"] = topCities
                };

                return Result<Dictionary<string, object>>.SuccessResult(statistics);
            }
            catch (Exception ex)
            {
                return Result<Dictionary<string, object>>.Failure("Tedarikçi istatistikleri getirilirken bir hata oluştu.");
            }
        }
    }
}   
