using System.Security.Claims;
using Fabric.API.Data;
using Fabric.API.DTOs;
using Fabric.API.Models.Entities;
using Fabric.API.Services.Auth;
using Fabric.API.Services.Export;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fabric.API.Controllers.Customer;

[ApiController]
[Route("api/customer")]
public class CustomerAuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("auth/register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await authService.RegisterAsync(dto with { Role = UserRole.Customer });
        if (result == null) return Conflict(new { error = "Email already registered" });
        return Ok(result);
    }

    [HttpPost("auth/login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await authService.LoginAsync(dto);
        if (result == null) return Unauthorized(new { error = "Invalid credentials" });

        // Verify customer role
        if (result.User.Role != UserRole.Customer.ToString())
            return Unauthorized(new { error = "Not a customer account" });

        return Ok(result);
    }
}

[ApiController]
[Route("api/customer/projects")]
[Authorize(Roles = "Customer")]
public class CustomerProjectsController(FabricDbContext db, IExportService exportService) : ControllerBase
{
    private string CurrentUserId => User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

    [HttpGet]
    public async Task<IActionResult> GetProjects()
    {
        var projects = await db.CustomerProjects
            .Where(p => p.CustomerId == CurrentUserId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id, p.Name, p.Status, p.Modality, p.ProcessingMode,
                p.CreatedAt, p.UpdatedAt,
                FilesCount = p.Files.Count,
                ResultsCount = p.FinalResults.Count
            })
            .ToListAsync();

        return Ok(projects);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProject(string id)
    {
        var project = await db.CustomerProjects
            .Include(p => p.Files)
            .Include(p => p.FinalResults)
            .Include(p => p.AIEvaluations)
            .Include(p => p.HumanReviews)
            .FirstOrDefaultAsync(p => p.Id == id && p.CustomerId == CurrentUserId);

        if (project == null) return NotFound();
        return Ok(project);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateCustomerProjectDto dto)
    {
        var project = new CustomerProject
        {
            CustomerId = CurrentUserId,
            Name = dto.Name,
            Description = dto.Description,
            Modality = dto.Modality,
            ProcessingMode = dto.ProcessingMode,
            ConfidenceThreshold = dto.ConfidenceThreshold
        };

        db.CustomerProjects.Add(project);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
    }

    [HttpPost("{id}/submit")]
    public async Task<IActionResult> SubmitProject(string id, [FromBody] SubmitProjectDto dto)
    {
        var project = await db.CustomerProjects
            .FirstOrDefaultAsync(p => p.Id == id && p.CustomerId == CurrentUserId);

        if (project == null) return NotFound();
        project.Status = ProjectStatus.Active;
        await db.SaveChangesAsync();

        // TODO: trigger AI evaluation pipeline
        return Ok(new { message = "Project submitted for processing", projectId = id });
    }

    [HttpGet("{id}/results")]
    public async Task<IActionResult> GetResults(string id)
    {
        var results = await db.FinalResults
            .Where(r => r.CustomerProjectId == id)
            .OrderByDescending(r => r.FinalizedAt)
            .ToListAsync();

        return Ok(results);
    }

    [HttpGet("{id}/export")]
    public async Task<IActionResult> ExportResults(string id, [FromQuery] string format = "csv")
    {
        var exportFormat = format.ToLower() switch
        {
            "json" => ExportFormat.JSON,
            "excel" or "xlsx" => ExportFormat.Excel,
            _ => ExportFormat.CSV
        };

        var result = await exportService.ExportProjectResultsAsync(id, exportFormat, CurrentUserId);
        return File(result.Data, result.ContentType, result.FileName);
    }
}

[ApiController]
[Route("api/customer/files")]
[Authorize(Roles = "Customer")]
public class CustomerFilesController(FabricDbContext db) : ControllerBase
{
    private string CurrentUserId => User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

    [HttpPost]
    [RequestSizeLimit(100_000_000)] // 100MB
    public async Task<IActionResult> UploadFile(IFormFile file, [FromQuery] string projectId)
    {
        // Verify project ownership
        var project = await db.CustomerProjects
            .FirstOrDefaultAsync(p => p.Id == projectId && p.CustomerId == CurrentUserId);
        if (project == null) return NotFound("Project not found");

        // In production: upload to S3/Azure Blob/Railway volume
        var storagePath = $"uploads/{projectId}/{Guid.NewGuid()}_{file.FileName}";

        var uploadedFile = new UploadedFile
        {
            CustomerProjectId = projectId,
            FileName = file.FileName,
            StoragePath = storagePath,
            FileSizeBytes = file.Length,
            MimeType = file.ContentType
        };

        db.UploadedFiles.Add(uploadedFile);
        await db.SaveChangesAsync();

        return Ok(new { fileId = uploadedFile.Id, storagePath });
    }
}
