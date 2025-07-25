using IvosisProjectManagement.API.DTOs;

public interface IProjectAddressService
{
    Task<List<ProjectAddressDto>> GetByProjectIdAsync(int projectId);
}
