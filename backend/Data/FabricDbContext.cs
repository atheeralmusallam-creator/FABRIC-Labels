using Fabric.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Fabric.API.Data;

public class FabricDbContext(DbContextOptions<FabricDbContext> options) : DbContext(options)
{
    // Core identity
    public DbSet<User> Users => Set<User>();
    public DbSet<Organization> Organizations => Set<Organization>();

    // Internal projects
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTask> Tasks => Set<ProjectTask>();
    public DbSet<ProjectAssignment> ProjectAssignments => Set<ProjectAssignment>();
    public DbSet<Annotation> Annotations => Set<Annotation>();

    // Customer portal
    public DbSet<CustomerProject> CustomerProjects => Set<CustomerProject>();
    public DbSet<UploadedFile> UploadedFiles => Set<UploadedFile>();

    // AI & Reviews
    public DbSet<AIModel> AIModels => Set<AIModel>();
    public DbSet<AIEvaluation> AIEvaluations => Set<AIEvaluation>();
    public DbSet<HumanReview> HumanReviews => Set<HumanReview>();
    public DbSet<ReviewResponse> ReviewResponses => Set<ReviewResponse>();

    // Results & Export
    public DbSet<FinalResult> FinalResults => Set<FinalResult>();
    public DbSet<ExportLog> ExportLogs => Set<ExportLog>();

    // Guidelines
    public DbSet<Guideline> Guidelines => Set<Guideline>();

    // CMS
    public DbSet<CmsPage> CmsPages => Set<CmsPage>();
    public DbSet<CmsSection> CmsSections => Set<CmsSection>();
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        base.OnModelCreating(mb);

        // User
        mb.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasConversion<string>();
            e.HasOne(u => u.Organization).WithMany(o => o.Users)
                .HasForeignKey(u => u.OrganizationId).OnDelete(DeleteBehavior.SetNull);
        });

        // Organization
        mb.Entity<Organization>(e => e.HasKey(o => o.Id));

        // Project
        mb.Entity<Project>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Status).HasConversion<string>();
            e.Property(p => p.Modality).HasConversion<string>();
            e.HasOne(p => p.Organization).WithMany(o => o.Projects)
                .HasForeignKey(p => p.OrganizationId).OnDelete(DeleteBehavior.SetNull);
        });

        // ProjectTask
        mb.Entity<ProjectTask>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.Status).HasConversion<string>();
            e.HasOne(t => t.Project).WithMany(p => p.Tasks)
                .HasForeignKey(t => t.ProjectId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(t => t.AssignedTo).WithMany()
                .HasForeignKey(t => t.AssignedToId).OnDelete(DeleteBehavior.SetNull);
        });

        // ProjectAssignment
        mb.Entity<ProjectAssignment>(e =>
        {
            e.HasKey(pa => pa.Id);
            e.HasOne(pa => pa.Project).WithMany(p => p.Assignments)
                .HasForeignKey(pa => pa.ProjectId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(pa => pa.User).WithMany(u => u.Assignments)
                .HasForeignKey(pa => pa.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // Annotation
        mb.Entity<Annotation>(e =>
        {
            e.HasKey(a => a.Id);
            e.HasOne(a => a.Task).WithMany(t => t.Annotations)
                .HasForeignKey(a => a.TaskId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(a => a.Annotator).WithMany(u => u.Annotations)
                .HasForeignKey(a => a.AnnotatorId).OnDelete(DeleteBehavior.Restrict);
        });

        // CustomerProject
        mb.Entity<CustomerProject>(e =>
        {
            e.HasKey(cp => cp.Id);
            e.Property(cp => cp.Status).HasConversion<string>();
            e.Property(cp => cp.Modality).HasConversion<string>();
            e.Property(cp => cp.ProcessingMode).HasConversion<string>();
            e.HasOne(cp => cp.Customer).WithMany()
                .HasForeignKey(cp => cp.CustomerId).OnDelete(DeleteBehavior.Restrict);
        });

        // UploadedFile
        mb.Entity<UploadedFile>(e =>
        {
            e.HasKey(f => f.Id);
            e.HasOne(f => f.CustomerProject).WithMany(cp => cp.Files)
                .HasForeignKey(f => f.CustomerProjectId).OnDelete(DeleteBehavior.Cascade);
        });

        // AIModel
        mb.Entity<AIModel>(e => e.HasKey(m => m.Id));

        // AIEvaluation
        mb.Entity<AIEvaluation>(e =>
        {
            e.HasKey(ev => ev.Id);
            e.Property(ev => ev.Status).HasConversion<string>();
            e.HasOne(ev => ev.CustomerProject).WithMany(cp => cp.AIEvaluations)
                .HasForeignKey(ev => ev.CustomerProjectId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ev => ev.AIModel).WithMany(m => m.Evaluations)
                .HasForeignKey(ev => ev.AIModelId).OnDelete(DeleteBehavior.Restrict);
        });

        // HumanReview
        mb.Entity<HumanReview>(e =>
        {
            e.HasKey(hr => hr.Id);
            e.Property(hr => hr.Status).HasConversion<string>();
            e.HasOne(hr => hr.CustomerProject).WithMany(cp => cp.HumanReviews)
                .HasForeignKey(hr => hr.CustomerProjectId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(hr => hr.AssignedTo).WithMany(u => u.Reviews)
                .HasForeignKey(hr => hr.AssignedToId).OnDelete(DeleteBehavior.SetNull);
        });

        // ReviewResponse
        mb.Entity<ReviewResponse>(e =>
        {
            e.HasKey(rr => rr.Id);
            e.HasOne(rr => rr.HumanReview).WithMany(hr => hr.Responses)
                .HasForeignKey(rr => rr.HumanReviewId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(rr => rr.Reviewer).WithMany()
                .HasForeignKey(rr => rr.ReviewerId).OnDelete(DeleteBehavior.Restrict);
        });

        // FinalResult
        mb.Entity<FinalResult>(e =>
        {
            e.HasKey(fr => fr.Id);
            e.HasOne(fr => fr.CustomerProject).WithMany(cp => cp.FinalResults)
                .HasForeignKey(fr => fr.CustomerProjectId).OnDelete(DeleteBehavior.Cascade);
        });

        // ExportLog
        mb.Entity<ExportLog>(e =>
        {
            e.HasKey(el => el.Id);
            e.Property(el => el.Format).HasConversion<string>();
            e.HasOne(el => el.CustomerProject).WithMany(cp => cp.ExportLogs)
                .HasForeignKey(el => el.CustomerProjectId).OnDelete(DeleteBehavior.Cascade);
        });

        // Guideline
        mb.Entity<Guideline>(e =>
        {
            e.HasKey(g => g.Id);
            e.HasOne(g => g.Project).WithMany(p => p.Guidelines)
                .HasForeignKey(g => g.ProjectId).OnDelete(DeleteBehavior.Cascade);
        });

        // CMS
        mb.Entity<CmsPage>(e => e.HasKey(p => p.Id));
        mb.Entity<CmsSection>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasOne(s => s.Page).WithMany(p => p.Sections)
                .HasForeignKey(s => s.PageId).OnDelete(DeleteBehavior.Cascade);
        });
        mb.Entity<BlogPost>(e => e.HasKey(b => b.Id));
    }
}
