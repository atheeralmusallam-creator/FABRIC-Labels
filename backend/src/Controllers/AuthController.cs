using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Fabric.Api.DTOs;
using Fabric.Api.Services;

namespace Fabric.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;
    public AuthController(AuthService auth) => _auth = auth;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var result = await _auth.LoginAsync(req.Email, req.Password);
        if (result is null)
            return Unauthorized(new { message = "Invalid credentials" });
        return Ok(result);
    }

    [HttpPost("customer/login")]
    public async Task<IActionResult> CustomerLogin([FromBody] LoginRequest req)
    {
        var result = await _auth.CustomerLoginAsync(req.Email, req.Password);
        if (result is null)
            return Unauthorized(new { message = "Invalid credentials" });
        return Ok(result);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (userId is null) return Unauthorized();
        var user = await _auth.GetCurrentUserAsync(userId);
        return user is null ? NotFound() : Ok(user);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (userId is null) return Unauthorized();
        var ok = await _auth.ChangePasswordAsync(userId, req.CurrentPassword, req.NewPassword);
        return ok ? Ok(new { message = "Password changed" }) : BadRequest(new { message = "Current password incorrect" });
    }
}
