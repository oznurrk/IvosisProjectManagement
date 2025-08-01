using IvosisProjectManagement.API.Models;
using IvosisProjectManagement.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IvosisProjectManagement.API.Data;
using Microsoft.EntityFrameworkCore;
using IvosisProjectManagement.API.Attributes;
using IvosisProjectManagement.API.Enums;

namespace IvosisProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        [LogActivity(ActivityType.Login, "Auth")]
        public async Task<IActionResult> Login(UserLoginDto loginDto)
        {
            // Kullanıcıyı firma ve departman bilgileri ile birlikte al
            var user = await _context.Users
                .Include(u => u.Company)
                .Include(u => u.Department)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
                return Unauthorized("Geçersiz e-posta.");

            bool passwordMatches = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password);
            if (!passwordMatches)
                return Unauthorized("Geçersiz şifre.");

            var token = GenerateJwtToken(user);
            
            return Ok(new
            {
                token,
                userId = user.Id,
                userName = user.Name,
                role = user.Role, // Eski rol sistemi için
                companyId = user.CompanyId,
                companyName = user.Company?.Name,
                companyCode = user.Company?.Code,
                departmentId = user.DepartmentId,
                departmentName = user.Department?.Name,
                roles = user.UserRoles?.Where(ur => ur.IsActive)
                    .Select(ur => new { 
                        roleId = ur.Role.Id,
                        roleName = ur.Role.Name,
                        roleCode = ur.Role.Code,
                        scope = ur.Role.Scope
                    }).ToList()
            });
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new List<Claim> {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim("userId", user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Role, user.Role!), // Eski rol sistemi için
            };

            // Firma bilgilerini ekle
            if (user.CompanyId.HasValue)
            {
                claims.Add(new Claim("companyId", user.CompanyId.Value.ToString()));
                claims.Add(new Claim("companyCode", user.Company?.Code ?? ""));
            }

            // Departman bilgilerini ekle
            if (user.DepartmentId.HasValue)
            {
                claims.Add(new Claim("departmentId", user.DepartmentId.Value.ToString()));
            }

            // Yeni rol sistemindeki rolleri ekle
            if (user.UserRoles != null && user.UserRoles.Any())
            {
                foreach (var userRole in user.UserRoles.Where(ur => ur.IsActive))
                {
                    claims.Add(new Claim("userRole", userRole.Role.Code));
                    claims.Add(new Claim("roleScope", userRole.Role.Scope));
                }
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(3),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}