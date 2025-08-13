using System.IO;

namespace IvosisProjectManagement.API.Helpers
{
    public static class FileHelper
    {
        public static List<string> NormalizeFilePaths(List<string> input)
        {
            return input.Select(path =>
            {
                var uri = new Uri(path, UriKind.RelativeOrAbsolute);
                return uri.IsAbsoluteUri ? uri.LocalPath.TrimStart('/') : path;
            }).ToList();
        }

        public static string ExtractOriginalFileName(string fullPath)
        {
            var nameOnly = Path.GetFileName(fullPath);
            var parts = nameOnly.Split('_');
            return parts.Length >= 3 ? string.Join("_", parts.Skip(2)) : nameOnly;
        }

        // Orijinal dosya adından tam path'i bul
        public static string FindFileByOriginalName(List<string> filePaths, string originalFileName)
        {
            return filePaths.FirstOrDefault(path =>
                ExtractOriginalFileName(path).Equals(originalFileName, StringComparison.OrdinalIgnoreCase));
        }

        // Dosya var mı kontrol et
        public static bool FileExists(List<string> filePaths, string originalFileName)
        {
            string fullPath = FindFileByOriginalName(filePaths, originalFileName);
            return !string.IsNullOrEmpty(fullPath) && File.Exists(fullPath);
        }

        // Dosya stream'i al (herhangi bir uzantı için)
        public static Stream GetFileStream(List<string> filePaths, string originalFileName)
        {
            string fullPath = FindFileByOriginalName(filePaths, originalFileName);
            if (!string.IsNullOrEmpty(fullPath) && File.Exists(fullPath))
            {
                return File.OpenRead(fullPath);
            }
            return null;
        }

        // Dosya byte array olarak al
        public static byte[] GetFileBytes(List<string> filePaths, string originalFileName)
        {
            string fullPath = FindFileByOriginalName(filePaths, originalFileName);
            if (!string.IsNullOrEmpty(fullPath) && File.Exists(fullPath))
            {
                return File.ReadAllBytes(fullPath);
            }
            return null;
        }

        // Content type belirleme
        public static string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".txt" => "text/plain",
                ".pdf" => "application/pdf",
                ".png" => "image/png",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".gif" => "image/gif",
                ".bmp" => "image/bmp",
                ".svg" => "image/svg+xml",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".ppt" => "application/vnd.ms-powerpoint",
                ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                ".zip" => "application/zip",
                ".rar" => "application/x-rar-compressed",
                ".7z" => "application/x-7z-compressed",
                ".mp3" => "audio/mpeg",
                ".mp4" => "video/mp4",
                ".avi" => "video/x-msvideo",
                ".csv" => "text/csv",
                ".json" => "application/json",
                ".xml" => "application/xml",
                _ => "application/octet-stream"
            };
        }
        public static async Task<string> SaveFileAsync(IFormFile file, int taskId)
        {
            // Upload dizinini oluştur
            string uploadDir = Path.Combine("uploads", "tasks", taskId.ToString());
            Directory.CreateDirectory(uploadDir);

            // Güvenli dosya adı oluştur
            string fileName = $"{Guid.NewGuid()}_{file.FileName}";
            string filePath = Path.Combine(uploadDir, fileName);

            // Dosyayı kaydet
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Orijinal dosya adını koruyarak path döndür
            return $"{filePath}|{file.FileName}"; // Format: "fiziksel_path|orijinal_ad"
        }

        /// <summary>
        /// Belirtilen orijinal dosya adına sahip dosyayı sil
        /// </summary>
        /// <param name="filePaths">Dosya path listesi</param>
        /// <param name="originalFileName">Silinecek dosyanın orijinal adı</param>
        /// <returns>Silme işlemi başarılı ise true</returns>
        public static bool DeleteFile(List<string> filePaths, string originalFileName)
        {
            try
            {
                string fullPath = FindFileByOriginalName(filePaths, originalFileName);
                if (!string.IsNullOrEmpty(fullPath) && File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    return true;
                }
                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }

        /// <summary>
        /// Tam dosya path'i ile dosyayı sil
        /// </summary>
        /// <param name="fullPath">Silinecek dosyanın tam path'i</param>
        /// <returns>Silme işlemi başarılı ise true</returns>
        public static bool DeleteFileByPath(string fullPath)
        {
            try
            {
                if (!string.IsNullOrEmpty(fullPath) && File.Exists(fullPath))
                {
                    File.Delete(fullPath);
                    return true;
                }
                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }

        /// <summary>
        /// Task'a ait tüm dosyaları sil
        /// </summary>
        /// <param name="filePaths">Silinecek dosya path listesi</param>
        /// <returns>Silinen dosya sayısı</returns>
        public static int DeleteAllFiles(List<string> filePaths)
        {
            int deletedCount = 0;
            
            foreach (var filePath in filePaths)
            {
                try
                {
                    // Eğer path format "fiziksel_path|orijinal_ad" şeklindeyse
                    string actualPath = filePath.Contains('|') ? filePath.Split('|')[0] : filePath;
                    
                    if (File.Exists(actualPath))
                    {
                        File.Delete(actualPath);
                        deletedCount++;
                    }
                }
                catch (Exception)
                {
                    // Hata durumunda devam et
                    continue;
                }
            }
            
            return deletedCount;
        }

        /// <summary>
        /// Task klasörünü tamamen sil (boşsa)
        /// </summary>
        /// <param name="taskId">Task ID</param>
        /// <returns>Klasör silindi ise true</returns>
        public static bool DeleteTaskDirectory(int taskId)
        {
            try
            {
                string taskDir = Path.Combine("uploads", "tasks", taskId.ToString());
                
                if (Directory.Exists(taskDir))
                {
                    // Klasör boş mu kontrol et
                    if (!Directory.EnumerateFileSystemEntries(taskDir).Any())
                    {
                        Directory.Delete(taskDir);
                        return true;
                    }
                }
                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}