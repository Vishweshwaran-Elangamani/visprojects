using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReferralManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeIdToEarning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EmployeeId",
                table: "Earnings",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmployeeId",
                table: "Earnings");
        }
    }
}
