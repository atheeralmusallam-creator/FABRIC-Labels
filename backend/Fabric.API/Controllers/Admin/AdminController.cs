using Fabric.API.Data;
using Fabric.API.DTOs;
using Fabric.API.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fabric.API.Controllers.Admin;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(FabricDbContext db) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var today = DateTime.UtcNow.Date;

        var stats = new AdminStatsDto
        {
            TotalProjects = await db.CustomerProjects.CountAsync(),
            TotalCustomers = await db.Users.CountAsync(u => u.Role == UserRole.Customer),
            PendingReviews = await db.HumanReviews.CountAsync(r =>
                r.Status == ReviewStatus.Pending || r.Status == ReviewStatus.InProgress),
            CompletedToday = await db.FinalResults.CountAsync(r => r.FinalizedAt.Date == today),
            TotalAnnotators = await db.Users.CountAsync(u => u.Role == UserRole.Annotator && u.IsActive)
        };

        return Ok(stats);
    }

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers()
    {
        var customers = await db.Users
            .Where(u => u.Role == UserRole.Customer)
            .Select(u => new
            {
                u.Id, u.Name, u.Email, u.IsActive, u.CreatedAt,
                ProjectCount = db.CustomerProjects.Count(p => p.CustomerId == u.Id)
            })
            .ToListAsync();
        return Ok(customers);
    }

    // ── AI Models ─────────────────────────────────────────────────────────────

    [HttpGet("ai-models")]
    public async Task<IActionResult> GetAIModels() =>
        Ok(await db.AIModels.OrderBy(m => m.Name).ToListAsync());

    [HttpPost("ai-models")]
    public async Task<IActionResult> CreateAIModel([FromBody] CreateAIModelDto dto)
    {
        var model = new AIModel
        {
            Name = dto.Name,
            Provider = dto.Provider,
            ModelIdentifier = dto.ModelIdentifier
        };
        db.AIModels.Add(model);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAIModels), new { id = model.Id }, model);
    }

    [HttpPut("ai-models/{id}")]
    public async Task<IActionResult> UpdateAIModel(string id, [FromBody] CreateAIModelDto dto)
    {
        var model = await db.AIModels.FindAsync(id);
        if (model == null) return NotFound();
        model.Name = dto.Name;
        model.Provider = dto.Provider;
        model.ModelIdentifier = dto.ModelIdentifier;
        await db.SaveChangesAsync();
        return Ok(model);
    }

    [HttpDelete("ai-models/{id}")]
    public async Task<IActionResult> DeleteAIModel(string id)
    {
        var model = await db.AIModels.FindAsync(id);
        if (model == null) return NotFound();
        db.AIModels.Remove(model);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ── Guidelines ────────────────────────────────────────────────────────────

    [HttpGet("guidelines")]
    public async Task<IActionResult> GetGuidelines() =>
        Ok(await db.Guidelines.Include(g => g.Project).ToListAsync());

    // ── Threshold ─────────────────────────────────────────────────────────────

    [HttpPost("settings/threshold")]
    public async Task<IActionResult> SetThreshold([FromBody] UpdateThresholdDto dto,
        [FromQuery] string? projectId = null)
    {
        if (projectId != null)
        {
            var project = await db.CustomerProjects.FindAsync(projectId);
            if (project == null) return NotFound();
            project.ConfidenceThreshold = dto.Threshold;
        }
        // else: set global default (would persist to app settings / config table)

        await db.SaveChangesAsync();
        return Ok(new { threshold = dto.Threshold, scope = projectId ?? "global" });
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await db.Users
            .Include(u => u.Organization)
            .Select(u => new { u.Id, u.Name, u.Email, u.Role, u.IsActive, u.CreatedAt, OrgName = u.Organization!.Name })
            .ToListAsync();
        return Ok(users);
    }

    [HttpPatch("users/{id}/toggle")]
    public async Task<IActionResult> ToggleUser(string id)
    {
        var user = await db.Users.FindAsync(id);
        if (user == null) return NotFound();
        user.IsActive = !user.IsActive;
        await db.SaveChangesAsync();
        return Ok(new { user.Id, user.IsActive });
    }

    // ── CMS ───────────────────────────────────────────────────────────────────

    [HttpGet("cms/pages")]
    public async Task<IActionResult> GetPages() =>
        Ok(await db.CmsPages.Include(p => p.Sections).ToListAsync());

    [HttpPost("cms/pages")]
    public async Task<IActionResult> UpsertPage([FromBody] UpsertCmsPageDto dto)
    {
        var page = await db.CmsPages.FirstOrDefaultAsync(p => p.Slug == dto.Slug);
        if (page == null)
        {
            page = new CmsPage { Slug = dto.Slug, Title = dto.Title, Content = dto.Content, IsPublished = dto.IsPublished };
            db.CmsPages.Add(page);
        }
        else
        {
            page.Title = dto.Title;
            page.Content = dto.Content;
            page.IsPublished = dto.IsPublished;
            page.UpdatedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync();
        return Ok(page);
    }

    [HttpGet("cms/blog")]
    public async Task<IActionResult> GetBlogPosts() =>
        Ok(await db.BlogPosts.OrderByDescending(b => b.PublishedAt).ToListAsync());

    [HttpPost("cms/blog")]
    public async Task<IActionResult> CreateBlogPost([FromBody] CreateBlogPostDto dto)
    {
        var post = new BlogPost
        {
            Title = dto.Title,
            Slug = dto.Slug,
            Content = dto.Content,
            AuthorId = dto.AuthorId,
            IsPublished = dto.IsPublished
        };
        db.BlogPosts.Add(post);
        await db.SaveChangesAsync();
        return Ok(post);
    }
}
