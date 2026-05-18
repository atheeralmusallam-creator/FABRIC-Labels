# ─── Build stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY src/*.csproj ./src/
RUN dotnet restore src/Fabric.Api.csproj

COPY src/ ./src/
RUN dotnet publish src/Fabric.Api.csproj -c Release -o /publish

# ─── Runtime stage ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /publish .

# Create upload directory
RUN mkdir -p /app/public/uploads

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Fabric.Api.dll"]
