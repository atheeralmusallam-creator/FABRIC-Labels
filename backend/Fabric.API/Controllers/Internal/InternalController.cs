using System.Security.Claims;
using Fabric.API.Data;
using Fabric.API.DTOs;
using Fabric.API.Models.Entities;
using Fabric.API.Services.Review;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fabric.API.Controllers.Internal;

[ApiController]
[Route("api/internal")]
[Authorize(Roles = "Admin,Manager,Reviewer,Annotator")]
public class InternalReviewController(IReviewService reviewService, FabricDbContext db) : ControllerBase
{
    private string CurrentUserId => User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

    [HttpGet("human-reviews")]
    public async Task<IActionResult> GetQueue([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var queue = await reviewService.GetReviewQueueAsync(page, pageSize);
        return Ok(queue);
    }

    [HttpGet("human-reviews/next")]
    public async Task<IActionResult> GetNext()
    {
        var review = await reviewService.GetNextReviewAsync(CurrentUserId);
        if (review == null) return Ok(new { message = "Queue is empty" });
        return Ok(review);
    }

    [HttpPost("human-reviews/{id}/assign")]
    public async Task<IActionResult> Assign(string id)
    {
        var review = await reviewService.AssignReviewAsync(id, CurrentUserId);
        if (review == null) return NotFound();
        return Ok(review);
    }

    [HttpPost("human-reviews/{id}/complete")]
    public async Task<IActionResult> Complete(string id, [FromBody] CompleteReviewDto dto)
    {
        var response = await reviewService.CompleteReviewAsync(
            id, CurrentUserId, dto.Decision, dto.FinalLabel, dto.Notes);
        return Ok(response);
    }

    [HttpGet("annotators")]
    [Authorize(Roles = "Admin,Manager,Reviewer")]
    public async Task<IActionResult> GetAnnotators()
    {
        var annotators = await db.Users
            .Where(u => u.Role == UserRole.Annotator && u.IsActive)
            .Select(u => new { u.Id, u.Name, u.Email })
            .ToListAsync();
        return Ok(annotators);
    }

    [HttpPost("translate")]
    public async Task<IActionResult> Translate([FromBody] TranslateDto dto)
    {
        // Placeholder: integrate with translation service
        await Task.CompletedTask;
        return Ok(new { translatedText = $"[Translated to {dto.TargetLanguage}]: {dto.Text}" });
    }
}

[ApiController]
[Route("api")]
[Authorize]
public class ProjectsController(FabricDbContext db, IDuplicateDetectionService duplicateService) : ControllerBase
{
    private string CurrentUserId => User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

    [HttpGet("projects")]
    public async Task<IActionResult> GetProjects()
    {
        var projects = await db.Projects
            .Include(p => p.Organization)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new { p.Id, p.Name, p.Status, p.Modality, p.CreatedAt, TaskCount = p.Tasks.Count })
            .ToListAsync();
        return Ok(projects);
    }

    [HttpGet("projects/{id}")]
    public async Task<IActionResult> GetProject(string id)
    {
        var project = await db.Projects
            .Include(p => p.Tasks)
            .Include(p => p.Assignments).ThenInclude(a => a.User)
            .Include(p => p.Guidelines)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null) return NotFound();
        return Ok(project);
    }

    [HttpPost("projects")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto dto)
    {
        var project = new Project
        {
            Name = dto.Name,
            Description = dto.Description,
            Modality = dto.Modality,
            OrganizationId = dto.OrganizationId
        };

        db.Projects.Add(project);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
    }

    [HttpDelete("projects/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProject(string id)
    {
        var project = await db.Projects.FindAsync(id);
        if (project == null) return NotFound();
        db.Projects.Remove(project);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("projects/{id}/duplicate-check")]
    public async Task<IActionResult> CheckDuplicates(string id, [FromQuery] double threshold = 0.85)
    {
        var duplicates = await duplicateService.FindDuplicatesAsync(id, threshold);
        return Ok(new { count = duplicates.Count, duplicates });
    }

    [HttpGet("tasks/{id}")]
    public async Task<IActionResult> GetTask(string id)
    {
        var task = await db.Tasks
            .Include(t => t.Annotations).ThenInclude(a => a.Annotator)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (task == null) return NotFound();
        return Ok(task);
    }

    [HttpPost("tasks/{id}/annotate")]
    [Authorize(Roles = "Annotator,Reviewer")]
    public async Task<IActionResult> AnnotateTask(string id, [FromBody] AnnotateTaskDto dto)
    {
        var task = await db.Tasks.FindAsync(id);
        if (task == null) return NotFound();

        var annotation = new Annotation
        {
            TaskId = id,
            AnnotatorId = CurrentUserId,
            Label = dto.Label,
            Notes = dto.Notes
        };

        db.Annotations.Add(annotation);
        await db.SaveChangesAsync();
        return Ok(annotation);
    }
}

public record TranslateDto(string Text, string TargetLanguage);
