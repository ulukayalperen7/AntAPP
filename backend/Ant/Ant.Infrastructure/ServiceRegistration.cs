using Ant.Application.Interfaces;
using Ant.Application.Interfaces.Repositories;
using Ant.Application.Wrappers;
using Ant.Application.Settings;
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
using System;
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
                   b => b.UseNetTopologySuite().MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));
            }



            services.AddIdentity<ApplicationUser, IdentityRole<Guid>>().AddEntityFrameworkStores<ApplicationDbContext>().AddDefaultTokenProviders();
            #region Services
            services.AddTransient<IAuthService, AuthService>();
            services.AddTransient<IIdentityService, IdentityService>();
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
            #endregion
        }
    }
}
