using IvosisProjectManagement.API.Data;
using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.Models;
using Microsoft.EntityFrameworkCore;
using IvosisProjectManagement.API.Helpers;

namespace IvosisProjectManagement.API.Services
{
    public class ProjectTaskService : IProjectTaskService
    {
        private readonly ApplicationDbContext _context;

        public ProjectTaskService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProjectTaskDto>> GetAllAsync()
        {
            var items = await _context.ProjectTasks
                .Select(pt => new ProjectTaskDto
                {
                    Id = pt.Id,
                    ProjectId = pt.ProjectId,
                    ProcessId = pt.ProcessId,
                    TaskId = pt.TaskId,
                    AssignedUserId = pt.AssignedUserId,
                    Status = pt.Status,
                    StartDate = pt.StartDate,
                    EndDate = pt.EndDate,
                    Description = pt.Description,
                    FilePath = pt.FilePath ?? new List<string>(),
                    CreatedAt = pt.CreatedAt,
                    CreatedBy = pt.CreatedBy ?? 0,
                    UpdatedAt = pt.UpdatedAt,
                    UpdatedBy = pt.UpdatedBy
                }).ToListAsync();

            foreach (var item in items)
                item.FilePath = FileHelper.NormalizeFilePaths(item.FilePath);

            return items;
        }

        public async Task<ProjectTaskDto?> GetByIdAsync(int id)
        {
            var pt = await _context.ProjectTasks
                .Include(x => x.Project)           // Navigation property ile join
                .Include(x => x.Task)
                .Include(x => x.Process)
                .Include(x => x.AssignedUser)      // User bilgilerini getir
                .Include(x => x.CreatedByUser)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (pt == null) return null;

            return new ProjectTaskDto
            {
                Id = pt.Id,
                ProjectId = pt.ProjectId,
                ProcessId = pt.ProcessId,
                TaskId = pt.TaskId,
                AssignedUserId = pt.AssignedUserId,
                Status = pt.Status,
                StartDate = pt.StartDate,
                EndDate = pt.EndDate,
                Description = pt.Description,
                FilePath = FileHelper.NormalizeFilePaths(pt.FilePath ?? new List<string>()),
                CreatedAt = pt.CreatedAt,
                CreatedBy = pt.CreatedBy ?? 0,
                UpdatedAt = pt.UpdatedAt,
                UpdatedBy = pt.UpdatedBy,
                ProjectName = pt.Project?.Name,
                TaskTitle = pt.Task?.Title,
                ProcessName = pt.Process?.Name
            };
        }

        public async Task<IEnumerable<ProjectTaskDto>> GetTasksByProjectIdAsync(int projectId)
        {
            /* var items = await _context.ProjectTasks
                 .Where(pt => pt.ProjectId == projectId)
                 .Select(pt => new ProjectTaskDto
                 {
                     Id = pt.Id,
                     ProjectId = pt.ProjectId,
                     ProcessId = pt.ProcessId,
                     TaskId = pt.TaskId,
                     AssignedUserId = pt.AssignedUserId,
                     Status = pt.Status,
                     StartDate = pt.StartDate,
                     EndDate = pt.EndDate,
                     Description = pt.Description,
                     FilePath = pt.FilePath ?? new List<string>(),
                     CreatedAt = pt.CreatedAt,
                     CreatedBy = pt.CreatedBy,
                     UpdatedAt = pt.UpdatedAt,
                     UpdatedBy = pt.UpdatedBy
                 })
                 .ToListAsync();

             foreach (var item in items)
                 item.FilePath = FileHelper.NormalizeFilePaths(item.FilePath);

             return items;*/
            var items = await _context.ProjectTasks
                .Include(pt => pt.Project)
                .Include(pt => pt.Task)
                .Include(pt => pt.Process)
                .Include(pt => pt.AssignedUser)
                .Include(pt => pt.CreatedByUser)
                .Where(pt => pt.ProjectId == projectId)
                .ToListAsync();

            return items.Select(pt => new ProjectTaskDto
            {
                Id = pt.Id,
                ProjectId = pt.ProjectId,
                ProcessId = pt.ProcessId,
                TaskId = pt.TaskId,
                AssignedUserId = pt.AssignedUserId,
                Status = pt.Status,
                StartDate = pt.StartDate,
                EndDate = pt.EndDate,
                Description = pt.Description,
                FilePath = FileHelper.NormalizeFilePaths(pt.FilePath ?? new List<string>()),
                CreatedAt = pt.CreatedAt,
                CreatedBy = pt.CreatedBy ?? 0,
                UpdatedAt = pt.UpdatedAt,
                UpdatedBy = pt.UpdatedBy,
                ProjectName = pt.Project?.Name,
                TaskTitle = pt.Task?.Title,
                ProcessName = pt.Process?.Name
            }).ToList();
        }

        public async Task<List<ProjectTaskDto>> GetTasksByUserIdAsync(int userId)
        {
            var tasks = await _context.ProjectTasks
                .Include(pt => pt.Project)
                .Include(pt => pt.Task)
                .Include(pt => pt.Process)
                .Where(pt => pt.AssignedUserId == userId)
                .OrderByDescending(pt => pt.CreatedAt)
                .ToListAsync();

            return tasks.Select(pt => new ProjectTaskDto
            {
                Id = pt.Id,
                ProjectId = pt.ProjectId,
                ProcessId = pt.ProcessId,
                TaskId = pt.TaskId,
                AssignedUserId = pt.AssignedUserId,
                Status = pt.Status,
                StartDate = pt.StartDate,
                EndDate = pt.EndDate,
                Description = pt.Description,
                FilePath = FileHelper.NormalizeFilePaths(pt.FilePath ?? new List<string>()),
                CreatedAt = pt.CreatedAt,
                CreatedBy = pt.CreatedBy ?? 0,
                UpdatedAt = pt.UpdatedAt,
                UpdatedBy = pt.UpdatedBy,
                ProjectName = pt.Project?.Name,
                TaskTitle = pt.Task?.Title,
                ProcessName = pt.Process?.Name
            }).ToList();
        }

        public async Task<ProjectTaskDto> CreateAsync(ProjectTaskCreateDto dto)
        {
            var pt = new ProjectTask
            {
                ProjectId = dto.ProjectId,
                ProcessId = dto.ProcessId,
                TaskId = dto.TaskId,
                AssignedUserId = dto.AssignedUserId,
                Status = dto.Status,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Description = dto.Description,
                FilePath = FileHelper.NormalizeFilePaths(dto.FilePath ?? new List<string>()),
                CreatedAt = DateTime.Now,
                CreatedBy = dto.CreatedBy
            };
            _context.ProjectTasks.Add(pt);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(pt.Id) ?? throw new Exception("Project task not found after creation.");
        }

        public async Task<IEnumerable<ProjectTaskDto>> CreateManyAsync(List<ProjectTaskCreateDto> dtos)
        {
            var entities = dtos.Select(dto => new ProjectTask
            {
                ProjectId = dto.ProjectId,
                ProcessId = dto.ProcessId,
                TaskId = dto.TaskId,
                AssignedUserId = dto.AssignedUserId,
                Status = dto.Status,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Description = dto.Description,
                FilePath = FileHelper.NormalizeFilePaths(dto.FilePath ?? new List<string>()),
                CreatedAt = DateTime.Now,
                CreatedBy = dto.CreatedBy
            }).ToList();

            _context.ProjectTasks.AddRange(entities);
            await _context.SaveChangesAsync();

            return entities.Select(entity => new ProjectTaskDto
            {
                Id = entity.Id,
                ProjectId = entity.ProjectId,
                ProcessId = entity.ProcessId,
                TaskId = entity.TaskId,
                AssignedUserId = entity.AssignedUserId,
                Status = entity.Status,
                StartDate = entity.StartDate,
                EndDate = entity.EndDate,
                Description = entity.Description,
                FilePath = FileHelper.NormalizeFilePaths(entity.FilePath ?? new List<string>()),
                CreatedAt = entity.CreatedAt,
                CreatedBy = entity.CreatedBy ?? 0
            }).ToList();
        }

        public async Task<bool> UpdateAsync(int id, ProjectTaskUpdateDto dto)
        {
            var pt = await _context.ProjectTasks.FindAsync(id);
            if (pt == null) return false;

            pt.Status = dto.Status;
            pt.StartDate = dto.StartDate;
            pt.EndDate = dto.EndDate;
            pt.Description = dto.Description;
            pt.AssignedUserId = dto.AssignedUserId;
            pt.FilePath = FileHelper.NormalizeFilePaths(dto.FilePath ?? new List<string>());
            pt.UpdatedAt = DateTime.Now;
            pt.UpdatedBy = dto.UpdatedBy;

            _context.ProjectTasks.Update(pt);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var pt = await _context.ProjectTasks.FindAsync(id);
            if (pt == null) return false;

            _context.ProjectTasks.Remove(pt);
            await _context.SaveChangesAsync();
            return true;
        }

        // Dosya işlemleri için yeni metodlar
        public async Task<byte[]> GetTaskFileAsync(int taskId, string fileName)
        {
            var task = await _context.ProjectTasks.FindAsync(taskId);
            if (task == null) return null;

            var normalizedPaths = FileHelper.NormalizeFilePaths(task.FilePath ?? new List<string>());
            return FileHelper.GetFileBytes(normalizedPaths, fileName);
        }

        public async Task<Stream> GetTaskFileStreamAsync(int taskId, string fileName)
        {
            var task = await _context.ProjectTasks.FindAsync(taskId);
            if (task == null) return null;

            var normalizedPaths = FileHelper.NormalizeFilePaths(task.FilePath ?? new List<string>());
            return FileHelper.GetFileStream(normalizedPaths, fileName);
        }

        public async Task<bool> TaskFileExistsAsync(int taskId, string fileName)
        {
            var task = await _context.ProjectTasks.FindAsync(taskId);
            if (task == null) return false;

            var normalizedPaths = FileHelper.NormalizeFilePaths(task.FilePath ?? new List<string>());
            return FileHelper.FileExists(normalizedPaths, fileName);
        }

        public async Task<string> GetTaskFilePathAsync(int taskId, string fileName)
        {
            var task = await _context.ProjectTasks.FindAsync(taskId);
            if (task == null) return null;

            var normalizedPaths = FileHelper.NormalizeFilePaths(task.FilePath ?? new List<string>());
            return FileHelper.FindFileByOriginalName(normalizedPaths, fileName);
        }
        public async Task<List<string>> UploadTaskFilesAsync(int taskId, IFormFileCollection files, int userId)
        {
            var task = await _context.ProjectTasks.FindAsync(taskId);
            if (task == null)
                throw new Exception($"Task bulunamadı: {taskId}");

            var uploadedFilePaths = new List<string>();
            var currentFilePaths = task.FilePath ?? new List<string>();

            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    string savedFilePath = await FileHelper.SaveFileAsync(file, taskId);
                    uploadedFilePaths.Add(savedFilePath);
                    currentFilePaths.Add(savedFilePath);
                }
            }

            task.FilePath = FileHelper.NormalizeFilePaths(currentFilePaths);
            task.UpdatedAt = DateTime.Now;
            task.UpdatedBy = userId;

            _context.ProjectTasks.Update(task);
            await _context.SaveChangesAsync();

            return uploadedFilePaths;
        }

        // <summary>
        /// Task'tan belirli bir dosyayı sil
        /// </summary>
        /// <param name="taskId">Task ID</param>
        /// <param name="fileName">Silinecek dosyanın orijinal adı</param>
        /// <param name="userId">İşlemi yapan kullanıcı ID</param>
        /// <returns>Silme işlemi başarılı ise true</returns>
        public async Task<bool> DeleteTaskFileAsync(int taskId, string fileName, int userId)
        {
            var task = await _context.ProjectTasks.FindAsync(taskId);
            if (task == null) return false;

            var normalizedPaths = FileHelper.NormalizeFilePaths(task.FilePath ?? new List<string>());
            
            // Dosyayı fiziksel olarak sil
            bool fileDeleted = FileHelper.DeleteFile(normalizedPaths, fileName);
            
            if (fileDeleted)
            {
                // Listeden de kaldır
                var fileToRemove = normalizedPaths.FirstOrDefault(path => 
                    FileHelper.ExtractOriginalFileName(path).Equals(fileName, StringComparison.OrdinalIgnoreCase));
                
                if (fileToRemove != null)
                {
                    normalizedPaths.Remove(fileToRemove);
                    task.FilePath = normalizedPaths;
                    task.UpdatedAt = DateTime.Now;
                    task.UpdatedBy = userId;

                    _context.ProjectTasks.Update(task);
                    await _context.SaveChangesAsync();
                    
                    return true;
                }
            }
            
            return false;
        }

        /// <summary>
        /// Task'a ait tüm dosyaları sil
        /// </summary>
        /// <param name="taskId">Task ID</param>
        /// <param name="userId">İşlemi yapan kullanıcı ID</param>
        /// <returns>Silinen dosya sayısı</returns>
        public async Task<int> DeleteAllTaskFilesAsync(int taskId, int userId)
        {
            var task = await _context.ProjectTasks.FindAsync(taskId);
            if (task == null) return 0;

            var normalizedPaths = FileHelper.NormalizeFilePaths(task.FilePath ?? new List<string>());
            
            // Tüm dosyaları fiziksel olarak sil
            int deletedCount = FileHelper.DeleteAllFiles(normalizedPaths);
            
            if (deletedCount > 0)
            {
                // Task'ın file listesini temizle
                task.FilePath = new List<string>();
                task.UpdatedAt = DateTime.Now;
                task.UpdatedBy = userId;

                _context.ProjectTasks.Update(task);
                await _context.SaveChangesAsync();
                
                // Boş klasörü de sil
                FileHelper.DeleteTaskDirectory(taskId);
            }
            
            return deletedCount;
        }
    }
}