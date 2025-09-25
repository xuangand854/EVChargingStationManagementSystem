using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repositories.Migrations
{
    /// <inheritdoc />
    public partial class fixNavigations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChargingPosts_ChargingStation_ChargingStationNavigationId",
                table: "ChargingPosts");

            migrationBuilder.DropForeignKey(
                name: "FK_ChargingSession_AspNetUsers_StartedByNavigationId",
                table: "ChargingSession");

            migrationBuilder.DropForeignKey(
                name: "FK_ChargingSession_ChargingPosts_ChargingPostId",
                table: "ChargingSession");

            migrationBuilder.DropForeignKey(
                name: "FK_EVDrivers_AspNetUsers_UserAccountNavigationId",
                table: "EVDrivers");

            migrationBuilder.DropForeignKey(
                name: "FK_EVDrivers_Rankings_RankingId",
                table: "EVDrivers");

            migrationBuilder.DropForeignKey(
                name: "FK_NotificationRecipient_Notifications_NotificationId",
                table: "NotificationRecipient");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_AspNetUsers_CreatedByNavigationId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_PowerOutputKWPerPosts_ChargingPosts_ChargingPostId",
                table: "PowerOutputKWPerPosts");

            migrationBuilder.DropForeignKey(
                name: "FK_SCStaffs_AspNetUsers_UserAccountNavigationId",
                table: "SCStaffs");

            migrationBuilder.DropForeignKey(
                name: "FK_UserVehicle_EVDrivers_DriverId",
                table: "UserVehicle");

            migrationBuilder.DropForeignKey(
                name: "FK_UserVehicle_VehicleModels_VehicleModelId",
                table: "UserVehicle");

            migrationBuilder.DropForeignKey(
                name: "FK_VehicleModels_AspNetUsers_UserAccountNavigationId",
                table: "VehicleModels");

            migrationBuilder.DropIndex(
                name: "IX_ChargingSession_StartedByNavigationId",
                table: "ChargingSession");

            migrationBuilder.DropPrimaryKey(
                name: "PK_VehicleModels",
                table: "VehicleModels");

            migrationBuilder.DropIndex(
                name: "IX_VehicleModels_UserAccountNavigationId",
                table: "VehicleModels");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SCStaffs",
                table: "SCStaffs");

            migrationBuilder.DropIndex(
                name: "IX_SCStaffs_UserAccountNavigationId",
                table: "SCStaffs");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_CreatedByNavigationId",
                table: "Notifications");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EVDrivers",
                table: "EVDrivers");

            migrationBuilder.DropIndex(
                name: "IX_EVDrivers_UserAccountNavigationId",
                table: "EVDrivers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ChargingPosts",
                table: "ChargingPosts");

            migrationBuilder.DropIndex(
                name: "IX_ChargingPosts_ChargingStationNavigationId",
                table: "ChargingPosts");

            migrationBuilder.DropColumn(
                name: "StartedByNavigationId",
                table: "ChargingSession");

            migrationBuilder.DropColumn(
                name: "UserAccountNavigationId",
                table: "VehicleModels");

            migrationBuilder.DropColumn(
                name: "UserAccountNavigationId",
                table: "SCStaffs");

            migrationBuilder.DropColumn(
                name: "CreatedByNavigationId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "UserAccountNavigationId",
                table: "EVDrivers");

            migrationBuilder.DropColumn(
                name: "ChargingStationNavigationId",
                table: "ChargingPosts");

            migrationBuilder.RenameTable(
                name: "VehicleModels",
                newName: "VehicleModel");

            migrationBuilder.RenameTable(
                name: "SCStaffs",
                newName: "SCStaff");

            migrationBuilder.RenameTable(
                name: "Notifications",
                newName: "Notification");

            migrationBuilder.RenameTable(
                name: "EVDrivers",
                newName: "EVDriver");

            migrationBuilder.RenameTable(
                name: "ChargingPosts",
                newName: "ChargingPost");

            migrationBuilder.RenameIndex(
                name: "IX_EVDrivers_RankingId",
                table: "EVDriver",
                newName: "IX_EVDriver_RankingId");

            migrationBuilder.AddColumn<Guid>(
                name: "UserAccountId",
                table: "UserVehicle",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                table: "Notification",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Notification",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                table: "ChargingPost",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "ChargingPost",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddPrimaryKey(
                name: "PK_VehicleModel",
                table: "VehicleModel",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SCStaff",
                table: "SCStaff",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notification",
                table: "Notification",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_EVDriver",
                table: "EVDriver",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChargingPost",
                table: "ChargingPost",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_UserVehicle_UserAccountId",
                table: "UserVehicle",
                column: "UserAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_ChargingSession_StartedBy",
                table: "ChargingSession",
                column: "StartedBy");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleModel_CreatedBy",
                table: "VehicleModel",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_SCStaff_AccountId",
                table: "SCStaff",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Notification_CreatedBy",
                table: "Notification",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_EVDriver_AccountId",
                table: "EVDriver",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_ChargingPost_StationId",
                table: "ChargingPost",
                column: "StationId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChargingPost_ChargingStation_StationId",
                table: "ChargingPost",
                column: "StationId",
                principalTable: "ChargingStation",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ChargingSession_AspNetUsers_StartedBy",
                table: "ChargingSession",
                column: "StartedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ChargingSession_ChargingPost_ChargingPostId",
                table: "ChargingSession",
                column: "ChargingPostId",
                principalTable: "ChargingPost",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EVDriver_AspNetUsers_AccountId",
                table: "EVDriver",
                column: "AccountId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EVDriver_Rankings_RankingId",
                table: "EVDriver",
                column: "RankingId",
                principalTable: "Rankings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_AspNetUsers_CreatedBy",
                table: "Notification",
                column: "CreatedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_NotificationRecipient_Notification_NotificationId",
                table: "NotificationRecipient",
                column: "NotificationId",
                principalTable: "Notification",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PowerOutputKWPerPosts_ChargingPost_ChargingPostId",
                table: "PowerOutputKWPerPosts",
                column: "ChargingPostId",
                principalTable: "ChargingPost",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SCStaff_AspNetUsers_AccountId",
                table: "SCStaff",
                column: "AccountId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserVehicle_AspNetUsers_UserAccountId",
                table: "UserVehicle",
                column: "UserAccountId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserVehicle_EVDriver_DriverId",
                table: "UserVehicle",
                column: "DriverId",
                principalTable: "EVDriver",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserVehicle_VehicleModel_VehicleModelId",
                table: "UserVehicle",
                column: "VehicleModelId",
                principalTable: "VehicleModel",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_VehicleModel_AspNetUsers_CreatedBy",
                table: "VehicleModel",
                column: "CreatedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChargingPost_ChargingStation_StationId",
                table: "ChargingPost");

            migrationBuilder.DropForeignKey(
                name: "FK_ChargingSession_AspNetUsers_StartedBy",
                table: "ChargingSession");

            migrationBuilder.DropForeignKey(
                name: "FK_ChargingSession_ChargingPost_ChargingPostId",
                table: "ChargingSession");

            migrationBuilder.DropForeignKey(
                name: "FK_EVDriver_AspNetUsers_AccountId",
                table: "EVDriver");

            migrationBuilder.DropForeignKey(
                name: "FK_EVDriver_Rankings_RankingId",
                table: "EVDriver");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_AspNetUsers_CreatedBy",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_NotificationRecipient_Notification_NotificationId",
                table: "NotificationRecipient");

            migrationBuilder.DropForeignKey(
                name: "FK_PowerOutputKWPerPosts_ChargingPost_ChargingPostId",
                table: "PowerOutputKWPerPosts");

            migrationBuilder.DropForeignKey(
                name: "FK_SCStaff_AspNetUsers_AccountId",
                table: "SCStaff");

            migrationBuilder.DropForeignKey(
                name: "FK_UserVehicle_AspNetUsers_UserAccountId",
                table: "UserVehicle");

            migrationBuilder.DropForeignKey(
                name: "FK_UserVehicle_EVDriver_DriverId",
                table: "UserVehicle");

            migrationBuilder.DropForeignKey(
                name: "FK_UserVehicle_VehicleModel_VehicleModelId",
                table: "UserVehicle");

            migrationBuilder.DropForeignKey(
                name: "FK_VehicleModel_AspNetUsers_CreatedBy",
                table: "VehicleModel");

            migrationBuilder.DropIndex(
                name: "IX_UserVehicle_UserAccountId",
                table: "UserVehicle");

            migrationBuilder.DropIndex(
                name: "IX_ChargingSession_StartedBy",
                table: "ChargingSession");

            migrationBuilder.DropPrimaryKey(
                name: "PK_VehicleModel",
                table: "VehicleModel");

            migrationBuilder.DropIndex(
                name: "IX_VehicleModel_CreatedBy",
                table: "VehicleModel");

            migrationBuilder.DropPrimaryKey(
                name: "PK_SCStaff",
                table: "SCStaff");

            migrationBuilder.DropIndex(
                name: "IX_SCStaff_AccountId",
                table: "SCStaff");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notification",
                table: "Notification");

            migrationBuilder.DropIndex(
                name: "IX_Notification_CreatedBy",
                table: "Notification");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EVDriver",
                table: "EVDriver");

            migrationBuilder.DropIndex(
                name: "IX_EVDriver_AccountId",
                table: "EVDriver");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ChargingPost",
                table: "ChargingPost");

            migrationBuilder.DropIndex(
                name: "IX_ChargingPost_StationId",
                table: "ChargingPost");

            migrationBuilder.DropColumn(
                name: "UserAccountId",
                table: "UserVehicle");

            migrationBuilder.RenameTable(
                name: "VehicleModel",
                newName: "VehicleModels");

            migrationBuilder.RenameTable(
                name: "SCStaff",
                newName: "SCStaffs");

            migrationBuilder.RenameTable(
                name: "Notification",
                newName: "Notifications");

            migrationBuilder.RenameTable(
                name: "EVDriver",
                newName: "EVDrivers");

            migrationBuilder.RenameTable(
                name: "ChargingPost",
                newName: "ChargingPosts");

            migrationBuilder.RenameIndex(
                name: "IX_EVDriver_RankingId",
                table: "EVDrivers",
                newName: "IX_EVDrivers_RankingId");

            migrationBuilder.AddColumn<Guid>(
                name: "StartedByNavigationId",
                table: "ChargingSession",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "UserAccountNavigationId",
                table: "VehicleModels",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "UserAccountNavigationId",
                table: "SCStaffs",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                table: "Notifications",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Notifications",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByNavigationId",
                table: "Notifications",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "UserAccountNavigationId",
                table: "EVDrivers",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                table: "ChargingPosts",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "ChargingPosts",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AddColumn<Guid>(
                name: "ChargingStationNavigationId",
                table: "ChargingPosts",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_VehicleModels",
                table: "VehicleModels",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_SCStaffs",
                table: "SCStaffs",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_EVDrivers",
                table: "EVDrivers",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChargingPosts",
                table: "ChargingPosts",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_ChargingSession_StartedByNavigationId",
                table: "ChargingSession",
                column: "StartedByNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleModels_UserAccountNavigationId",
                table: "VehicleModels",
                column: "UserAccountNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_SCStaffs_UserAccountNavigationId",
                table: "SCStaffs",
                column: "UserAccountNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CreatedByNavigationId",
                table: "Notifications",
                column: "CreatedByNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_EVDrivers_UserAccountNavigationId",
                table: "EVDrivers",
                column: "UserAccountNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_ChargingPosts_ChargingStationNavigationId",
                table: "ChargingPosts",
                column: "ChargingStationNavigationId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChargingPosts_ChargingStation_ChargingStationNavigationId",
                table: "ChargingPosts",
                column: "ChargingStationNavigationId",
                principalTable: "ChargingStation",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ChargingSession_AspNetUsers_StartedByNavigationId",
                table: "ChargingSession",
                column: "StartedByNavigationId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ChargingSession_ChargingPosts_ChargingPostId",
                table: "ChargingSession",
                column: "ChargingPostId",
                principalTable: "ChargingPosts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EVDrivers_AspNetUsers_UserAccountNavigationId",
                table: "EVDrivers",
                column: "UserAccountNavigationId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EVDrivers_Rankings_RankingId",
                table: "EVDrivers",
                column: "RankingId",
                principalTable: "Rankings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_NotificationRecipient_Notifications_NotificationId",
                table: "NotificationRecipient",
                column: "NotificationId",
                principalTable: "Notifications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_AspNetUsers_CreatedByNavigationId",
                table: "Notifications",
                column: "CreatedByNavigationId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PowerOutputKWPerPosts_ChargingPosts_ChargingPostId",
                table: "PowerOutputKWPerPosts",
                column: "ChargingPostId",
                principalTable: "ChargingPosts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SCStaffs_AspNetUsers_UserAccountNavigationId",
                table: "SCStaffs",
                column: "UserAccountNavigationId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserVehicle_EVDrivers_DriverId",
                table: "UserVehicle",
                column: "DriverId",
                principalTable: "EVDrivers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserVehicle_VehicleModels_VehicleModelId",
                table: "UserVehicle",
                column: "VehicleModelId",
                principalTable: "VehicleModels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_VehicleModels_AspNetUsers_UserAccountNavigationId",
                table: "VehicleModels",
                column: "UserAccountNavigationId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
