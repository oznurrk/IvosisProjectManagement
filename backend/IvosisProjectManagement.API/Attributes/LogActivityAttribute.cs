using System.Security.Claims;
using IvosisProjectManagement.API.Enums;
using IvosisProjectManagement.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;

namespace IvosisProjectManagement.API.Attributes
{
    public class LogActivityAttribute : ActionFilterAttribute
    {
        private readonly ActivityType _activityType;
        private readonly string _entity;

        public LogActivityAttribute(ActivityType activityType, string entity)
        {
            _activityType = activityType;
            _entity = entity;
        }

       public override void OnActionExecuted(ActionExecutedContext context)
        {
            if (context.HttpContext.User.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                {
                    var activityService = context.HttpContext.RequestServices.GetService<IUserActivityService>();
                    if (activityService != null)
                    {
                        int? entityId = null;

                        if (context.RouteData.Values.ContainsKey("id"))
                        {
                            if (int.TryParse(context.RouteData.Values["id"]?.ToString(), out int id))
                            {
                                entityId = id;
                            }
                        }

                        // Async metodu senkron çağır
                        activityService.LogActivityAsync(userId, _activityType, _entity, entityId).GetAwaiter().GetResult();
                    }
                }
            }

            base.OnActionExecuted(context);
        }

    }
}
