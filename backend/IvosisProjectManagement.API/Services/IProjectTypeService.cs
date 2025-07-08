using IvosisProjectManagement.API.Models;

public interface IProjectTypeService
{
    Task<IEnumerable<ProjectType>> GetAllAsync();
}