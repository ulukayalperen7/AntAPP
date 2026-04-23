using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ant.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Spots_OwnerUserId",
                table: "Spots");

            migrationBuilder.DropIndex(
                name: "IX_Routes_AuthorUserId",
                table: "Routes");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:pg_trgm", ",,")
                .Annotation("Npgsql:PostgresExtension:postgis", ",,")
                .OldAnnotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.CreateIndex(
                name: "IX_Spots_Description",
                table: "Spots",
                column: "Description")
                .Annotation("Npgsql:IndexMethod", "GIN")
                .Annotation("Npgsql:IndexOperators", new[] { "gin_trgm_ops" });

            migrationBuilder.CreateIndex(
                name: "IX_Spots_IsActive_CreatedAt",
                table: "Spots",
                columns: new[] { "IsActive", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Spots_Location",
                table: "Spots",
                column: "Location")
                .Annotation("Npgsql:IndexMethod", "GIST");

            migrationBuilder.CreateIndex(
                name: "IX_Spots_Name",
                table: "Spots",
                column: "Name")
                .Annotation("Npgsql:IndexMethod", "GIN")
                .Annotation("Npgsql:IndexOperators", new[] { "gin_trgm_ops" });

            migrationBuilder.CreateIndex(
                name: "IX_Spots_OwnerUserId_CreatedAt",
                table: "Spots",
                columns: new[] { "OwnerUserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Routes_AuthorUserId_CreatedAt",
                table: "Routes",
                columns: new[] { "AuthorUserId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Routes_Description",
                table: "Routes",
                column: "Description")
                .Annotation("Npgsql:IndexMethod", "GIN")
                .Annotation("Npgsql:IndexOperators", new[] { "gin_trgm_ops" });

            migrationBuilder.CreateIndex(
                name: "IX_Routes_IsDeleted_IsPublic_CreatedAt",
                table: "Routes",
                columns: new[] { "IsDeleted", "IsPublic", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Routes_Title",
                table: "Routes",
                column: "Title")
                .Annotation("Npgsql:IndexMethod", "GIN")
                .Annotation("Npgsql:IndexOperators", new[] { "gin_trgm_ops" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Spots_Description",
                table: "Spots");

            migrationBuilder.DropIndex(
                name: "IX_Spots_IsActive_CreatedAt",
                table: "Spots");

            migrationBuilder.DropIndex(
                name: "IX_Spots_Location",
                table: "Spots");

            migrationBuilder.DropIndex(
                name: "IX_Spots_Name",
                table: "Spots");

            migrationBuilder.DropIndex(
                name: "IX_Spots_OwnerUserId_CreatedAt",
                table: "Spots");

            migrationBuilder.DropIndex(
                name: "IX_Routes_AuthorUserId_CreatedAt",
                table: "Routes");

            migrationBuilder.DropIndex(
                name: "IX_Routes_Description",
                table: "Routes");

            migrationBuilder.DropIndex(
                name: "IX_Routes_IsDeleted_IsPublic_CreatedAt",
                table: "Routes");

            migrationBuilder.DropIndex(
                name: "IX_Routes_Title",
                table: "Routes");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:postgis", ",,")
                .OldAnnotation("Npgsql:PostgresExtension:pg_trgm", ",,")
                .OldAnnotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.CreateIndex(
                name: "IX_Spots_OwnerUserId",
                table: "Spots",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Routes_AuthorUserId",
                table: "Routes",
                column: "AuthorUserId");
        }
    }
}
