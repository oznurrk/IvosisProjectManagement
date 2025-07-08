using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class InverterBrandsController : ControllerBase
{
    private readonly IInverterBrandService _service;

    public InverterBrandsController(IInverterBrandService service)
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
