using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Fabric.Api.Data;
using Fabric.Api.DTOs;
using Fabric.Api.Models;

namespace Fabric.Api.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<AuthResponse?> LoginAsync(string email, string password)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(password, user.Password))
            return null;

        var token = GenerateToken(new[]
        {
            new Claim("sub", user.Id),
            new Claim("email", user.Email),
            new Claim("role", user.Role.ToString())
        });

        return new AuthResponse(token, user.Id, user.Email, user.Name, user.Role, user.MustChangePassword);
    }

    public async Task<AuthResponse?> CustomerLoginAsync(string email, string password)
    {
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.Email == email);
        if (customer is null || !BCrypt.Net.BCrypt.Verify(password, customer.Password))
            return null;

        var token = GenerateToken(new[]
        {
            new Claim("sub", customer.Id),
            new Claim("customerId", customer.Id),
            new Claim("email", customer.Email),
            new Claim("role", "CUSTOMER")
        });

        return new AuthResponse(token, customer.Id, customer.Email, customer.Name, Role.CUSTOMER, false);
    }

    public async Task<UserDto?> GetCurrentUserAsync(string userId)
    {
        var user = await _db.Users.FindAsync(userId);
        return user is null ? null : MapUser(user);
    }

    public async Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null || !BCrypt.Net.BCrypt.Verify(currentPassword, user.Password))
            return false;

        user.Password = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.MustChangePassword = false;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    private string GenerateToken(IEnumerable<Claim> claims)
    {
        var secret = _config["JWT_SECRET"] ?? "change-this-secret-min-32-chars!!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddDays(7);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapUser(User u) =>
        new(u.Id, u.Email, u.Name, u.Role, u.Roles, u.MustChangePassword, u.CreatedAt);
}
