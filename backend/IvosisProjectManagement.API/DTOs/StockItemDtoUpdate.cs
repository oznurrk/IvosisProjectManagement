namespace IvosisProjectManagement.API.DTOs
{
    public class StockItemDtoUpdate : StockItemDtoCreate
    {
        public bool IsActive { get; set; } = true;
        public bool IsDiscontinued { get; set; } = false;
    }
}