using IvosisProjectManagement.API.Models;

namespace IvosisProjectManagement.API.Services
{
    public interface IUserService
    {
        Task<IEnumerable<User>> GetUsersAsync();
    }
}
