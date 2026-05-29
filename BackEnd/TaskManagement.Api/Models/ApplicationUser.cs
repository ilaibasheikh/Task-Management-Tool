using Microsoft.AspNetCore.Identity;

namespace TaskManagement.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public ICollection<TaskItem> AssignedTasks { get; set; } = [];
}
