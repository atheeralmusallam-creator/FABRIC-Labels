namespace Fabric.API.DTOs;

// ── Auth ──────────────────────────────────────────────────────────────────────

public record RegisterDto(string Email, string Password, string Name,
    Fabric.API.Models.Entities.UserRole Role = Fabric.API.Models.Entities.UserRole.Customer);

public record LoginDto(string Email, string Password);

public record AuthResponseDto
{
    public string Token { get; init; } = string.Empty;
    public UserDto User { get; init; } = new();
}

public record UserDto
{
    public string Id { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
}

// ── Customer Project ──────────────────────────────────────────────────────────

public record CreateCustomerProjectDto(
    string Name,
    string? Description,
    Fabric.API.Models.Entities.DataModality Modality,
    Fabric.API.Models.Entities.ProcessingMode ProcessingMode,
    double ConfidenceThreshold = 0.75
);

public record SubmitProjectDto(string GuidelineText);

// ── Internal Project ──────────────────────────────────────────────────────────

public record CreateProjectDto(
    string Name,
    string? Description,
    Fabric.API.Models.Entities.DataModality Modality,
    string? OrganizationId
);

public record CreateTaskDto(string ProjectId, string Content, string? Metadata);

public record AnnotateTaskDto(string Label, string? Notes);

// ── Review ────────────────────────────────────────────────────────────────────

public record CompleteReviewDto(string Decision, string? FinalLabel, string? Notes);

// ── Admin ─────────────────────────────────────────────────────────────────────

public record CreateAIModelDto(string Name, string Provider, string ModelIdentifier);

public record UpdateThresholdDto(double Threshold);

// ── Stats ─────────────────────────────────────────────────────────────────────

public record AdminStatsDto
{
    public int TotalProjects { get; init; }
    public int TotalCustomers { get; init; }
    public int PendingReviews { get; init; }
    public int CompletedToday { get; init; }
    public int TotalAnnotators { get; init; }
}

// ── CMS ───────────────────────────────────────────────────────────────────────

public record UpsertCmsPageDto(string Slug, string Title, string? Content, bool IsPublished);

public record CreateBlogPostDto(
    string Title, string Slug, string? Content, string? AuthorId, bool IsPublished);
