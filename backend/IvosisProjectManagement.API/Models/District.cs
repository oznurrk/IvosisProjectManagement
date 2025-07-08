public class District
{
    public int Id { get; set; }
    public string Name { get; set; }

    public int CityId { get; set; }
    public City City { get; set; }

    public ICollection<Neighborhood> Neighborhoods { get; set; }
}
