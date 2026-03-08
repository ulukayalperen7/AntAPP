using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace CleanArchitecture.WebApi.Extensions
{
    public static class ServiceExtensions
    {
        public static void AddSwaggerExtension(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                var xmlFile = "CleanArchitecture.WebApi.xml";
                var xmlPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, xmlFile);
                c.IncludeXmlComments(xmlPath);

                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Version = "v1",
                    Title = "AntAPP API",
                    Description = "Route Planning & Social Platform API",
                    Contact = new OpenApiContact
                    {
                        Name = "AntAPP Team",
                        Email = "team@antapp.local",
                        Url = new Uri("https://antapp.local"),
                    }
                });
                c.CustomSchemaIds(GetSchemaId);
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    Description = "Input your Bearer token in this format - Bearer {your token here} to access this API",
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer",
                            },
                            Scheme = "Bearer",
                            Name = "Bearer",
                            In = ParameterLocation.Header,
                        }, new List<string>()
                    },
                });
            });
        }

        private static string GetSchemaId(Type type)
        {
            if (type.IsGenericType)
            {
                var genericPrefix = string.Concat(type.GetGenericArguments().Select(GetSchemaId));
                return genericPrefix + NormalizeSchemaName(type.Name.Split('`')[0]);
            }

            return NormalizeSchemaName(type.Name);
        }

        private static string NormalizeSchemaName(string name)
        {
            return name
                .Replace("Categories", "__ROUTE_CATEGORIES__")
                .Replace("Category", "__ROUTE_CATEGORY__")
                .Replace("Products", "__ROUTES__")
                .Replace("Product", "__ROUTE__")
                .Replace("__ROUTE_CATEGORIES__", "RouteCategories")
                .Replace("__ROUTE_CATEGORY__", "RouteCategory")
                .Replace("__ROUTES__", "Routes")
                .Replace("__ROUTE__", "Route");
        }

        public static void AddApiVersioningExtension(this IServiceCollection services)
        {
            services.AddApiVersioning(config =>
            {
                // Specify the default API Version as 1.0
                config.DefaultApiVersion = new ApiVersion(1, 0);
                // If the client hasn't specified the API version in the request, use the default API version number 
                config.AssumeDefaultVersionWhenUnspecified = true;
                // Advertise the API versions supported for the particular endpoint
                config.ReportApiVersions = true;
            });
        }
    }
}
