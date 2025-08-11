using IvosisProjectManagement.API.Repositories.Interfaces;

namespace IvosisProjectManagement.API.Repositories.Interfaces
{
    public interface IMaterialNameRepository : IBaseRepository<MaterialName>
    {
        Task<IEnumerable<MaterialName>> GetActiveAsync();
        Task<bool> IsCodeUniqueAsync(string code, int? excludeId = null);
    }
}