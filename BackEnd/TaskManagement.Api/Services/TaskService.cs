using Microsoft.EntityFrameworkCore;
using TaskManagement.Api.Contracts.Tasks;
using TaskManagement.Api.Data;
using TaskManagement.Api.Exceptions;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Services;

public class TaskService(ApplicationDbContext dbContext, ILogger<TaskService> logger) : ITaskService
{
    public async Task<IReadOnlyCollection<TaskResponse>> GetTasksAsync(string userId, bool includeAll, TaskQuery query)
    {
        var tasks = VisibleTasks(userId, includeAll);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();
            tasks = tasks.Where(task => task.Title.Contains(search) || task.Description.Contains(search));
        }

        if (query.Status.HasValue)
        {
            tasks = tasks.Where(task => task.Status == query.Status.Value);
        }

        if (query.Priority.HasValue)
        {
            tasks = tasks.Where(task => task.Priority == query.Priority.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Category))
        {
            tasks = tasks.Where(task => task.Category == query.Category);
        }

        return await tasks
            .OrderBy(task => task.DueDate ?? DateTime.MaxValue)
            .ThenByDescending(task => task.CreatedAt)
            .Select(task => ToResponse(task))
            .ToListAsync();
    }

    public async Task<TaskResponse> GetTaskByIdAsync(Guid id, string userId, bool includeAll)
    {
        var task = await VisibleTasks(userId, includeAll).FirstOrDefaultAsync(item => item.Id == id);
        return task is null ? throw new ApiException("Task was not found.", StatusCodes.Status404NotFound) : ToResponse(task);
    }

    public async Task<TaskResponse> CreateTaskAsync(TaskCreateRequest request, string currentUserId, bool canAssign)
    {
        var assignedUserId = canAssign && !string.IsNullOrWhiteSpace(request.AssignedUserId)
            ? request.AssignedUserId
            : currentUserId;

        await EnsureUserExistsAsync(assignedUserId);

        var task = new TaskItem
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Status = request.Status,
            Priority = request.Priority,
            Category = string.IsNullOrWhiteSpace(request.Category) ? "General" : request.Category.Trim(),
            DueDate = request.DueDate,
            AssignedUserId = assignedUserId
        };

        dbContext.Tasks.Add(task);
        await dbContext.SaveChangesAsync();
        logger.LogInformation("Task {TaskId} created by user {UserId}", task.Id, currentUserId);

        await dbContext.Entry(task).Reference(item => item.AssignedUser).LoadAsync();
        return ToResponse(task);
    }

    public async Task<TaskResponse> UpdateTaskAsync(Guid id, TaskUpdateRequest request, string currentUserId, bool includeAll)
    {
        var task = await VisibleTasks(currentUserId, includeAll).FirstOrDefaultAsync(item => item.Id == id)
            ?? throw new ApiException("Task was not found.", StatusCodes.Status404NotFound);

        var assignedUserId = includeAll && !string.IsNullOrWhiteSpace(request.AssignedUserId)
            ? request.AssignedUserId
            : task.AssignedUserId;

        await EnsureUserExistsAsync(assignedUserId);

        task.Title = request.Title.Trim();
        task.Description = request.Description.Trim();
        task.Status = request.Status;
        task.Priority = request.Priority;
        task.Category = string.IsNullOrWhiteSpace(request.Category) ? "General" : request.Category.Trim();
        task.DueDate = request.DueDate;
        task.AssignedUserId = assignedUserId;
        task.UpdatedAt = DateTime.UtcNow;

        await dbContext.SaveChangesAsync();
        logger.LogInformation("Task {TaskId} updated by user {UserId}", task.Id, currentUserId);
        return ToResponse(task);
    }

    public async Task DeleteTaskAsync(Guid id, string currentUserId, bool includeAll)
    {
        var task = await VisibleTasks(currentUserId, includeAll).FirstOrDefaultAsync(item => item.Id == id)
            ?? throw new ApiException("Task was not found.", StatusCodes.Status404NotFound);

        dbContext.Tasks.Remove(task);
        await dbContext.SaveChangesAsync();
        logger.LogInformation("Task {TaskId} deleted by user {UserId}", task.Id, currentUserId);
    }

    public async Task<TaskCountResponse> GetCountsAsync(string userId, bool includeAll)
    {
        var tasks = VisibleTasks(userId, includeAll);
        return new TaskCountResponse(
            await tasks.CountAsync(task => task.Status == TaskWorkflowStatus.Pending),
            await tasks.CountAsync(task => task.Status == TaskWorkflowStatus.InProgress),
            await tasks.CountAsync(task => task.Status == TaskWorkflowStatus.Completed));
    }

    private IQueryable<TaskItem> VisibleTasks(string userId, bool includeAll)
    {
        var tasks = dbContext.Tasks.Include(task => task.AssignedUser).AsQueryable();
        return includeAll ? tasks : tasks.Where(task => task.AssignedUserId == userId);
    }

    private async Task EnsureUserExistsAsync(string userId)
    {
        var exists = await dbContext.Users.AnyAsync(user => user.Id == userId);
        if (!exists)
        {
            throw new ApiException("Assigned user does not exist.", StatusCodes.Status400BadRequest);
        }
    }

    private static TaskResponse ToResponse(TaskItem task)
    {
        return new TaskResponse(
            task.Id,
            task.Title,
            task.Description,
            task.Status,
            task.Priority,
            task.Category,
            task.DueDate,
            task.AssignedUserId,
            task.AssignedUser?.FullName,
            task.CreatedAt,
            task.UpdatedAt);
    }
}
