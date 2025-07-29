using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.Models;
using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IvosisProjectManagement.API.Services
{
    public class PersonnelService : IPersonnelService
    {
        private readonly ApplicationDbContext _context;

        public PersonnelService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PersonnelDto>> GetAllPersonnelAsync()
        {
            return await _context.Personnel
                .Select(p => new PersonnelDto
                {
                    Id = p.Id,
                    SicilNo = p.SicilNo,
                    Name = p.Name,
                    Surname = p.Surname,
                    Title = p.Title,
                    Badge = p.Badge,
                    Department = p.Department,
                    Section = p.Section,
                    StartDate = p.StartDate,
                    BirthPlace = p.BirthPlace,
                    BirthDate = p.BirthDate,
                    TCKimlikNo = p.TCKimlikNo,
                    EducationLevel = p.EducationLevel,
                    Gender = p.Gender,
                    Nationality = p.Nationality,
                    City = p.City,
                    District = p.District,
                    Address = p.Address,
                    MobilePhone = p.MobilePhone,
                    Email = p.Email,
                    Salary = p.Salary,
                    IBAN = p.IBAN,
                    Photo = p.Photo,
                    WorkStatus = p.WorkStatus,
                    CreatedDate = p.CreatedDate,
                    UpdatedDate = p.UpdatedDate
                })
                .ToListAsync();
        }

        public async Task<PersonnelDto?> GetByIdAsync(int id)
        {
            var personnel = await _context.Personnel.FindAsync(id);
            if (personnel == null) return null;

            return new PersonnelDto
            {
                Id = personnel.Id,
                SicilNo = personnel.SicilNo,
                Name = personnel.Name,
                Surname = personnel.Surname,
                Title = personnel.Title,
                Badge = personnel.Badge,
                Department = personnel.Department,
                Section = personnel.Section,
                StartDate = personnel.StartDate,
                BirthPlace = personnel.BirthPlace,
                BirthDate = personnel.BirthDate,
                TCKimlikNo = personnel.TCKimlikNo,
                EducationLevel = personnel.EducationLevel,
                Gender = personnel.Gender,
                Nationality = personnel.Nationality,
                City = personnel.City,
                District = personnel.District,
                Address = personnel.Address,
                MobilePhone = personnel.MobilePhone,
                Email = personnel.Email,
                Salary = personnel.Salary,
                IBAN = personnel.IBAN,
                Photo = personnel.Photo,
                WorkStatus = personnel.WorkStatus,
                CreatedDate = personnel.CreatedDate,
                UpdatedDate = personnel.UpdatedDate
            };
        }

        public async Task<PersonnelDto?> GetBySicilNoAsync(string sicilNo)
        {
            var personnel = await _context.Personnel.FirstOrDefaultAsync(p => p.SicilNo == sicilNo);
            if (personnel == null) return null;

            return new PersonnelDto
            {
                Id = personnel.Id,
                SicilNo = personnel.SicilNo,
                Name = personnel.Name,
                Surname = personnel.Surname,
                Title = personnel.Title,
                Badge = personnel.Badge,
                Department = personnel.Department,
                Section = personnel.Section,
                StartDate = personnel.StartDate,
                BirthPlace = personnel.BirthPlace,
                BirthDate = personnel.BirthDate,
                TCKimlikNo = personnel.TCKimlikNo,
                EducationLevel = personnel.EducationLevel,
                Gender = personnel.Gender,
                Nationality = personnel.Nationality,
                City = personnel.City,
                District = personnel.District,
                Address = personnel.Address,
                MobilePhone = personnel.MobilePhone,
                Email = personnel.Email,
                Salary = personnel.Salary,
                IBAN = personnel.IBAN,
                Photo = personnel.Photo,
                WorkStatus = personnel.WorkStatus,
                CreatedDate = personnel.CreatedDate,
                UpdatedDate = personnel.UpdatedDate
            };
        }

        public async Task<PersonnelDto> CreatePersonnelAsync(PersonnelCreateDto dto)
        {
            var personnel = new Personnel
            {
                SicilNo = dto.SicilNo,
                Name = dto.Name,
                Surname = dto.Surname,
                Title = dto.Title,
                Badge = dto.Badge,
                Department = dto.Department,
                Section = dto.Section,
                StartDate = dto.StartDate,
                BirthPlace = dto.BirthPlace,
                BirthDate = dto.BirthDate,
                TCKimlikNo = dto.TCKimlikNo,
                EducationLevel = dto.EducationLevel,
                Gender = dto.Gender,
                Nationality = dto.Nationality,
                City = dto.City,
                District = dto.District,
                Address = dto.Address,
                MobilePhone = dto.MobilePhone,
                Email = dto.Email,
                Salary = dto.Salary,
                IBAN = dto.IBAN,
                Photo = dto.Photo,
                WorkStatus = dto.WorkStatus,
                CreatedDate = DateTime.Now,
                UpdatedDate = DateTime.Now
            };

            _context.Personnel.Add(personnel);
            await _context.SaveChangesAsync();

            return new PersonnelDto
            {
                Id = personnel.Id,
                SicilNo = personnel.SicilNo,
                Name = personnel.Name,
                Surname = personnel.Surname,
                Title = personnel.Title,
                Badge = personnel.Badge,
                Department = personnel.Department,
                Section = personnel.Section,
                StartDate = personnel.StartDate,
                BirthPlace = personnel.BirthPlace,
                BirthDate = personnel.BirthDate,
                TCKimlikNo = personnel.TCKimlikNo,
                EducationLevel = personnel.EducationLevel,
                Gender = personnel.Gender,
                Nationality = personnel.Nationality,
                City = personnel.City,
                District = personnel.District,
                Address = personnel.Address,
                MobilePhone = personnel.MobilePhone,
                Email = personnel.Email,
                Salary = personnel.Salary,
                IBAN = personnel.IBAN,
                Photo = personnel.Photo,
                WorkStatus = personnel.WorkStatus,
                CreatedDate = personnel.CreatedDate,
                UpdatedDate = personnel.UpdatedDate
            };
        }

        public async Task<bool> UpdateAsync(int id, PersonnelUpdateDto dto)
        {
            var personnel = await _context.Personnel.FindAsync(id);
            if (personnel == null) return false;

            personnel.SicilNo = dto.SicilNo;
            personnel.Name = dto.Name;
            personnel.Surname = dto.Surname;
            personnel.Title = dto.Title;
            personnel.Badge = dto.Badge;
            personnel.Department = dto.Department;
            personnel.Section = dto.Section;
            personnel.StartDate = dto.StartDate;
            personnel.BirthPlace = dto.BirthPlace;
            personnel.BirthDate = dto.BirthDate;
            personnel.TCKimlikNo = dto.TCKimlikNo;
            personnel.EducationLevel = dto.EducationLevel;
            personnel.Gender = dto.Gender;
            personnel.Nationality = dto.Nationality;
            personnel.City = dto.City;
            personnel.District = dto.District;
            personnel.Address = dto.Address;
            personnel.MobilePhone = dto.MobilePhone;
            personnel.Email = dto.Email;
            personnel.Salary = dto.Salary;
            personnel.IBAN = dto.IBAN;
            personnel.Photo = dto.Photo;
            personnel.WorkStatus = dto.WorkStatus;
            personnel.UpdatedDate = DateTime.Now;

            _context.Personnel.Update(personnel);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var personnel = await _context.Personnel.FindAsync(id);
            if (personnel == null) return false;

            _context.Personnel.Remove(personnel);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> SicilNoExistsAsync(string sicilNo)
        {
            return await _context.Personnel.AnyAsync(p => p.SicilNo == sicilNo);
        }

        public async Task<bool> TCKimlikNoExistsAsync(string tcKimlikNo)
        {
            if (string.IsNullOrWhiteSpace(tcKimlikNo)) return false;
            return await _context.Personnel.AnyAsync(p => p.TCKimlikNo == tcKimlikNo);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return false;
            return await _context.Personnel.AnyAsync(p => p.Email == email);
        }
    }
}