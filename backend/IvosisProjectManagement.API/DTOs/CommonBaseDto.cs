public abstract class CommonBaseDto
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public int CreatedBy { get; set; }
    public string? CreatedByName { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int? UpdatedBy { get; set; }
    public string? UpdatedByName { get; set; }
  
}