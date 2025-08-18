namespace IvosisProjectManagement.API.DTOs
{
    public class SupplierCompanyDto : CompanyDto
    {
        public int SupplierId { get; set; }
        public bool IsActive { get; set; }
        public string SupplierName { get; set; }
    }
}