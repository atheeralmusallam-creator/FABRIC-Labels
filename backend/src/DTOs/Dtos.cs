using Fabric.Api.Models;

namespace Fabric.Api.DTOs;

// ─── Auth ─────────────────────────────────────────────────────────────────────

public record LoginRequest(string Email, string Password);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public record AuthResponse(string Token, string UserId, string Email, string? Name, Role Role, bool MustChangePassword);

// ─── User ─────────────────────────────────────────────────────────────────────

public record CreateUserRequest(string Email, string Name, string Password, Role Role);

public record UpdateUserRequest(string? Name, Role? Role, List<Role>? Roles);

public record UserDto(string Id, string Email, string? Name, Role Role, List<Role> Roles, bool MustChangePassword, DateTime CreatedAt);

// ─── Project ──────────────────────────────────────────────────────────────────

public record CreateProjectRequest(
    string Name,
    string? Description,
    string Type,
    string? Priority,
    string? OrganizationId,
    string Config = "{}"
);

public record UpdateProjectRequest(
    string? Name,
    string? Description,
    string? Priority,
    string? Config
);

public record AssignUsersRequest(List<string> UserIds);

public record ProjectDto(
    string Id,
    string Name,
    string? Description,
    string Type,
    string? Priority,
    string? OrganizationId,
    int TaskCount,
    DateTime CreatedAt
);

// ─── Task ─────────────────────────────────────────────────────────────────────

public record CreateTaskRequest
{
    public string ProjectId { get; set; } = string.Empty;
    public string Data { get; set; } = "{}";
    public int Order { get; set; } = 0;
}

public record UpdateTaskStatusRequest(TaskStatus Status);

public record AnnotateRequest(string Result, string? Notes, AnnotationStatus Status = AnnotationStatus.SUBMITTED);

// ─── Customer ─────────────────────────────────────────────────────────────────

public record RegisterCustomerRequest(string Email, string Name, string Company, string Password);

public record CreateCustomerProjectRequest(
    string Name,
    string? Description,
    string Type,
    string? GuidelineId,
    string? AIModelId
);

public record CustomerDto(string Id, string Email, string? Name, string? Company, bool IsActive, string ApiKey, DateTime CreatedAt);

public record CustomerProjectDto(
    string Id,
    string Name,
    string? Description,
    string Type,
    CustomerProjectStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
