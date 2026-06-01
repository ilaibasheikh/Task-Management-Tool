using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Api.Contracts.Auth;
using TaskManagement.Api.Extensions;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Authorize(Roles = IdentitySeeder.AdminRole)]
[Route("api/[controller]")]
public class UsersController(UserManager<ApplicationUser> userManager) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<UserOptionResponse>>> GetUsers()
    {
        var users = await userManager.Users
            .OrderBy(user => user.FullName)
            .Select(user => new UserOptionResponse(user.Id, user.FullName, user.Email ?? string.Empty))
            .ToListAsync();

        return Ok(users);
    }
}
