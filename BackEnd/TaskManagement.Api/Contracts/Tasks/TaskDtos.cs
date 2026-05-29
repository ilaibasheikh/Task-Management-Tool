using TaskManagement.Api.Models;

namespace TaskManagement.Api.Contracts.Tasks;

public record TaskCreateRequest(
    string Title,
    string Description,
    TaskWorkflowStatus Status,
    TaskPriority Priority,
    string Category,
    DateTime? DueDate,
    string? AssignedUserId);

public record TaskUpdateRequest(
    string Title,
    string Description,
    TaskWorkflowStatus Status,
    TaskPriority Priority,
    string Category,
    DateTime? DueDate,
    string? AssignedUserId);

public record TaskResponse(
    Guid Id,
    string Title,
    string Description,
    TaskWorkflowStatus Status,
    TaskPriority Priority,
    string Category,
    DateTime? DueDate,
    string AssignedUserId,
    string? AssignedUserName,
    DateTime CreatedAt,
    DateTime? UpdatedAt);

public record TaskCountResponse(int Pending, int InProgress, int Completed);
public record TaskQuery(string? Search, TaskWorkflowStatus? Status, TaskPriority? Priority, string? Category);
