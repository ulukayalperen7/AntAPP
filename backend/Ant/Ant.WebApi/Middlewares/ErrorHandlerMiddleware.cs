using Ant.Application.Exceptions;
using Ant.Application.Wrappers;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

namespace Ant.WebApi.Middlewares
{
    public class ErrorHandlerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlerMiddleware> _logger;

        public ErrorHandlerMiddleware(RequestDelegate next, ILogger<ErrorHandlerMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception error)
            {
                var response = context.Response;
                response.ContentType = "application/json";
                var errorResponse = new ErrorResponse();


                switch (error)
                {
                    case ApiException e:
                        // custom application error
                        response.StatusCode = (int)HttpStatusCode.BadRequest;
                        errorResponse.Message = e.Message;
                        _logger.LogWarning(e, "Application Exception: {Message}", e.Message);
                        break;
                    case ValidationException e:
                        // custom application error
                        response.StatusCode = (int)HttpStatusCode.BadRequest;
                        errorResponse.Message ="Some validation errors occured.";
                        errorResponse.Errors = e.Errors;
                        _logger.LogWarning(e, "Validation Exception: {Message}", e.Message);
                        break;
                    case KeyNotFoundException e:
                        // not found error
                        response.StatusCode = (int)HttpStatusCode.NotFound;
                        _logger.LogWarning(e, "Key Not Found Exception: {Message}", e.Message);
                        break;
                    default:
                        // unhandled error
                        response.StatusCode = (int)HttpStatusCode.InternalServerError;
                        _logger.LogError(error, "Unhandled Exception: {Message}", error.Message);
                        break;
                }
                var result = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions 
                { 
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
                });

                await response.WriteAsync(result);
            }
        }
    }
}
