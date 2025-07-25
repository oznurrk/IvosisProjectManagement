﻿using IvosisProjectManagement.API.Attributes;
using IvosisProjectManagement.API.DTOs;
using IvosisProjectManagement.API.Enums;
using IvosisProjectManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IvosisProjectManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProcessesController : BaseController
    {
        private readonly IProcessService _service;

        public ProcessesController(IProcessService service)
        {
            _service = service;
        }

        [Authorize]
        [HttpGet]
        [LogActivity(ActivityType.View, "Processes")]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        [Authorize]
        [HttpGet("{id}")]
        [LogActivity(ActivityType.View, "Processes/id")]
        public async Task<IActionResult> Get(int id)
        {
            var process = await _service.GetByIdAsync(id);
            if (process == null) return NotFound();
            return Ok(process);
        }

        [Authorize]
        [HttpPost]
        [LogActivity(ActivityType.Create, "Processes")]
        public async Task<IActionResult> Create(ProcessCreateDto dto)
        {
            dto.CreatedByUserId = GetCurrentUserId();
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }


        [Authorize]
        [HttpPut("{id}")]
        [LogActivity(ActivityType.Update, "Processes")]
        public async Task<IActionResult> Update(int id, ProcessUpdateDto dto)
        {
            dto.UpdatedByUserId = GetCurrentUserId();

            var updated = await _service.UpdateAsync(id, dto);
            if (!updated) return NotFound();
            var updatedProcess = await _service.GetByIdAsync(id);
            return Ok(updatedProcess);
        }

        [Authorize]
        [HttpDelete("{id}")]
        [LogActivity(ActivityType.Delete, "Processes")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
                return NotFound(new { message = "Kayıt bulunamadı." });

            return Ok(new { message = "Kayıt başarıyla silindi." });
        }

    }
}
