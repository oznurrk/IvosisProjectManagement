public class City
{
    public int Id { get; set; }
    public string Name { get; set; }

    // Navigational property
    public ICollection<District> Districts { get; set; }
    
}
