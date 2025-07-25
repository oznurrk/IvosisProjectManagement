using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IvosisProjectManagement.API.Models
{
    public class UserActivityLog
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Entity { get; set; } = string.Empty;
        public int? EntityId { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string IpAddress { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? AdditionalInfo { get; set; }

        // Navigation property
        public User User { get; set; } = null!;
    }
}
