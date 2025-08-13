using System.Collections;
using System.Text.Json;
using IvosisProjectManagement.API.Attributes;
using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.DTOs.Common;
using IvosisProjectManagement.API.Enums;
using IvosisProjectManagement.API.Helpers;
using IvosisProjectManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IvosisProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectTasksController : BaseController
    {
        private readonly IProjectTaskService _service;

        public ProjectTasksController(IProjectTaskService service)
        {
            _service = service;
        }

        [HttpGet]
        [LogActivity(ActivityType.View, "ProjectTask")]
        public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

        [HttpGet("{id}")]
        [LogActivity(ActivityType.View, "ProjectTask/id")]
        public async Task<IActionResult> Get(int id)
        {
            var item = await _service.GetByIdAsync(id);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet("by-project/{ProjectId}")]
        [LogActivity(ActivityType.View, "ProjectTask/ProjectId")]
        public async Task<IActionResult> GetProject(int ProjectId)
        {
            var item = await _service.GetTasksByProjectIdAsync(ProjectId);
            return item == null ? NotFound() : Ok(item);
        }

        [HttpGet("user/{userId}")]
        [LogActivity(ActivityType.View, "ProjectTask/userId")]
        public async Task<IActionResult> GetProjectTasksByUserId(int userId)
        {
            var result = await _service.GetTasksByUserIdAsync(userId);
            return Ok(Result<IList>.SuccessResult(result));
        }

        [HttpGet("my-tasks")]
        [LogActivity(ActivityType.View, "ProjectTask/my-tasks")]
        public async Task<IActionResult> GetMyTasks()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized(Result<string>.Failure("Kullanıcı kimliği alınamadı."));

            var tasks = await _service.GetTasksByUserIdAsync(userId);
            return Ok(Result<IList>.SuccessResult(tasks));
        }

        [HttpPost]
        [LogActivity(ActivityType.Create, "ProjectTask")]
        public async Task<IActionResult> Create([FromBody] object input)
        {
            int userId = GetCurrentUserId();

            // Tek nesne mi yoksa liste mi kontrol et
            if (input is null) return BadRequest();

            var json = input.ToString();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            List<ProjectTaskCreateDto> dtos;

            if (json!.TrimStart().StartsWith("["))
            {
                // Liste
                dtos = JsonSerializer.Deserialize<List<ProjectTaskCreateDto>>(json, options)!;
            }
            else
            {
                // Tek nesne
                var single = JsonSerializer.Deserialize<ProjectTaskCreateDto>(json, options)!;
                dtos = new List<ProjectTaskCreateDto> { single };
            }

            // Hepsine CreatedBy ekle
            foreach (var dto in dtos)
            {
                dto.CreatedBy = userId;
            }

            var result = await _service.CreateManyAsync(dtos);
            return Created("api/ProjectTasks", result);
        }

        [HttpPut("{id}")]
        [LogActivity(ActivityType.Update, "ProjectTask")]
        public async Task<IActionResult> Update(int id, ProjectTaskUpdateDto dto)
        {
            // UpdatedBy'yi set et
            dto.UpdatedBy = GetCurrentUserId();

            var updated = await _service.UpdateAsync(id, dto);
            if (!updated) return NotFound();

            // Güncellenmiş item'ı döndür
            var updatedItem = await _service.GetByIdAsync(id);
            return Ok(updatedItem);
        }

        [HttpDelete("{id}")]
        [LogActivity(ActivityType.Delete, "ProjectTask")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            return deleted ? Ok() : NotFound();
        }

        /// <summary>
        /// Task'a ait dosyayı indir (sadece dosya adı ile)
        /// </summary>
        /// <param name="taskId">Task ID</param>
        /// <param name="fileName">Orijinal dosya adı (örn: "Yeni Metin Belgesi.txt")</param>
        /// <returns>Dosya</returns>
        [HttpGet("{taskId}/files/{fileName}")]
        [LogActivity(ActivityType.View, "ProjectTask/File")]
        public async Task<IActionResult> DownloadTaskFile(int taskId, string fileName)
        {
            try
            {
                // URL'den decode et (dosya adında özel karakterler olabilir)
                fileName = Uri.UnescapeDataString(fileName);

                // Dosya var mı kontrol et
                bool fileExists = await _service.TaskFileExistsAsync(taskId, fileName);
                if (!fileExists)
                {
                    return NotFound($"Dosya bulunamadı: {fileName}");
                }

                // Dosyayı byte array olarak al
                byte[] fileBytes = await _service.GetTaskFileAsync(taskId, fileName);
                if (fileBytes == null)
                {
                    return NotFound($"Dosya okunamadı: {fileName}");
                }

                // Content type belirle
                string contentType = FileHelper.GetContentType(fileName);

                // Dosyayı döndür
                return File(fileBytes, contentType, fileName);
            }
            catch (Exception ex)
            {
                return BadRequest($"Dosya indirirken hata oluştu: {ex.Message}");
            }
        }

        /// <summary>
        /// Task'a ait dosyayı stream olarak indir
        /// </summary>
        /// <param name="taskId">Task ID</param>
        /// <param name="fileName">Orijinal dosya adı</param>
        /// <returns>Dosya stream</returns>
        [HttpGet("{taskId}/files/{fileName}/stream")]
        [LogActivity(ActivityType.View, "ProjectTask/FileStream")]
        public async Task<IActionResult> StreamTaskFile(int taskId, string fileName)
        {
            try
            {
                // URL'den decode et
                fileName = Uri.UnescapeDataString(fileName);

                // Dosya stream'i al
                Stream fileStream = await _service.GetTaskFileStreamAsync(taskId, fileName);
                if (fileStream == null)
                {
                    return NotFound($"Dosya bulunamadı: {fileName}");
                }

                // Content type belirle
                string contentType = FileHelper.GetContentType(fileName);

                // Stream'i döndür
                return File(fileStream, contentType, fileName);
            }
            catch (Exception ex)
            {
                return BadRequest($"Dosya stream'i oluştururken hata oluştu: {ex.Message}");
            }
        }

        /// <summary>
        /// Task'a ait tüm dosya adlarını listele
        /// </summary>
        /// <param name="taskId">Task ID</param>
        /// <returns>Dosya adları listesi</returns>
        [HttpGet("{taskId}/files")]
        [LogActivity(ActivityType.View, "ProjectTask/FileList")]
        public async Task<IActionResult> GetTaskFiles(int taskId)
        {
            var task = await _service.GetByIdAsync(taskId);
            if (task == null)
            {
                return NotFound($"Task bulunamadı: {taskId}");
            }

            return Ok(new
            {
                TaskId = taskId,
                Files = task.FileNames,
                Count = task.FileNames.Count
            });
        }

        /// <summary>
        /// Dosyanın tam path'ini al (debug/test için)
        /// </summary>
        /// <param name="taskId">Task ID</param>
        /// <param name="fileName">Orijinal dosya adı</param>
        /// <returns>Tam dosya yolu</returns>
        [HttpGet("{taskId}/files/{fileName}/path")]
        [LogActivity(ActivityType.View, "ProjectTask/FilePath")]
        public async Task<IActionResult> GetTaskFilePath(int taskId, string fileName)
        {
            try
            {
                // URL'den decode et
                fileName = Uri.UnescapeDataString(fileName);

                string filePath = await _service.GetTaskFilePathAsync(taskId, fileName);
                if (string.IsNullOrEmpty(filePath))
                {
                    return NotFound($"Dosya bulunamadı: {fileName}");
                }

                return Ok(new
                {
                    OriginalFileName = fileName,
                    FullPath = filePath,
                    Exists = System.IO.File.Exists(filePath)
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Dosya path'i alınırken hata oluştu: {ex.Message}");
            }
        }

        /// <summary>
        /// Task'a dosya(lar) yükle
        /// </summary>
        /// <param name="taskId">Task ID</param>
        /// <param name="files">Yüklenecek dosyalar</param>
        /// <returns>Yüklenen dosya bilgileri</returns>
        [HttpPost("{taskId}/upload-files")]
        [LogActivity(ActivityType.Create, "ProjectTask/FileUpload")]
        public async Task<IActionResult> UploadTaskFiles(int taskId, [FromForm] IFormFileCollection files)
        {
            try
            {
                // Task var mı kontrol et
                var task = await _service.GetByIdAsync(taskId);
                if (task == null)
                {
                    return NotFound($"Task bulunamadı: {taskId}");
                }

                // Dosya var mı kontrol et
                if (files == null || files.Count == 0)
                {
                    return BadRequest("Yüklenecek dosya bulunamadı.");
                }

                // Dosyaları yükle
                int userId = GetCurrentUserId();
                var uploadedFiles = await _service.UploadTaskFilesAsync(taskId, files, userId);

                return Ok(new
                {
                    TaskId = taskId,
                    UploadedFiles = uploadedFiles,
                    Count = uploadedFiles.Count,
                    Message = $"{uploadedFiles.Count} dosya başarıyla yüklendi."
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Dosya yüklerken hata oluştu: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Task'tan belirli bir dosyayı sil
        /// </summary>
        /// <param name="taskId">Task ID</param>
        /// <param name="fileName">Silinecek dosyanın orijinal adı</param>
        /// <returns>Silme sonucu</returns>
        [HttpDelete("{taskId}/files/{fileName}")]
        [LogActivity(ActivityType.Delete, "ProjectTask/File")]
        public async Task<IActionResult> DeleteTaskFile(int taskId, string fileName)
        {
            try
            {
                // URL'den decode et
                fileName = Uri.UnescapeDataString(fileName);
                
                // Task var mı kontrol et
                var task = await _service.GetByIdAsync(taskId);
                if (task == null)
                {
                    return NotFound($"Task bulunamadı: {taskId}");
                }

                // Dosya var mı kontrol et
                bool fileExists = await _service.TaskFileExistsAsync(taskId, fileName);
                if (!fileExists)
                {
                    return NotFound($"Dosya bulunamadı: {fileName}");
                }

                // Dosyayı sil
                int userId = GetCurrentUserId();
                bool deleted = await _service.DeleteTaskFileAsync(taskId, fileName, userId);
                
                if (deleted)
                {
                    return Ok(new
                    {
                        TaskId = taskId,
                        FileName = fileName,
                        Message = "Dosya başarıyla silindi."
                    });
                }
                else
                {
                    return BadRequest("Dosya silinemedi.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"Dosya silinirken hata oluştu: {ex.Message}");
            }
        }

        /// <summary>
        /// Task'a ait tüm dosyaları sil
        /// </summary>
        /// <param name="taskId">Task ID</param>
        /// <returns>Silme sonucu</returns>
        [HttpDelete("{taskId}/files")]
        [LogActivity(ActivityType.Delete, "ProjectTask/AllFiles")]
        public async Task<IActionResult> DeleteAllTaskFiles(int taskId)
        {
            try
            {
                // Task var mı kontrol et
                var task = await _service.GetByIdAsync(taskId);
                if (task == null)
                {
                    return NotFound($"Task bulunamadı: {taskId}");
                }

                // Tüm dosyaları sil
                int userId = GetCurrentUserId();
                int deletedCount = await _service.DeleteAllTaskFilesAsync(taskId, userId);
                
                return Ok(new
                {
                    TaskId = taskId,
                    DeletedFileCount = deletedCount,
                    Message = $"{deletedCount} dosya başarıyla silindi."
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Dosyalar silinirken hata oluştu: {ex.Message}");
            }
        }
    }
}