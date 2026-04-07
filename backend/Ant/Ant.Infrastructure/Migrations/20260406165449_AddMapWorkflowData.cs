using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace Ant.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMapWorkflowData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GooglePlaceId",
                table: "Spots",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<Point>(
                name: "CenterLocation",
                table: "Routes",
                type: "geometry",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EncodedPolyline",
                table: "Routes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EstimatedDurationSeconds",
                table: "Routes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "TotalDistanceMeters",
                table: "Routes",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.CreateIndex(
                name: "IX_Routes_CenterLocation",
                table: "Routes",
                column: "CenterLocation")
                .Annotation("Npgsql:IndexMethod", "GIST");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Routes_CenterLocation",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "GooglePlaceId",
                table: "Spots");

            migrationBuilder.DropColumn(
                name: "CenterLocation",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "EncodedPolyline",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "EstimatedDurationSeconds",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "TotalDistanceMeters",
                table: "Routes");
        }
    }
}
