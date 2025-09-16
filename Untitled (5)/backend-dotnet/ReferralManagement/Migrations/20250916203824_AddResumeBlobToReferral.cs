using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ReferralManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddResumeBlobToReferral : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ResumePdf",
                table: "Referrals",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "CurrentCompany",
                table: "Referrals",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<byte[]>(
                name: "ResumeBlob",
                table: "Referrals",
                type: "longblob",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResumeBlob",
                table: "Referrals");

            migrationBuilder.UpdateData(
                table: "Referrals",
                keyColumn: "ResumePdf",
                keyValue: null,
                column: "ResumePdf",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "ResumePdf",
                table: "Referrals",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "Referrals",
                keyColumn: "CurrentCompany",
                keyValue: null,
                column: "CurrentCompany",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "CurrentCompany",
                table: "Referrals",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
