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
    }
}
