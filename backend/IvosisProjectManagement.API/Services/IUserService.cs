using IvosisProjectManagement.API.Models;

namespace IvosisProjectManagement.API.Services
{
    public interface IUserService
    {
        
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User?> GetByIdAsync(int id);
        Task<User> CreateUserAsync(UserRegisterDto dto);
        Task<bool> UpdateAsync(int id, UserUpdateDto dto);
        
    }
}
