//Kullanıcılara göre görev sayısı
public class UserTaskStatDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int OngoingTasks { get; set; }
}
