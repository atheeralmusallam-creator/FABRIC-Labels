using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Fabric.Api.Data;
using Fabric.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── Database ────────────────────────────────────────────────────────────────
// Railway provides DATABASE_URL as postgres:// URI — convert to Npgsql format
var rawUrl = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "";

string connStr;
if (rawUrl.StartsWith("postgres://") || rawUrl.StartsWith("postgresql://"))
{
    var uri = new Uri(rawUrl);
    var userInfo = uri.UserInfo.Split(':');
    var db = uri.AbsolutePath.TrimStart('/');
    var host = uri.Host;
    var port = uri.Port;
    var user = userInfo[0];
    var pass = Uri.UnescapeDataString(userInfo[1]);
    connStr = $"Host={host};Port={port};Database={db};Username={user};Password={pass};SSL Mode=Require;Trust Server Certificate=true";
}
else
{
    connStr = rawUrl;
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connStr));

// ─── JWT Auth ────────────────────────────────────────────────────────────────
var jwtSecret = builder.Configuration["JWT_SECRET"] ?? "change-this-secret-min-32-chars!!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// ─── Services ────────────────────────────────────────────────────────────────
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ProjectService>();
builder.Services.AddScoped<TaskService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<CustomerService>();

// ─── CORS ─────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var origins = (builder.Configuration["ALLOWED_ORIGINS"] ?? "http://localhost:4200")
            .Split(',', StringSplitOptions.RemoveEmptyEntries);
        policy.WithOrigins(origins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "FABRIC API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new()
    {
        {
            new() {
                Reference = new() {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ─── Create tables + Seed ─────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // EnsureCreated: creates all tables from models if they don't exist
    // Safe to call multiple times — skips if tables already exist
    var created = await db.Database.EnsureCreatedAsync();

    if (created)
    {
        // Only seed on fresh database
        await DbSeeder.SeedAsync(db);
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Always expose swagger in production too (optional, remove if unwanted)
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "FABRIC API v1"));

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
