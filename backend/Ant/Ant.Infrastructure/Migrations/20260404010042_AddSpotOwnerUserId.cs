using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ant.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSpotOwnerUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OwnerUserId",
                table: "Spots",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Spots_OwnerUserId",
                table: "Spots",
                column: "OwnerUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Spots_Users_OwnerUserId",
                table: "Spots",
                column: "OwnerUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Spots_Users_OwnerUserId",
                table: "Spots");

            migrationBuilder.DropIndex(
                name: "IX_Spots_OwnerUserId",
                table: "Spots");

            migrationBuilder.DropColumn(
                name: "OwnerUserId",
                table: "Spots");
        }
    }
}
