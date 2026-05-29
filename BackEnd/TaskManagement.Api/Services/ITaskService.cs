using TaskManagement.Api.Contracts.Tasks;

namespace TaskManagement.Api.Services;

public interface ITaskService
{
    Task<IReadOnlyCollection<TaskResponse>> GetTasksAsync(string userId, bool includeAll, TaskQuery query);
    Task<TaskResponse> GetTaskByIdAsync(Guid id, string userId, bool includeAll);
    Task<TaskResponse> CreateTaskAsync(TaskCreateRequest request, string currentUserId, bool canAssign);
    Task<TaskResponse> UpdateTaskAsync(Guid id, TaskUpdateRequest request, string currentUserId, bool includeAll);
    Task DeleteTaskAsync(Guid id, string currentUserId, bool includeAll);
    Task<TaskCountResponse> GetCountsAsync(string userId, bool includeAll);
}
