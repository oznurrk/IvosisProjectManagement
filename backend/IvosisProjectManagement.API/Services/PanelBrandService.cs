using IvosisProjectManagement.API.Data;
using Microsoft.EntityFrameworkCore;

public class PanelBrandService : IPanelBrandService
{
    private readonly ApplicationDbContext _context;

    public PanelBrandService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PanelBrand>> GetAllAsync()
    {
        return await _context.PanelBrands.ToListAsync();
    }
}
