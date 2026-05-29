using TaskManagement.Api.Models;

namespace TaskManagement.Api.Services;

public interface IJwtTokenService
{
    Task<(string Token, DateTime ExpiresAt)> CreateTokenAsync(ApplicationUser user);
}
