public interface IUnitRepository : IBaseRepository<Unit>
    {
        Task<bool> IsUnitCodeUniqueAsync(string code, int? excludeId = null);
        Task<bool> IsUsedInItemsAsync(int unitId);
    }