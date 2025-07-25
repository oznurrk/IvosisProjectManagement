using IvosisProjectManagement.API.Attributes;
using IvosisProjectManagement.API.Enums;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class ProjectTypesController : ControllerBase
{
    private readonly IProjectTypeService _service;

    public ProjectTypesController(IProjectTypeService service)
    {
        _service = service;
    }

    [HttpGet]
    [LogActivity(ActivityType.View, "ProjectTypes")]
    public async Task<IActionResult> GetAll()
    {
        var items = await _service.GetAllAsync();
        return Ok(items);
    }
}
