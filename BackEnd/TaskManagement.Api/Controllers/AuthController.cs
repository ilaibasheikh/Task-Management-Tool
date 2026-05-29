using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TaskManagement.Api.Contracts.Auth;
using TaskManagement.Api.Exceptions;
using TaskManagement.Api.Extensions;
using TaskManagement.Api.Models;
using TaskManagement.Api.Services;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IJwtTokenService jwtTokenService,
    ILogger<AuthController> logger) : ControllerBase
{
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var user = new ApplicationUser
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            UserName = request.Email.Trim()
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            throw new ApiException(string.Join(" ", result.Errors.Select(error => error.Description)));
        }

        await userManager.AddToRoleAsync(user, IdentitySeeder.UserRole);
        logger.LogInformation("User {UserId} registered", user.Id);

        return Ok(await BuildAuthResponseAsync(user));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email.Trim())
            ?? throw new ApiException("Invalid email or password.", StatusCodes.Status401Unauthorized);

        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        if (!result.Succeeded)
        {
            throw new ApiException("Invalid email or password.", StatusCodes.Status401Unauthorized);
        }

        logger.LogInformation("User {UserId} logged in", user.Id);
        return Ok(await BuildAuthResponseAsync(user));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserProfileResponse>> Me()
    {
        var user = await userManager.GetUserAsync(User)
            ?? throw new ApiException("User was not found.", StatusCodes.Status404NotFound);

        return Ok(await BuildProfileAsync(user));
    }

    private async Task<AuthResponse> BuildAuthResponseAsync(ApplicationUser user)
    {
        var token = await jwtTokenService.CreateTokenAsync(user);
        return new AuthResponse(token.Token, token.ExpiresAt, await BuildProfileAsync(user));
    }

    private async Task<UserProfileResponse> BuildProfileAsync(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);
        return new UserProfileResponse(user.Id, user.FullName, user.Email ?? string.Empty, roles.ToArray());
    }
}
