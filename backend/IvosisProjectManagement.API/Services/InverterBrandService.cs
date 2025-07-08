using IvosisProjectManagement.API.Data;
using Microsoft.EntityFrameworkCore;

public class InverterBrandService : IInverterBrandService
{
    private readonly ApplicationDbContext _context;

    public InverterBrandService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<InverterBrand>> GetAllAsync()
    {
        return await _context.InverterBrands.ToListAsync();
    }
}
