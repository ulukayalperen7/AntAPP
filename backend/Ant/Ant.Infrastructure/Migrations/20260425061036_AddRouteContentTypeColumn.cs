using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ant.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRouteContentTypeColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ContentType",
                table: "Routes",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContentType",
                table: "Routes");
        }
    }
}
