using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using Ant.Application.Settings;
using Ant.Infrastructure.Caching;
using Ant.Infrastructure.Contexts;
using Ant.Infrastructure.Models;
using Ant.Infrastructure.Repositories;
using Ant.Infrastructure.Repository;
using Ant.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using StackExchange.Redis;
using System;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
using System.Text;

namespace Ant.Infrastructure
{
    public static class ServiceRegistration
    {
        public static void AddPersistenceInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            if (configuration.GetValue<bool>("UseInMemoryDatabase"))
            {
                services.AddDbContext<ApplicationDbContext>(options =>
                    options.UseInMemoryDatabase("ApplicationDb"));
            }
            else
            {
                services.AddDbContext<ApplicationDbContext>(options =>
               options.UseNpgsql(
                   configuration.GetConnectionString("DefaultConnection"),
                   b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)
                         .UseNetTopologySuite()
                         .EnableRetryOnFailure(5, TimeSpan.FromSeconds(30), null)
                         .CommandTimeout(60)));
            }



            if (string.Equals(configuration["Cache:Provider"], "Valkey", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(configuration["Cache:Provider"], "Redis", StringComparison.OrdinalIgnoreCase))
            {
                services.AddSingleton<IConnectionMultiplexer>(_ =>
                    ConnectionMultiplexer.Connect(configuration.GetConnectionString("Valkey") ?? "localhost:6379"));
                services.AddSingleton<IAppCacheService, ValkeyAppCacheService>();
            }
            else
            {
                services.AddMemoryCache();
                services.AddSingleton<IAppCacheService, AppMemoryCacheService>();
            }

            services.AddIdentity<ApplicationUser, IdentityRole<Guid>>().AddEntityFrameworkStores<ApplicationDbContext>().AddDefaultTokenProviders();
            #region Services
            services.AddTransient<IAuthService, AuthService>();
            services.AddTransient<IIdentityService, IdentityService>();
            
            // Use OSRM for map routing
            services.AddHttpClient<IMapRoutingService, OsrmMapRoutingService>(client =>
            {
                var osrmBaseUrl = configuration["Routing:OsrmBaseUrl"] ?? "http://router.project-osrm.org/";
                client.BaseAddress = new Uri(osrmBaseUrl);
                client.Timeout = TimeSpan.FromSeconds(10);
            })
            .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
            {
                PooledConnectionLifetime = TimeSpan.FromMinutes(5),
                PooledConnectionIdleTimeout = TimeSpan.FromMinutes(2),
                MaxConnectionsPerServer = 20,
                AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate | DecompressionMethods.Brotli
            })
            .SetHandlerLifetime(TimeSpan.FromMinutes(10));
            #endregion
            services.Configure<JWTSettings>(configuration.GetSection("JWTSettings"));
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer(o =>
                {
                    o.RequireHttpsMetadata = false;
                    o.SaveToken = false;
                    o.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero,
                        ValidIssuer = configuration["JWTSettings:Issuer"],
                        ValidAudience = configuration["JWTSettings:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWTSettings:Key"])),
                        RoleClaimType = ClaimTypes.Role
                    };
                    o.Events = new JwtBearerEvents()
                    {
                        OnAuthenticationFailed = c =>
                        {
                            c.NoResult();
                            c.Response.StatusCode = 401;
                            c.Response.ContentType = "application/json";
                            return c.Response.WriteAsync("Authentication failed.");
                        },
                        OnChallenge = context =>
                        {
                            context.HandleResponse();
                            context.Response.StatusCode = 401;
                            context.Response.ContentType = "application/json";
                            var result = "You are not Authorized";
                            return context.Response.WriteAsync(result);
                        },
                        OnForbidden = context =>
                        {
                            context.Response.StatusCode = 403;
                            context.Response.ContentType = "application/json";
                            var result = "You are not authorized to access this resource";
                            return context.Response.WriteAsync(result);
                        },
                    };
                });




            services.Configure<MailSettings>(configuration.GetSection("MailSettings"));
            services.AddTransient<IDateTimeService, DateTimeService>();
            services.AddTransient<IEmailService, EmailService>();


            #region Repositories
            services.AddTransient(typeof(IGenericRepositoryAsync<>), typeof(GenericRepositoryAsync<>));

            services.AddTransient<ITagRepositoryAsync, TagRepositoryAsync>();
            services.AddTransient<ISpotRepositoryAsync, SpotRepositoryAsync>();
            services.AddTransient<IRouteRepositoryAsync, RouteRepositoryAsync>();
            services.AddTransient<ICollectionRepositoryAsync, CollectionRepositoryAsync>();
            services.AddTransient<IRouteRatingRepositoryAsync, RouteRatingRepositoryAsync>();
            services.AddTransient<ISpotRatingRepositoryAsync, SpotRatingRepositoryAsync>();
            services.AddTransient<IRouteSpotRepositoryAsync, RouteSpotRepositoryAsync>();
            services.AddTransient<ISpotFavoriteRepositoryAsync, SpotFavoriteRepositoryAsync>();
            services.AddTransient<IPostRepositoryAsync, PostRepositoryAsync>();
            services.AddTransient<IPostReactionRepositoryAsync, PostReactionRepositoryAsync>();
            services.AddTransient<IPostCommentRepositoryAsync, PostCommentRepositoryAsync>();
            services.AddTransient<IPostShareRepositoryAsync, PostShareRepositoryAsync>();
            #endregion
        }
    }
}
