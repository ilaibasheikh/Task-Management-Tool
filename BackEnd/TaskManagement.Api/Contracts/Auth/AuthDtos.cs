namespace TaskManagement.Api.Contracts.Auth;

public record RegisterRequest(string FullName, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, DateTime ExpiresAt, UserProfileResponse User);
public record UserProfileResponse(string Id, string FullName, string Email, IReadOnlyCollection<string> Roles);
