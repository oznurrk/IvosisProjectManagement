using System.IO;

namespace IvosisProjectManagement.API.Helpers
{
    public static class FileHelper
    {
        public static string ExtractOriginalFileName(string fullPath)
        {
            var nameOnly = Path.GetFileName(fullPath); // uploads/1753448221691_0_belge.pdf → 1753448221691_0_belge.pdf
            var parts = nameOnly.Split('_');

            if (parts.Length >= 3)
            {
                return string.Join("_", parts.Skip(2)); // belge.pdf
            }

            return nameOnly;
        }
    }
}
