using Microsoft.EntityFrameworkCore;
using Fabric.Api.Data;
using Fabric.Api.DTOs;
using Fabric.Api.Models;

// Aliases to resolve ambiguity between Fabric.Api.Models.Task and System.Threading.Tasks.Task
using FabricTask = Fabric.Api.Models.Task;
using FabricTaskStatus = Fabric.Api.Models.TaskStatus;

namespace Fabric.Api.Services;

// ─── UserService ──────────────────────────────────────────────────────────────

public class UserService
{
    private readonly AppDbContext _db;
    public UserService(AppDbContext db) => _db = db;

    public async System.Threading.Tasks.Task<List<UserDto>> ListAsync() =>
        await _db.Users
            .Select(u => new UserDto(u.Id, u.Email, u.Name, u.Role, u.Roles, u.MustChangePassword, u.CreatedAt))
            .ToListAsync();

    public async System.Threading.Tasks.Task<UserDto?> GetAsync(string id)
    {
        var u = await _db.Users.FindAsync(id);
        return u is null ? null : new UserDto(u.Id, u.Email, u.Name, u.Role, u.Roles, u.MustChangePassword, u.CreatedAt);
    }

    public async System.Threading.Tasks.Task<UserDto> CreateAsync(CreateUserRequest req)
    {
        var user = new User
        {
            Email = req.Email,
            Name = req.Name,
            Password = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Role = req.Role,
            Roles = new List<Role> { req.Role },
            MustChangePassword = true
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return new UserDto(user.Id, user.Email, user.Name, user.Role, user.Roles, user.MustChangePassword, user.CreatedAt);
    }

    public async System.Threading.Tasks.Task<UserDto?> UpdateAsync(string id, UpdateUserRequest req)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is null) return null;
        if (req.Name is not null) user.Name = req.Name;
        if (req.Role is not null) user.Role = req.Role.Value;
        if (req.Roles is not null) user.Roles = req.Roles;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return new UserDto(user.Id, user.Email, user.Name, user.Role, user.Roles, user.MustChangePassword, user.CreatedAt);
    }

    public async System.Threading.Tasks.Task DeleteAsync(string id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user is not null) { _db.Users.Remove(user); await _db.SaveChangesAsync(); }
    }

    public async System.Threading.Tasks.Task<int> CountAsync() => await _db.Users.CountAsync();
}

// ─── ProjectService ───────────────────────────────────────────────────────────

public class ProjectService
{
    private readonly AppDbContext _db;
    public ProjectService(AppDbContext db) => _db = db;

    public async System.Threading.Tasks.Task<List<ProjectDto>> ListAsync() =>
        await _db.Projects.Include(p => p.Tasks)
                          .Select(p => Map(p))
                          .ToListAsync();

    public async System.Threading.Tasks.Task<ProjectDto?> GetAsync(string id)
    {
        var p = await _db.Projects.Include(x => x.Tasks).FirstOrDefaultAsync(x => x.Id == id);
        return p is null ? null : Map(p);
    }

    public async System.Threading.Tasks.Task<ProjectDto> CreateAsync(CreateProjectRequest req)
    {
        var p = new Project
        {
            Name = req.Name,
            Description = req.Description,
            Type = req.Type,
            Priority = req.Priority,
            OrganizationId = req.OrganizationId,
            Config = req.Config
        };
        _db.Projects.Add(p);
        await _db.SaveChangesAsync();
        return Map(p);
    }

    public async System.Threading.Tasks.Task<ProjectDto?> UpdateAsync(string id, UpdateProjectRequest req)
    {
        var p = await _db.Projects.Include(x => x.Tasks).FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return null;
        if (req.Name is not null) p.Name = req.Name;
        if (req.Description is not null) p.Description = req.Description;
        if (req.Priority is not null) p.Priority = req.Priority;
        if (req.Config is not null) p.Config = req.Config;
        p.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Map(p);
    }

    public async System.Threading.Tasks.Task DeleteAsync(string id)
    {
        var p = await _db.Projects.FindAsync(id);
        if (p is not null) { _db.Projects.Remove(p); await _db.SaveChangesAsync(); }
    }

    public async System.Threading.Tasks.Task AssignUsersAsync(string projectId, List<string> userIds)
    {
        var existing = await _db.ProjectAssignments.Where(a => a.ProjectId == projectId).ToListAsync();
        _db.ProjectAssignments.RemoveRange(existing);
        foreach (var uid in userIds)
            _db.ProjectAssignments.Add(new ProjectAssignment { ProjectId = projectId, UserId = uid });
        await _db.SaveChangesAsync();
    }

    public async System.Threading.Tasks.Task<int> CountAsync() => await _db.Projects.CountAsync();

    private static ProjectDto Map(Project p) =>
        new(p.Id, p.Name, p.Description, p.Type, p.Priority, p.OrganizationId, p.Tasks.Count, p.CreatedAt);
}

// ─── TaskService ──────────────────────────────────────────────────────────────

public class TaskService
{
    private readonly AppDbContext _db;
    public TaskService(AppDbContext db) => _db = db;

    public async System.Threading.Tasks.Task<List<FabricTask>> ListByProjectAsync(string projectId) =>
        await _db.Tasks.Where(t => t.ProjectId == projectId).OrderBy(t => t.Order).ToListAsync();

    public async System.Threading.Tasks.Task<FabricTask?> GetAsync(string id) =>
        await _db.Tasks.Include(t => t.Annotations).FirstOrDefaultAsync(t => t.Id == id);

    public async System.Threading.Tasks.Task<FabricTask> CreateAsync(CreateTaskRequest req)
    {
        var task = new FabricTask
        {
            ProjectId = req.ProjectId,
            Data = req.Data,
            Order = req.Order
        };
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();
        return task;
    }

    public async System.Threading.Tasks.Task<FabricTask?> UpdateStatusAsync(string id, FabricTaskStatus status)
    {
        var t = await _db.Tasks.FindAsync(id);
        if (t is null) return null;
        t.Status = status;
        t.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return t;
    }

    public async System.Threading.Tasks.Task<Annotation> AnnotateAsync(string taskId, string userId, AnnotateRequest req)
    {
        var existing = await _db.Annotations.FirstOrDefaultAsync(a => a.TaskId == taskId && a.UserId == userId);
        if (existing is not null)
        {
            existing.Result = req.Result;
            existing.Notes = req.Notes;
            existing.Status = req.Status;
            existing.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return existing;
        }

        var annotation = new Annotation
        {
            TaskId = taskId,
            UserId = userId,
            Result = req.Result,
            Notes = req.Notes,
            Status = req.Status
        };
        _db.Annotations.Add(annotation);
        await _db.SaveChangesAsync();
        return annotation;
    }
}

// ─── CustomerService ──────────────────────────────────────────────────────────

public class CustomerService
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;

    public CustomerService(AppDbContext db, IWebHostEnvironment env, IConfiguration config)
    {
        _db = db;
        _env = env;
        _config = config;
    }

    public async System.Threading.Tasks.Task<List<CustomerDto>> ListCustomersAsync() =>
        await _db.Customers
            .Select(c => new CustomerDto(c.Id, c.Email, c.Name, c.Company, c.IsActive, c.ApiKey, c.CreatedAt))
            .ToListAsync();

    public async System.Threading.Tasks.Task<CustomerDto?> GetCustomerAsync(string id)
    {
        var c = await _db.Customers.FindAsync(id);
        return c is null ? null : new CustomerDto(c.Id, c.Email, c.Name, c.Company, c.IsActive, c.ApiKey, c.CreatedAt);
    }

    public async System.Threading.Tasks.Task SetActiveAsync(string id, bool active)
    {
        var c = await _db.Customers.FindAsync(id);
        if (c is not null) { c.IsActive = active; c.UpdatedAt = DateTime.UtcNow; await _db.SaveChangesAsync(); }
    }

    public async System.Threading.Tasks.Task<int> CountAsync() => await _db.Customers.CountAsync();

    public async System.Threading.Tasks.Task<List<CustomerProjectDto>> ListProjectsAsync(string? customerId) =>
        await _db.CustomerProjects
            .Where(p => customerId == null || p.CustomerId == customerId)
            .Select(p => new CustomerProjectDto(p.Id, p.Name, p.Description, p.Type, p.Status, p.CreatedAt, p.UpdatedAt))
            .ToListAsync();

    public async System.Threading.Tasks.Task<CustomerProjectDto?> GetProjectAsync(string id)
    {
        var p = await _db.CustomerProjects.FindAsync(id);
        return p is null ? null : new CustomerProjectDto(p.Id, p.Name, p.Description, p.Type, p.Status, p.CreatedAt, p.UpdatedAt);
    }

    public async System.Threading.Tasks.Task<CustomerProjectDto> CreateProjectAsync(string customerId, CreateCustomerProjectRequest req)
    {
        var p = new CustomerProject
        {
            CustomerId = customerId,
            Name = req.Name,
            Description = req.Description,
            Type = req.Type,
            GuidelineId = req.GuidelineId,
            AIModelId = req.AIModelId
        };
        _db.CustomerProjects.Add(p);
        await _db.SaveChangesAsync();
        return new CustomerProjectDto(p.Id, p.Name, p.Description, p.Type, p.Status, p.CreatedAt, p.UpdatedAt);
    }

    public async System.Threading.Tasks.Task<object> UploadFileAsync(string projectId, IFormFile file)
    {
        var uploadDir = _config["UPLOAD_DIR"] ?? "./public/uploads";
        Directory.CreateDirectory(uploadDir);
        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = System.IO.Path.Combine(uploadDir, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await file.CopyToAsync(stream);

        var fileType = System.IO.Path.GetExtension(file.FileName).ToLower() switch
        {
            ".csv"              => FileType.CSV,
            ".json"             => FileType.JSON,
            ".xlsx" or ".xls"   => FileType.EXCEL,
            ".txt"              => FileType.TEXT,
            ".jpg" or ".jpeg" or ".png" => FileType.IMAGE,
            ".mp3" or ".wav"    => FileType.AUDIO,
            ".mp4"              => FileType.VIDEO,
            _                   => FileType.OTHER
        };

        var uploaded = new UploadedFile
        {
            CustomerProjectId = projectId,
            FileName = file.FileName,
            FileType = fileType,
            FileSize = file.Length,
            FileUrl = $"/uploads/{fileName}",
            MimeType = file.ContentType
        };

        _db.UploadedFiles.Add(uploaded);
        await _db.SaveChangesAsync();
        return uploaded;
    }

    public async System.Threading.Tasks.Task<List<FinalResult>> GetResultsAsync(string projectId) =>
        await _db.FinalResults.Where(r => r.CustomerProjectId == projectId).ToListAsync();

    public async System.Threading.Tasks.Task<object> ExportAsync(string projectId, string customerId, string format)
    {
        var results = await _db.FinalResults.Where(r => r.CustomerProjectId == projectId).ToListAsync();
        var log = new ExportLog
        {
            CustomerProjectId = projectId,
            CustomerId = customerId,
            Format = format,
            RowCount = results.Count
        };
        _db.ExportLogs.Add(log);
        await _db.SaveChangesAsync();
        return new { format, count = results.Count, results };
    }
}
