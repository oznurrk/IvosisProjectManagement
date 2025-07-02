using IvosisProjectManagement.API.DTOs;

namespace IvosisProjectManagement.API.Services
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto?> GetByIdAsync(int id);
        Task<UserDto> CreateUserAsync(UserRegisterDto dto);
        Task<bool> UpdateAsync(int id, UserUpdateDto dto);
    }
}
