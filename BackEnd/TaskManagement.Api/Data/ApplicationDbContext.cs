using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<TaskItem>(entity =>
        {
            entity.Property(task => task.Title).HasMaxLength(160).IsRequired();
            entity.Property(task => task.Description).HasMaxLength(2000);
            entity.Property(task => task.Category).HasMaxLength(80).IsRequired();
            entity.Property(task => task.AssignedUserId).IsRequired();

            entity.HasOne(task => task.AssignedUser)
                .WithMany(user => user.AssignedTasks)
                .HasForeignKey(task => task.AssignedUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
