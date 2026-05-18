using Microsoft.EntityFrameworkCore;
using Fabric.Api.Models;

namespace Fabric.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // PostgreSQL: enums stored as strings via HasConversion (defined in OnModelCreating)

    // ─── Internal Platform ───────────────────────────────────────────────────
    public DbSet<User> Users => Set<User>();
    public DbSet<Organization> Organizations => Set<Organization>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectAssignment> ProjectAssignments => Set<ProjectAssignment>();
    public DbSet<Models.Task> Tasks => Set<Models.Task>();
    public DbSet<TaskAssignment> TaskAssignments => Set<TaskAssignment>();
    public DbSet<Annotation> Annotations => Set<Annotation>();

    // ─── Customer Platform ───────────────────────────────────────────────────
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerProject> CustomerProjects => Set<CustomerProject>();
    public DbSet<UploadedFile> UploadedFiles => Set<UploadedFile>();
    public DbSet<Guideline> Guidelines => Set<Guideline>();
    public DbSet<AIModel> AIModels => Set<AIModel>();
    public DbSet<AIEvaluation> AIEvaluations => Set<AIEvaluation>();
    public DbSet<HumanReview> HumanReviews => Set<HumanReview>();
    public DbSet<ReviewResponse> ReviewResponses => Set<ReviewResponse>();
    public DbSet<FinalResult> FinalResults => Set<FinalResult>();
    public DbSet<ExportLog> ExportLogs => Set<ExportLog>();

    // ─── CMS ─────────────────────────────────────────────────────────────────
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Roles)
             .HasConversion(
                v => string.Join(',', v.Select(r => r.ToString())),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                      .Select(Enum.Parse<Role>).ToList());
        });

        // Organization
        modelBuilder.Entity<Organization>(e => e.ToTable("organizations"));

        // Project
        modelBuilder.Entity<Project>(e =>
        {
            e.ToTable("projects");
            e.HasOne(x => x.Organization)
             .WithMany(x => x.Projects)
             .HasForeignKey(x => x.OrganizationId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ProjectAssignment
        modelBuilder.Entity<ProjectAssignment>(e =>
        {
            e.ToTable("project_assignments");
            e.HasIndex(x => new { x.ProjectId, x.UserId }).IsUnique();
        });

        // Task
        modelBuilder.Entity<Models.Task>(e =>
        {
            e.ToTable("tasks");
            e.HasOne(x => x.Project)
             .WithMany(x => x.Tasks)
             .HasForeignKey(x => x.ProjectId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // TaskAssignment
        modelBuilder.Entity<TaskAssignment>(e =>
        {
            e.ToTable("task_assignments");
            e.HasIndex(x => new { x.TaskId, x.UserId }).IsUnique();
        });

        // Annotation
        modelBuilder.Entity<Annotation>(e =>
        {
            e.ToTable("annotations");
            e.HasIndex(x => new { x.TaskId, x.UserId }).IsUnique();
        });

        // Customer
        modelBuilder.Entity<Customer>(e =>
        {
            e.ToTable("customers");
            e.HasIndex(x => x.Email).IsUnique();
            e.HasIndex(x => x.ApiKey).IsUnique();
        });

        // CustomerProject
        modelBuilder.Entity<CustomerProject>(e =>
        {
            e.ToTable("customer_projects");
            e.HasOne(x => x.Customer)
             .WithMany(x => x.Projects)
             .HasForeignKey(x => x.CustomerId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // UploadedFile
        modelBuilder.Entity<UploadedFile>(e => e.ToTable("uploaded_files"));

        // Guideline
        modelBuilder.Entity<Guideline>(e => e.ToTable("guidelines"));

        // AIModel
        modelBuilder.Entity<AIModel>(e => e.ToTable("ai_models"));

        // AIEvaluation
        modelBuilder.Entity<AIEvaluation>(e => e.ToTable("ai_evaluations"));

        // HumanReview
        modelBuilder.Entity<HumanReview>(e => e.ToTable("human_reviews"));

        // ReviewResponse
        modelBuilder.Entity<ReviewResponse>(e =>
        {
            e.ToTable("review_responses");
            e.HasIndex(x => new { x.ReviewId, x.ReviewerId }).IsUnique();
        });

        // FinalResult
        modelBuilder.Entity<FinalResult>(e => e.ToTable("final_results"));

        // ExportLog
        modelBuilder.Entity<ExportLog>(e => e.ToTable("export_logs"));

        // BlogPost
        modelBuilder.Entity<BlogPost>(e =>
        {
            e.ToTable("blog_posts");
            e.HasIndex(x => x.Slug).IsUnique();
        });

        // SystemSetting
        modelBuilder.Entity<SystemSetting>(e =>
        {
            e.ToTable("system_settings");
            e.HasKey(x => x.Key);
        });
    }
}
