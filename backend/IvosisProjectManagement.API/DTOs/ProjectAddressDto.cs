
namespace IvosisProjectManagement.API.DTOs
{
    public class ProjectAddressDto
    {
        public int CityId { get; set; }
        public int DistrictId { get; set; }
        public int? NeighborhoodId { get; set; }
        public string? Ada { get; set; }
        public string? Parsel { get; set; }
    }
}
