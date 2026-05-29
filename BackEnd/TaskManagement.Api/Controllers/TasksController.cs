using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Api.Contracts.Tasks;
using TaskManagement.Api.Exceptions;
using TaskManagement.Api.Extensions;
using TaskManagement.Api.Models;
using TaskManagement.Api.Services;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class TasksController(ITaskService taskService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<TaskResponse>>> GetTasks(
        [FromQuery] string? search,
        [FromQuery] TaskWorkflowStatus? status,
        [FromQuery] TaskPriority? priority,
        [FromQuery] string? category)
    {
        var tasks = await taskService.GetTasksAsync(CurrentUserId(), IsAdmin(), new TaskQuery(search, status, priority, category));
        return Ok(tasks);
    }

    [HttpGet("counts")]
    public async Task<ActionResult<TaskCountResponse>> GetCounts()
    {
        return Ok(await taskService.GetCountsAsync(CurrentUserId(), IsAdmin()));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskResponse>> GetTask(Guid id)
    {
        return Ok(await taskService.GetTaskByIdAsync(id, CurrentUserId(), IsAdmin()));
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponse>> CreateTask(TaskCreateRequest request)
    {
        var task = await taskService.CreateTaskAsync(request, CurrentUserId(), IsAdmin());
        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskResponse>> UpdateTask(Guid id, TaskUpdateRequest request)
    {
        return Ok(await taskService.UpdateTaskAsync(id, request, CurrentUserId(), IsAdmin()));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        await taskService.DeleteTaskAsync(id, CurrentUserId(), IsAdmin());
        return NoContent();
    }

    private string CurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new ApiException("Authenticated user id is missing.", StatusCodes.Status401Unauthorized);
    }

    private bool IsAdmin()
    {
        return User.IsInRole(IdentitySeeder.AdminRole);
    }
}
