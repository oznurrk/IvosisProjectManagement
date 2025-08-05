using IvosisProjectManagement.API.Models;

public class ProjectAddress
{
    public int Id { get; set; }

    public int ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public int CityId { get; set; }
    public City City { get; set; } = null!;

    public int DistrictId { get; set; }
    public District District { get; set; } = null!;

    public int? NeighborhoodId { get; set; }
    public Neighborhood? Neighborhood { get; set; } // nullable yapılmalı

    public string? Ada { get; set; } // nullable yapılmalı
    public string? Parsel { get; set; } // nullable yapılmalı

    public string? AdressDetails { get; set; } // nullable yapılmalı
}
