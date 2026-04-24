using System;
using System.Linq;
using Ant.Application;
using Ant.Core.Enums;
using Ant.Application.Interfaces;
using Ant.Infrastructure;
using Ant.Infrastructure.Contexts;
using Ant.WebApi.Caching;
using Ant.WebApi.Extensions;
using Ant.WebApi.Services;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddApplicationLayer();
builder.Services.AddPersistenceInfrastructure(builder.Configuration);
builder.Services.AddSwaggerExtension();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddApiVersioningExtension();
builder.Services.AddHealthChecks();
builder.Services.AddOutputCache(options =>
{
    options.AddBasePolicy(policy => policy.NoCache());
    options.AddPolicy(OutputCachePolicies.RoutesList, policy => policy
        .Expire(TimeSpan.FromMinutes(1))
        .SetVaryByHeader("Authorization")
        .SetVaryByQuery("search", "tagId", "tagIds", "sort", "nearLat", "nearLng", "radiusKm", "authorId", "visibility", "type", "page", "pageSize")
        .Tag(OutputCacheTags.Routes));
    options.AddPolicy(OutputCachePolicies.RouteDetail, policy => policy
        .Expire(TimeSpan.FromMinutes(2))
        .SetVaryByHeader("Authorization")
        .SetVaryByRouteValue("routeId")
        .Tag(OutputCacheTags.Routes));
    options.AddPolicy(OutputCachePolicies.SpotsList, policy => policy
        .Expire(TimeSpan.FromMinutes(1))
        .SetVaryByQuery("search", "page", "pageSize")
        .Tag(OutputCacheTags.Spots));
    options.AddPolicy(OutputCachePolicies.SpotDetail, policy => policy
        .Expire(TimeSpan.FromMinutes(2))
        .SetVaryByRouteValue("spotId")
        .Tag(OutputCacheTags.Spots));
    options.AddPolicy(OutputCachePolicies.SpotRoutes, policy => policy
        .Expire(TimeSpan.FromMinutes(1))
        .SetVaryByRouteValue("spotId")
        .SetVaryByQuery("page", "pageSize")
        .Tag(OutputCacheTags.Spots)
        .Tag(OutputCacheTags.Routes));
    options.AddPolicy(OutputCachePolicies.TagsList, policy => policy
        .Expire(TimeSpan.FromMinutes(10))
        .SetVaryByQuery("pageNumber", "pageSize")
        .Tag(OutputCacheTags.Tags));
    options.AddPolicy(OutputCachePolicies.UserCollections, policy => policy
        .Expire(TimeSpan.FromMinutes(1))
        .SetVaryByQuery("pageNumber", "pageSize"));
    options.AddPolicy(OutputCachePolicies.UserCollectionDetail, policy => policy
        .Expire(TimeSpan.FromMinutes(2))
        .SetVaryByRouteValue("id"));
});
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<GzipCompressionProvider>();
    options.Providers.Add<BrotliCompressionProvider>();
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[]
    {
        "application/json",
        "text/json",
        "text/plain",
        "text/html",
        "text/css",
        "application/javascript",
        "text/javascript"
    });
});
builder.Services.AddScoped<IAuthenticatedUserService, AuthenticatedUserService>();
builder.Services.AddHttpContextAccessor();

//Build the application
var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await dbContext.Database.MigrateAsync();

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    string[] roles = [RoleNames.BasicUser, RoleNames.BusinessUser, RoleNames.Admin];
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole<Guid>(role));
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseRouting();
app.UseResponseCompression();
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000", "https://localhost:3000"];
app.UseCors(options => options
    .WithOrigins(allowedOrigins)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials());
app.UseOutputCache();
app.UseAuthentication();
app.UseAuthorization();
app.UseSwaggerExtension();
app.UseErrorHandlingMiddleware();
app.UseHealthChecks("/health");

app.MapControllers();


//Initialize Logger

Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(app.Configuration)
                .CreateLogger();

//Start the application
app.Run();
