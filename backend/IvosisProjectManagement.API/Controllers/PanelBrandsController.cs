using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class PanelBrandsController : ControllerBase
{
    private readonly IPanelBrandService _service;

    public PanelBrandsController(IPanelBrandService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(items);
    }
}
