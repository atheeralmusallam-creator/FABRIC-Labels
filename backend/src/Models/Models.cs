using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Fabric.Api.Models;

// ─── Enums ────────────────────────────────────────────────────────────────────

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Role { ADMIN, MANAGER, ANNOTATOR, REVIEWER, CUSTOMER }

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TaskStatus { PENDING, SUBMITTED, SKIPPED }

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AnnotationStatus { DRAFT, SUBMITTED }

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CustomerProjectStatus
{
    DRAFT, PENDING_ADMIN, PROCESSING, AI_REVIEW, HUMAN_REVIEW, COMPLETED, REJECTED
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AIEvaluationStatus { PENDING, PROCESSING, COMPLETED, FAILED }

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum HumanReviewDecision { APPROVED, EDITED, REJECTED }

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum FileType { CSV, JSON, EXCEL, TEXT, IMAGE, AUDIO, VIDEO, OTHER }

// ─── Internal Platform ────────────────────────────────────────────────────────

public class Organization
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required] public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}

public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required][EmailAddress] public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    [Required] public string Password { get; set; } = string.Empty;
    public Role Role { get; set; } = Role.ANNOTATOR;
    public List<Role> Roles { get; set; } = new() { Role.ANNOTATOR };
    public bool MustChangePassword { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Annotation> Annotations { get; set; } = new List<Annotation>();
    public ICollection<ProjectAssignment> Assignments { get; set; } = new List<ProjectAssignment>();
    public ICollection<TaskAssignment> TaskAssignments { get; set; } = new List<TaskAssignment>();
    public ICollection<HumanReview> HumanReviews { get; set; } = new List<HumanReview>();
    public ICollection<ReviewResponse> ReviewResponses { get; set; } = new List<ReviewResponse>();
}

public class ProjectAssignment
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required] public string ProjectId { get; set; } = string.Empty;
    [Required] public string UserId { get; set; } = string.Empty;
    public Project Project { get; set; } = null!;
    public User User { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Project
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? OrganizationId { get; set; }
    public Organization? Organization { get; set; }
    [Required] public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Priority { get; set; }
    [Required] public string Type { get; set; } = string.Empty;
    public string Config { get; set; } = "{}"; // JSON stored as string
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string? CustomerProjectId { get; set; }
    public CustomerProject? CustomerProject { get; set; }

    public ICollection<Task> Tasks { get; set; } = new List<Task>();
    public ICollection<ProjectAssignment> Assignments { get; set; } = new List<ProjectAssignment>();
}

public class Task
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required] public string ProjectId { get; set; } = string.Empty;
    public Project Project { get; set; } = null!;
    public string Data { get; set; } = "{}"; // JSON
    public TaskStatus Status { get; set; } = TaskStatus.PENDING;
    public int Order { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string? AutoSolvedFrom { get; set; }
    public string? AutoSolvedLabel { get; set; }
    public string? AutoSolvedNote { get; set; }

    public ICollection<Annotation> Annotations { get; set; } = new List<Annotation>();
    public ICollection<TaskAssignment> Assignments { get; set; } = new List<TaskAssignment>();
    public ICollection<AIEvaluation> AIEvaluations { get; set; } = new List<AIEvaluation>();
    public ICollection<HumanReview> HumanReviews { get; set; } = new List<HumanReview>();
}

public class TaskAssignment
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required] public string TaskId { get; set; } = string.Empty;
    [Required] public string UserId { get; set; } = string.Empty;
    public Task Task { get; set; } = null!;
    public User User { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Annotation
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required] public string TaskId { get; set; } = string.Empty;
    public Task Task { get; set; } = null!;
    public string? UserId { get; set; }
    public User? User { get; set; }
    public string Result { get; set; } = "{}"; // JSON
    public string? Notes { get; set; }
    public AnnotationStatus Status { get; set; } = AnnotationStatus.SUBMITTED;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// ─── Customer Platform ────────────────────────────────────────────────────────

public class Customer
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required][EmailAddress] public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? Company { get; set; }
    [Required] public string Password { get; set; } = string.Empty;
    public string ApiKey { get; set; } = Guid.NewGuid().ToString();
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CustomerProject> Projects { get; set; } = new List<CustomerProject>();
    public ICollection<ExportLog> ExportLogs { get; set; } = new List<ExportLog>();
}

public class CustomerProject
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required] public string CustomerId { get; set; } = string.Empty;
    public Customer Customer { get; set; } = null!;
    [Required] public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    [Required] public string Type { get; set; } = string.Empty;
    public CustomerProjectStatus Status { get; set; } = CustomerProjectStatus.DRAFT;
    public string? GuidelineId { get; set; }
    public Guideline? Guideline { get; set; }
    public string? AIModelId { get; set; }
    public AIModel? AIModel { get; set; }
    public string Config { get; set; } = "{}";
    public float ConfidenceThreshold { get; set; } = 0.8f;
    public bool AutoApprove { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Project? InternalProject { get; set; }
    public ICollection<UploadedFile> UploadedFiles { get; set; } = new List<UploadedFile>();
    public ICollection<AIEvaluation> AIEvaluations { get; set; } = new List<AIEvaluation>();
    public ICollection<HumanReview> HumanReviews { get; set; } = new List<HumanReview>();
    public ICollection<FinalResult> FinalResults { get; set; } = new List<FinalResult>();
    public ICollection<ExportLog> ExportLogs { get; set; } = new List<ExportLog>();
}

public class UploadedFile
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required] public string CustomerProjectId { get; set; } = string.Empty;
    public CustomerProject CustomerProject { get; set; } = null!;
    [Required] public string FileName { get; set; } = string.Empty;
    public FileType FileType { get; set; }
    public long FileSize { get; set; }
    [Required] public string FileUrl { get; set; } = string.Empty;
    public string? FileContent { get; set; }
    public string? MimeType { get; set; }
    public int? RowCount { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Guideline
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required] public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Content { get; set; } = "{}"; // JSON
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CustomerProject> CustomerProjects { get; set; } = new List<CustomerProject>();
}

public class AIModel
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required] public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    [Required] public string Provider { get; set; } = string.Empty;
    [Required] public string ModelId { get; set; } = string.Empty;
    public string? Endpoint { get; set; }
    public string? ApiKeyEnv { get; set; }
    public string? Config { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CustomerProject> CustomerProjects { get; set; } = new List<CustomerProject>();
    public ICollection<AIEvaluation> AIEvaluations { get; set; } = new List<AIEvaluation>();
}

public class AIEvaluation
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required] public string CustomerProjectId { get; set; } = string.Empty;
    public CustomerProject CustomerProject { get; set; } = null!;
    public string? TaskId { get; set; }
    public Task? Task { get; set; }
    [Required] public string AIModelId { get; set; } = string.Empty;
    public AIModel AIModel { get; set; } = null!;
    public string InputData { get; set; } = "{}";
    public string? Result { get; set; }
    public float? Confidence { get; set; }
    public AIEvaluationStatus Status { get; set; } = AIEvaluationStatus.PENDING;
    public string? ErrorMessage { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public HumanReview? HumanReview { get; set; }
}

public class HumanReview
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required] public string CustomerProjectId { get; set; } = string.Empty;
    public CustomerProject CustomerProject { get; set; } = null!;
    public string? TaskId { get; set; }
    public Task? Task { get; set; }
    public string? AIEvaluationId { get; set; }
    public AIEvaluation? AIEvaluation { get; set; }
    public string? ReviewerId { get; set; }
    public User? Reviewer { get; set; }
    public HumanReviewDecision? Decision { get; set; }
    public string? EditedResult { get; set; }
    public string? Notes { get; set; }
    public bool IsCompleted { get; set; } = false;
    public DateTime? CompletedAt { get; set; }
    public int AnnotatorCount { get; set; } = 3;
    public bool Escalated { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ReviewResponse> Responses { get; set; } = new List<ReviewResponse>();
}

public class ReviewResponse
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required] public string ReviewId { get; set; } = string.Empty;
    public HumanReview Review { get; set; } = null!;
    [Required] public string ReviewerId { get; set; } = string.Empty;
    public User Reviewer { get; set; } = null!;
    public HumanReviewDecision Decision { get; set; }
    public string? EditedResult { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class FinalResult
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required] public string CustomerProjectId { get; set; } = string.Empty;
    public CustomerProject CustomerProject { get; set; } = null!;
    public string? TaskId { get; set; }
    public int? ItemIndex { get; set; }
    public string InputData { get; set; } = "{}";
    public string FinalResultData { get; set; } = "{}";
    [Required] public string Source { get; set; } = string.Empty;
    public float? Confidence { get; set; }
    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ExportLog
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required] public string CustomerProjectId { get; set; } = string.Empty;
    public CustomerProject CustomerProject { get; set; } = null!;
    [Required] public string CustomerId { get; set; } = string.Empty;
    public Customer Customer { get; set; } = null!;
    [Required] public string Format { get; set; } = string.Empty;
    public string? FileUrl { get; set; }
    public int? RowCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ─── CMS ──────────────────────────────────────────────────────────────────────

public class BlogPost
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    [Required] public string Slug { get; set; } = string.Empty;
    [Required] public string Title { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = "Insights";
    public string? CoverImage { get; set; }
    public bool Published { get; set; } = false;
    public DateTime? PublishedAt { get; set; }
    public string AuthorName { get; set; } = "FABRIC Team";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class SystemSetting
{
    [Required] public string Key { get; set; } = string.Empty;
    [Required] public string Value { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
