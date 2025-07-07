using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace IvosisProjectManagement.API.Controllers
{
    [ApiController]
    public class BaseController : ControllerBase
    {
        protected int GetCurrentUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdStr, out var userId) ? userId : 0;
        }
    }
}
