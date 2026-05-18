namespace Fabric.API.Models.Entities;

// ── Enums ─────────────────────────────────────────────────────────────────────

public enum UserRole { Admin, Manager, Reviewer, Annotator, Customer }
public enum ProjectStatus { Draft, Active, Completed, Archived }
public enum DataModality { Text, Audio, Image, Video }
public enum ReviewStatus { Pending, InProgress, Completed, Escalated }
public enum EvaluationStatus { Pending, AIProcessed, HumanReview, Completed, Failed }
public enum ExportFormat { CSV, JSON, Excel }
public enum ProcessingMode { AIAndHuman, HumanOnly }

// ── Core Identity ─────────────────────────────────────────────────────────────

public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? OrganizationId { get; set; }
    public Organization? Organization { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProjectAssignment> Assignments { get; set; } = [];
    public ICollection<HumanReview> Reviews { get; set; } = [];
    public ICollection<Annotation> Annotations { get; set; } = [];
}

public class Organization
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<User> Users { get; set; } = [];
    public ICollection<Project> Projects { get; set; } = [];
}

// ── Internal Projects ─────────────────────────────────────────────────────────

public class Project
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? OrganizationId { get; set; }
    public Organization? Organization { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.Draft;
    public DataModality Modality { get; set; }
    public double ConfidenceThreshold { get; set; } = 0.75;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ProjectTask> Tasks { get; set; } = [];
    public ICollection<ProjectAssignment> Assignments { get; set; } = [];
    public ICollection<Guideline> Guidelines { get; set; } = [];
}

public class ProjectTask
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ProjectId { get; set; } = string.Empty;
    public Project? Project { get; set; }
    public string? AssignedToId { get; set; }
    public User? AssignedTo { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? Metadata { get; set; } // JSON blob
    public ReviewStatus Status { get; set; } = ReviewStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Annotation> Annotations { get; set; } = [];
}

public class ProjectAssignment
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ProjectId { get; set; } = string.Empty;
    public Project? Project { get; set; }
    public string UserId { get; set; } = string.Empty;
    public User? User { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
}

public class Annotation
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TaskId { get; set; } = string.Empty;
    public ProjectTask? Task { get; set; }
    public string AnnotatorId { get; set; } = string.Empty;
    public User? Annotator { get; set; }
    public string Label { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public bool IsApproved { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ── Customer Portal ───────────────────────────────────────────────────────────

public class CustomerProject
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string CustomerId { get; set; } = string.Empty;
    public User? Customer { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DataModality Modality { get; set; }
    public ProcessingMode ProcessingMode { get; set; } = ProcessingMode.AIAndHuman;
    public ProjectStatus Status { get; set; } = ProjectStatus.Draft;
    public double ConfidenceThreshold { get; set; } = 0.75;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UploadedFile> Files { get; set; } = [];
    public ICollection<AIEvaluation> AIEvaluations { get; set; } = [];
    public ICollection<HumanReview> HumanReviews { get; set; } = [];
    public ICollection<FinalResult> FinalResults { get; set; } = [];
    public ICollection<ExportLog> ExportLogs { get; set; } = [];
}

public class UploadedFile
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string CustomerProjectId { get; set; } = string.Empty;
    public CustomerProject? CustomerProject { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}

// ── AI Evaluation ─────────────────────────────────────────────────────────────

public class AIModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty; // openai | anthropic | custom
    public string ModelIdentifier { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AIEvaluation> Evaluations { get; set; } = [];
}

public class AIEvaluation
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string CustomerProjectId { get; set; } = string.Empty;
    public CustomerProject? CustomerProject { get; set; }
    public string AIModelId { get; set; } = string.Empty;
    public AIModel? AIModel { get; set; }
    public string ItemContent { get; set; } = string.Empty;
    public string? Result { get; set; }
    public double ConfidenceScore { get; set; }
    public EvaluationStatus Status { get; set; } = EvaluationStatus.Pending;
    public bool RequiresHumanReview { get; set; }
    public string? RawResponse { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ── Human Review ──────────────────────────────────────────────────────────────

public class HumanReview
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string CustomerProjectId { get; set; } = string.Empty;
    public CustomerProject? CustomerProject { get; set; }
    public string? AssignedToId { get; set; }
    public User? AssignedTo { get; set; }
    public string ItemContent { get; set; } = string.Empty;
    public string? AIResult { get; set; }
    public double? AIConfidence { get; set; }
    public ReviewStatus Status { get; set; } = ReviewStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    public ICollection<ReviewResponse> Responses { get; set; } = [];
}

public class ReviewResponse
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string HumanReviewId { get; set; } = string.Empty;
    public HumanReview? HumanReview { get; set; }
    public string ReviewerId { get; set; } = string.Empty;
    public User? Reviewer { get; set; }
    public string Decision { get; set; } = string.Empty; // Approve | Reject | Edit
    public string? FinalLabel { get; set; }
    public string? Notes { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}

// ── Results & Export ──────────────────────────────────────────────────────────

public class FinalResult
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string CustomerProjectId { get; set; } = string.Empty;
    public CustomerProject? CustomerProject { get; set; }
    public string ItemContent { get; set; } = string.Empty;
    public string FinalLabel { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty; // AI | Human
    public double? ConfidenceScore { get; set; }
    public string? ReviewerId { get; set; }
    public DateTime FinalizedAt { get; set; } = DateTime.UtcNow;
}

public class ExportLog
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string CustomerProjectId { get; set; } = string.Empty;
    public CustomerProject? CustomerProject { get; set; }
    public ExportFormat Format { get; set; }
    public string? FilePath { get; set; }
    public string ExportedById { get; set; } = string.Empty;
    public DateTime ExportedAt { get; set; } = DateTime.UtcNow;
}

// ── Guidelines ────────────────────────────────────────────────────────────────

public class Guideline
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string ProjectId { get; set; } = string.Empty;
    public Project? Project { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;
    public string? ParsedContent { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}

// ── CMS ───────────────────────────────────────────────────────────────────────

public class CmsPage
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public bool IsPublished { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CmsSection> Sections { get; set; } = [];
}

public class CmsSection
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string PageId { get; set; } = string.Empty;
    public CmsPage? Page { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int Order { get; set; }
}

public class BlogPost
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Content { get; set; }
    public string? AuthorId { get; set; }
    public bool IsPublished { get; set; }
    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
