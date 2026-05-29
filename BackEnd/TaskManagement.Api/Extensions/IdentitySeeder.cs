using Microsoft.AspNetCore.Identity;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Extensions;

public static class IdentitySeeder
{
    public const string AdminRole = "Admin";
    public const string UserRole = "User";

    public static async Task SeedIdentityAsync(this IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var logger = services.GetRequiredService<ILoggerFactory>().CreateLogger("IdentitySeeder");

        foreach (var role in new[] { AdminRole, UserRole })
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        const string adminEmail = "admin@tasktool.local";
        var admin = await userManager.FindByEmailAsync(adminEmail);
        if (admin is not null)
        {
            return;
        }

        admin = new ApplicationUser
        {
            FullName = "System Admin",
            Email = adminEmail,
            UserName = adminEmail
        };

        var result = await userManager.CreateAsync(admin, "Admin123!");
        if (!result.Succeeded)
        {
            logger.LogWarning("Admin seed user was not created: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
            return;
        }

        await userManager.AddToRoleAsync(admin, AdminRole);
    }
}
