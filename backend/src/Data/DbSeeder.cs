using Fabric.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Fabric.Api.Data;

public static class DbSeeder
{
    public static async System.Threading.Tasks.Task SeedAsync(AppDbContext db)
    {
        try
        {
            // Seed admin user if no users exist
            var hasUsers = await db.Users.AnyAsync();
            if (!hasUsers)
            {
                db.Users.Add(new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Email = "admin@fabric.ai",
                    Name = "Admin",
                    Password = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = Role.ADMIN,
                    Roles = new List<Role> { Role.ADMIN },
                    MustChangePassword = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
                await db.SaveChangesAsync();
            }

            // Seed default AI models if none exist
            var hasModels = await db.AIModels.AnyAsync();
            if (!hasModels)
            {
                db.AIModels.AddRange(
                    new AIModel
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "GPT-4o",
                        Provider = "openai",
                        ModelId = "gpt-4o",
                        ApiKeyEnv = "OPENAI_API_KEY",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    },
                    new AIModel
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = "Claude Sonnet",
                        Provider = "anthropic",
                        ModelId = "claude-sonnet-4-20250514",
                        ApiKeyEnv = "ANTHROPIC_API_KEY",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    }
                );
                await db.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DbSeeder] Warning: {ex.Message}");
        }
    }
}
