using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Fabric.Api.DTOs;
using Fabric.Api.Services;

namespace Fabric.Api.Controllers;

// ─── Users ────────────────────────────────────────────────────────────────────

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserService _svc;
    public UsersController(UserService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _svc.ListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var u = await _svc.GetAsync(id);
        return u is null ? NotFound() : Ok(u);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest req)
    {
        var u = await _svc.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = u.Id }, u);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateUserRequest req)
    {
        var u = await _svc.UpdateAsync(id, req);
        return u is null ? NotFound() : Ok(u);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _svc.DeleteAsync(id);
        return NoContent();
    }
}

// ─── Projects ─────────────────────────────────────────────────────────────────

[ApiController]
[Route("api/projects")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly ProjectService _svc;
    public ProjectsController(ProjectService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _svc.ListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var p = await _svc.GetAsync(id);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectRequest req)
    {
        var p = await _svc.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = p.Id }, p);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateProjectRequest req)
    {
        var p = await _svc.UpdateAsync(id, req);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _svc.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/assign")]
    public async Task<IActionResult> Assign(string id, [FromBody] AssignUsersRequest req)
    {
        await _svc.AssignUsersAsync(id, req.UserIds);
        return Ok(new { message = "Users assigned" });
    }
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

[ApiController]
[Route("api/projects/{projectId}/tasks")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly TaskService _svc;
    public TasksController(TaskService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> List(string projectId) =>
        Ok(await _svc.ListByProjectAsync(projectId));

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string projectId, string id)
    {
        var t = await _svc.GetAsync(id);
        return t is null ? NotFound() : Ok(t);
    }

    [HttpPost]
    public async Task<IActionResult> Create(string projectId, [FromBody] CreateTaskRequest req)
    {
        req.ProjectId = projectId;
        var t = await _svc.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { projectId, id = t.Id }, t);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateTaskStatusRequest req)
    {
        var t = await _svc.UpdateStatusAsync(id, req.Status);
        return t is null ? NotFound() : Ok(t);
    }

    [HttpPost("{id}/annotate")]
    public async Task<IActionResult> Annotate(string id, [FromBody] AnnotateRequest req)
    {
        var userId = User.FindFirst("sub")?.Value ?? "";
        var a = await _svc.AnnotateAsync(id, userId, req);
        return Ok(a);
    }
}
