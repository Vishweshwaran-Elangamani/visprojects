using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReferralManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddSubmittedAtToReferral : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "SubmittedAt",
                table: "Referrals",
                type: "datetime(6)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SubmittedAt",
                table: "Referrals");
        }
    }
}
