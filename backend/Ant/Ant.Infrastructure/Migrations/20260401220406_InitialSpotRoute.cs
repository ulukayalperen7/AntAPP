using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ant.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialSpotRoute : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_RouteSpots_RouteId_SpotOrder",
                table: "RouteSpots",
                columns: new[] { "RouteId", "SpotOrder" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RouteSpots_RouteId_SpotOrder",
                table: "RouteSpots");
        }
    }
}
