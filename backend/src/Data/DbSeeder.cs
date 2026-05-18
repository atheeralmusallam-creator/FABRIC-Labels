using Fabric.Api.Models;

namespace Fabric.Api.Data;

public static class DbSeeder
{
    public static async System.Threading.Tasks.Task SeedAsync(AppDbContext db)
    {
        // Seed admin user if no users exist
        if (!db.Users.Any())
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
        if (!db.AIModels.Any())
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
                    Name = "Claude 3.5 Sonnet",
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
}
