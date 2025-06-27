using IvosisProjectManagement.API.Models;
using IvosisProjectManagement.API.Data;
using Microsoft.EntityFrameworkCore;

namespace IvosisProjectManagement.API.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Models.Users>> GetUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }
    }
}