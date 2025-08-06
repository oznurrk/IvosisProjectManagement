namespace IvosisProjectManagement.API.Models
{
    public class SupplierCompany :CompanyEntity
    {
        public int SupplierId { get; set; }
        public bool IsActive { get; set; } = true;
        public virtual Supplier Supplier { get; set; } = null!;
    }
}