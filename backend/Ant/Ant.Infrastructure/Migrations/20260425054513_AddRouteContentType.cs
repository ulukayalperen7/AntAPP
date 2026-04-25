using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ant.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRouteContentType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Routes_OriginalRouteId",
                table: "Routes",
                column: "OriginalRouteId");

            migrationBuilder.AddForeignKey(
                name: "FK_Routes_Routes_OriginalRouteId",
                table: "Routes",
                column: "OriginalRouteId",
                principalTable: "Routes",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Routes_Routes_OriginalRouteId",
                table: "Routes");

            migrationBuilder.DropIndex(
                name: "IX_Routes_OriginalRouteId",
                table: "Routes");
        }
    }
}
