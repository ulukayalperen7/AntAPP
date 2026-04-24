FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Ant/Ant.WebApi/Ant.WebApi.csproj", "Ant/Ant.WebApi/"]
COPY ["Ant/Ant.Application/Ant.Application.csproj", "Ant/Ant.Application/"]
COPY ["Ant/Ant.Core/Ant.Core.csproj", "Ant/Ant.Core/"]
COPY ["Ant/Ant.Infrastructure/Ant.Infrastructure.csproj", "Ant/Ant.Infrastructure/"]
RUN dotnet restore "Ant/Ant.WebApi/Ant.WebApi.csproj"
COPY . .
RUN dotnet publish "Ant/Ant.WebApi/Ant.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Ant.WebApi.dll"]
