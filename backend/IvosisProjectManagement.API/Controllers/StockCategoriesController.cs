using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using IvosisProjectManagement.API.Services;
using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.Controllers;

namespace IvosisProjectManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StockCategoriesController : BaseController
    {
        private readonly IStockCategoryService _stockCategoryService;

        public StockCategoriesController(IStockCategoryService stockCategoryService)
        {
            _stockCategoryService = stockCategoryService;
        }

        /// <summary>
        /// Tüm stok kategorilerini getirir
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var categories = await _stockCategoryService.GetAllAsync();
                return Ok(new
                {
                    success = true,
                    data = categories,
                    message = "Kategoriler başarıyla getirildi."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Kategoriler getirilirken bir hata oluştu.",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// ID'ye göre kategori getirir
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var category = await _stockCategoryService.GetByIdAsync(id);
                return Ok(new
                {
                    success = true,
                    data = category,
                    message = "Kategori başarıyla getirildi."
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Kategori getirilirken bir hata oluştu.",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Ana kategorileri getirir (parent'ı olmayan)
        /// </summary>
        [HttpGet("main")]
        public async Task<IActionResult> GetMainCategories()
        {
            try
            {
                var categories = await _stockCategoryService.GetMainCategoriesAsync();
                return Ok(new
                {
                    success = true,
                    data = categories,
                    message = "Ana kategoriler başarıyla getirildi."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ana kategoriler getirilirken bir hata oluştu.",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Belirli bir kategorinin alt kategorilerini getirir
        /// </summary>
        [HttpGet("{parentId}/subcategories")]
        public async Task<IActionResult> GetSubCategories(int parentId)
        {
            try
            {
                var categories = await _stockCategoryService.GetSubCategoriesAsync(parentId);
                return Ok(new
                {
                    success = true,
                    data = categories,
                    message = "Alt kategoriler başarıyla getirildi."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Alt kategoriler getirilirken bir hata oluştu.",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Yeni kategori oluşturur
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] StockCategoryCreateDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = GetCurrentUserId();
                var category = await _stockCategoryService.CreateAsync(createDto, userId);

                return CreatedAtAction(nameof(GetById), new { id = category.Id }, new
                {
                    success = true,
                    data = category,
                    message = "Kategori başarıyla oluşturuldu."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Kategori oluşturulurken bir hata oluştu.",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Kategori günceller
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] StockCategoryUpdateDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = GetCurrentUserId();
                var category = await _stockCategoryService.UpdateAsync(id, updateDto, userId);

                return Ok(new
                {
                    success = true,
                    data = category,
                    message = "Kategori başarıyla güncellendi."
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Kategori güncellenirken bir hata oluştu.",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Kategori siler
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _stockCategoryService.DeleteAsync(id);
                if (!result)
                    return NotFound(new
                    {
                        success = false,
                        message = "Kategori bulunamadı."
                    });

                return Ok(new
                {
                    success = true,
                    message = "Kategori başarıyla silindi."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Kategori silinirken bir hata oluştu.",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Kategori kodunun benzersiz olup olmadığını kontrol eder
        /// </summary>
        [HttpGet("check-code/{code}")]
        public async Task<IActionResult> CheckCodeUnique(string code, [FromQuery] int? excludeId = null)
        {
            try
            {
                var isUnique = await _stockCategoryService.IsCategoryCodeUniqueAsync(code, excludeId);
                return Ok(new
                {
                    success = true,
                    data = new { isUnique },
                    message = isUnique ? "Kod kullanılabilir." : "Kod zaten kullanılmaktadır."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Kod kontrolü yapılırken bir hata oluştu.",
                    error = ex.Message
                });
            }
        }
    }
}