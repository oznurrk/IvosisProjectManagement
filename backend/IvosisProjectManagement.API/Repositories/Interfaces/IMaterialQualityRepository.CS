using IvosisProjectManagement.API.Repositories.Interfaces;

namespace IvosisProjectManagement.API.Repositories.Interfaces
{
    public interface IMaterialQualityRepository : IBaseRepository<MaterialQuality>
    {
        Task<IEnumerable<MaterialQuality>> GetActiveAsync();
        Task<IEnumerable<MaterialQuality>> GetByMaterialTypeIdAsync(int materialTypeId);
        Task<MaterialQuality> GetByIdWithDetailsAsync(int id);
        Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
    }
}