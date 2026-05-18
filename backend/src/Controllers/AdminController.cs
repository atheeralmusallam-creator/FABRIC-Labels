using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Fabric.Api.DTOs;
using Fabric.Api.Services;

namespace Fabric.Api.Controllers;

// ─── Customer Projects ────────────────────────────────────────────────────────

[ApiController]
[Route("api/customer/projects")]
[Authorize]
public class CustomerProjectsController : ControllerBase
{
    private readonly CustomerService _svc;
    public CustomerProjectsController(CustomerService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var customerId = User.FindFirst("customerId")?.Value;
        return Ok(await _svc.ListProjectsAsync(customerId));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var p = await _svc.GetProjectAsync(id);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCustomerProjectRequest req)
    {
        var customerId = User.FindFirst("customerId")?.Value ?? "";
        var p = await _svc.CreateProjectAsync(customerId, req);
        return CreatedAtAction(nameof(Get), new { id = p.Id }, p);
    }

    [HttpPost("{id}/upload")]
    public async Task<IActionResult> Upload(string id, IFormFile file)
    {
        var result = await _svc.UploadFileAsync(id, file);
        return Ok(result);
    }

    [HttpGet("{id}/results")]
    public async Task<IActionResult> Results(string id) =>
        Ok(await _svc.GetResultsAsync(id));

    [HttpPost("{id}/export")]
    public async Task<IActionResult> Export(string id, [FromQuery] string format = "json")
    {
        var customerId = User.FindFirst("customerId")?.Value ?? "";
        var result = await _svc.ExportAsync(id, customerId, format);
        return Ok(result);
    }
}

// ─── Admin: Customers ─────────────────────────────────────────────────────────

[ApiController]
[Route("api/admin/customers")]
[Authorize]
public class AdminCustomersController : ControllerBase
{
    private readonly CustomerService _svc;
    public AdminCustomersController(CustomerService svc) => _svc = svc;

    [HttpGet]
    public async Task<IActionResult> List() => Ok(await _svc.ListCustomersAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var c = await _svc.GetCustomerAsync(id);
        return c is null ? NotFound() : Ok(c);
    }

    [HttpPost("{id}/activate")]
    public async Task<IActionResult> Activate(string id)
    {
        await _svc.SetActiveAsync(id, true);
        return Ok();
    }

    [HttpPost("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(string id)
    {
        await _svc.SetActiveAsync(id, false);
        return Ok();
    }
}

// ─── Admin: Overview ──────────────────────────────────────────────────────────

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly ProjectService _projectSvc;
    private readonly UserService _userSvc;
    private readonly CustomerService _customerSvc;

    public AdminController(ProjectService ps, UserService us, CustomerService cs)
    {
        _projectSvc = ps;
        _userSvc = us;
        _customerSvc = cs;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> Overview()
    {
        var users = await _userSvc.CountAsync();
        var projects = await _projectSvc.CountAsync();
        var customers = await _customerSvc.CountAsync();
        return Ok(new { users, projects, customers });
    }
}
