
namespace IvosisProjectManagement.API.DTOs
{
    public class ProjectAddressDto
    {
        public int Id { get; set; }
        public int CityId { get; set; }
        public string CityName { get; set; } = null!;
        public int DistrictId { get; set; }
        public string DistrictName { get; set; } = null!;
        public int? NeighborhoodId { get; set; }
        public string? NeighborhoodName { get; set; }
        public string? Ada { get; set; }
        public string? Parsel { get; set; }
        public string? AdressDetails { get; set; }
    }
}
