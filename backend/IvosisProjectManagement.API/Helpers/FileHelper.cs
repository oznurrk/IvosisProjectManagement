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
    }
}