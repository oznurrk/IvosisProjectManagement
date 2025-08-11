using IvosisProjectManagement.API.Repositories.Interfaces;

namespace IvosisProjectManagement.API.Repositories.Interfaces
{
    public interface IMaterialTypeRepository : IBaseRepository<MaterialType>
    {
        Task<IEnumerable<MaterialType>> GetActiveAsync();
        Task<IEnumerable<MaterialType>> GetByMaterialNameIdAsync(int materialNameId);
        Task<MaterialType> GetByIdWithDetailsAsync(int id);
        Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
    }
}