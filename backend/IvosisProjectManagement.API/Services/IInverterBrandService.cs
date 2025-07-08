public interface IInverterBrandService
{
    Task<IEnumerable<InverterBrand>> GetAllAsync();
}
