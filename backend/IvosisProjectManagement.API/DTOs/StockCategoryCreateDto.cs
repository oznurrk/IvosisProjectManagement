using System.ComponentModel.DataAnnotations;

public class StockCategoryCreateDto
    {
        [Required(ErrorMessage = "Kategori adı zorunludur.")]
        [StringLength(200, ErrorMessage = "Kategori adı maksimum 200 karakter olabilir.")]
        public string Name { get; set; } = "";

        [Required(ErrorMessage = "Kategori kodu zorunludur.")]
        [StringLength(40, ErrorMessage = "Kategori kodu maksimum 40 karakter olabilir.")]
        public string Code { get; set; } = "";

        [StringLength(1000, ErrorMessage = "Açıklama maksimum 1000 karakter olabilir.")]
        public string? Description { get; set; }

        public int? ParentCategoryId { get; set; }

        public int? CompanyId { get; set; }

        public bool IsActive { get; set; } = true;
    }