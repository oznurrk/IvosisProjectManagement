using IvosisProjectManagement.API.Models;

namespace IvosisProjectManagement.API.Services
{
    public interface IUserService
    {
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User?> GetByIdAsync(int id);
        Task<User> CreateUserAsync(User user);
         Task<bool> UpdateAsync(User user);
        Task<bool> DeleteUserAsync(int id);
    }
}
