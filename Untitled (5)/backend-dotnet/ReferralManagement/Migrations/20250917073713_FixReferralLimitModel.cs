using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReferralManagement.Migrations
{
    /// <inheritdoc />
    public partial class FixReferralLimitModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReferralLimits_Users_EmployeeId1",
                table: "ReferralLimits");

            migrationBuilder.DropIndex(
                name: "IX_ReferralLimits_EmployeeId1",
                table: "ReferralLimits");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_ReferralLimits_EmployeeId1",
                table: "ReferralLimits",
                column: "EmployeeId1");

            migrationBuilder.AddForeignKey(
                name: "FK_ReferralLimits_Users_EmployeeId1",
                table: "ReferralLimits",
                column: "EmployeeId1",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
