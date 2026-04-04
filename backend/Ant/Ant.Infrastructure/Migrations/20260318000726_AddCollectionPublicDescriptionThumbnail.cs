using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ant.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCollectionPublicDescriptionThumbnail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPublic",
                table: "Collections",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Collections",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "Collections",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "IsPublic",     table: "Collections");
            migrationBuilder.DropColumn(name: "Description",  table: "Collections");
            migrationBuilder.DropColumn(name: "ThumbnailUrl", table: "Collections");
        }
    }
}
