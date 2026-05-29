using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using TaskManagement.Api.Contracts.Tasks;
using TaskManagement.Api.Data;
using TaskManagement.Api.Exceptions;
using TaskManagement.Api.Models;
using TaskManagement.Api.Services;

namespace TaskManagement.Tests.Services;

public class TaskServiceTests
{
    [Fact]
    public async Task CreateTaskAsync_AssignsToCurrentUser_WhenUserIsNotAdmin()
    {
        await using var dbContext = CreateDbContext();
        var user = new ApplicationUser { Id = "user-1", FullName = "Regular User", Email = "user@test.local", UserName = "user@test.local" };
        var otherUser = new ApplicationUser { Id = "user-2", FullName = "Other User", Email = "other@test.local", UserName = "other@test.local" };
        dbContext.Users.AddRange(user, otherUser);
        await dbContext.SaveChangesAsync();

        var service = new TaskService(dbContext, NullLogger<TaskService>.Instance);
        var request = new TaskCreateRequest("Plan sprint", "Create sprint backlog", TaskWorkflowStatus.Pending, TaskPriority.High, "Planning", null, otherUser.Id);

        var result = await service.CreateTaskAsync(request, user.Id, canAssign: false);

        Assert.Equal(user.Id, result.AssignedUserId);
        Assert.Equal("Plan sprint", result.Title);
    }

    [Fact]
    public async Task GetCountsAsync_ReturnsOnlyCurrentUsersCounts_WhenNotAdmin()
    {
        await using var dbContext = CreateDbContext();
        dbContext.Users.AddRange(
            new ApplicationUser { Id = "user-1", FullName = "One", Email = "one@test.local", UserName = "one@test.local" },
            new ApplicationUser { Id = "user-2", FullName = "Two", Email = "two@test.local", UserName = "two@test.local" });
        dbContext.Tasks.AddRange(
            new TaskItem { Title = "A", AssignedUserId = "user-1", Status = TaskWorkflowStatus.Pending },
            new TaskItem { Title = "B", AssignedUserId = "user-1", Status = TaskWorkflowStatus.Completed },
            new TaskItem { Title = "C", AssignedUserId = "user-2", Status = TaskWorkflowStatus.Completed });
        await dbContext.SaveChangesAsync();

        var service = new TaskService(dbContext, NullLogger<TaskService>.Instance);

        var counts = await service.GetCountsAsync("user-1", includeAll: false);

        Assert.Equal(1, counts.Pending);
        Assert.Equal(0, counts.InProgress);
        Assert.Equal(1, counts.Completed);
    }

    [Fact]
    public async Task GetTaskByIdAsync_ThrowsNotFound_WhenUserCannotAccessTask()
    {
        await using var dbContext = CreateDbContext();
        dbContext.Users.Add(new ApplicationUser { Id = "user-1", FullName = "One", Email = "one@test.local", UserName = "one@test.local" });
        var task = new TaskItem { Title = "Private task", AssignedUserId = "user-1" };
        dbContext.Tasks.Add(task);
        await dbContext.SaveChangesAsync();

        var service = new TaskService(dbContext, NullLogger<TaskService>.Instance);

        var exception = await Assert.ThrowsAsync<ApiException>(() => service.GetTaskByIdAsync(task.Id, "user-2", includeAll: false));
        Assert.Equal(StatusCodes.Status404NotFound, exception.StatusCode);
    }

    private static ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }
}
