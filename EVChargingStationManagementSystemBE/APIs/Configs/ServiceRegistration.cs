using Common.DTOs.AuthDto;
using Common.DTOs.ChargingPostDto;
using Common.DTOs.ChargingStationDto;
using Common.DTOs.ProfileEVDriverDto;
using Common.DTOs.ProfileStaffDto;
using Common.DTOs.SystemConfigurationDto;
using Common.DTOs.VehicleModelDto;
using Infrastructure.Models;
using Mapster;
using MapsterMapper;

namespace APIs.Configs
{
    public static class ServiceRegistration
    {
        public static IServiceCollection ExtensionServices(this IServiceCollection services)
        {
            services.ConfigMapster();
            return services;
        }
        private static IServiceCollection ConfigMapster(this IServiceCollection services)
        {
            var config = TypeAdapterConfig.GlobalSettings;
            config.Scan(typeof(ServiceRegistration).Assembly); // Auto-scan for mappings

            services.AddSingleton(config);
            services.AddScoped<IMapper, Mapper>();

            // Map dto vào model
            TypeAdapterConfig<RegisterAccountDto, UserAccount>.NewConfig()
                .Map(dest => dest.UserName, src => src.Email)
                .Map(dest => dest.PhoneNumber, src => src.Phone)
                .Ignore(dest => dest.Id)
                .IgnoreNullValues(true);

            // Map model vào dto
            TypeAdapterConfig<SCStaffProfile, StaffViewDto>.NewConfig()
                .Map(dest => dest.Name, src => src.UserAccountNavigation != null ? src.UserAccountNavigation.Name : null)
                .Map(dest => dest.Email, src => src.UserAccountNavigation != null ? src.UserAccountNavigation.Email : null);

            TypeAdapterConfig<VehicleModelUpdateDto, VehicleModel>.NewConfig()
                .IgnoreNullValues(true);

            TypeAdapterConfig<ChargingStationUpdateDto, ChargingStation>.NewConfig()
                .IgnoreNullValues(true);

            TypeAdapterConfig<ChargingPostUpdateDto, ChargingPost>.NewConfig()
                .IgnoreNullValues(true);
            // EVDriver
            //  Khi EVDriver tự cập nhật profile cá nhân
            TypeAdapterConfig<EVDriverUpdateSelfDto, EVDriverProfile>.NewConfig()
                .Ignore(dest => dest.Id)
                .IgnoreNullValues(true);

            TypeAdapterConfig<EVDriverUpdateSelfDto, UserAccount>.NewConfig()
                .Ignore(dest => dest.Id)
                .IgnoreNullValues(true);

            //  Khi Admin cập nhật trạng thái của EVDriver
            TypeAdapterConfig<EVDriverUpdateStatusDto, EVDriverProfile>.NewConfig()
                .Map(dest => dest.Status, src => src.Status)
                .IgnoreNullValues(true);

            //  Map entity → view dto (trả về cho client)
            TypeAdapterConfig<EVDriverProfile, EVDriverViewDto>.NewConfig()
                .Map(dest => dest, src => src.UserAccount) // auto-map các field giống tên: Name, Email, Phone, Address, ProfilePictureUrl
                .Map(dest => dest.RankingName, src => src.Ranking.RankName)
                .Map(dest => dest.VehicleModelIds,
                     src => src.UserVehicles != null
                            ? src.UserVehicles.Select(v => v.VehicleModelId).ToList()
                            : new List<Guid>())
                .Map(dest => dest.AccountId, src => src.AccountId)
                .Map(dest => dest.Id, src => src.Id)
                .IgnoreNullValues(true);


            //  SCStaff
            //  Khi Admin tạo account + profile Staff
            TypeAdapterConfig<StaffAccountCreateDto, UserAccount>.NewConfig()
                .Map(dest => dest.UserName, src => src.Email)
                .Ignore(dest => dest.Id)
                .IgnoreNullValues(true);

            TypeAdapterConfig<StaffAccountCreateDto, SCStaffProfile>.NewConfig()
                .Ignore(dest => dest.Id)
                .Ignore(dest => dest.AccountId)
                .IgnoreNullValues(true);

            //  Khi Admin cập nhật profile Staff (profile + account)
            TypeAdapterConfig<StaffUpdateAdminDto, SCStaffProfile>.NewConfig()
                .IgnoreNullValues(true);

            TypeAdapterConfig<StaffUpdateAdminDto, UserAccount>.NewConfig()
                .Ignore(dest => dest.Id)
                .IgnoreNullValues(true);

            //  Khi Staff tự cập nhật thông tin của mình
            TypeAdapterConfig<StaffUpdateDto, UserAccount>.NewConfig()
                .Ignore(dest => dest.Id)
                .IgnoreNullValues(true);

            //  Khi Admin cập nhật trạng thái Staff
            TypeAdapterConfig<StaffUpdateStatusDto, SCStaffProfile>.NewConfig()
                .Map(dest => dest.Status, src => src.Status)
                .IgnoreNullValues(true);

            //  Map model → view dto (trả về cho client)
            TypeAdapterConfig<SCStaffProfile, StaffViewDto>.NewConfig()
                .Map(dest => dest, src => src.UserAccountNavigation) // map các field trùng tên tự động
                .Map(dest => dest.AccountId, src => src.AccountId)
                .Map(dest => dest.Id, src => src.Id)
                .IgnoreNullValues(true);

            

            TypeAdapterConfig<SystemConfigurationUpdateDto, SystemConfiguration>.NewConfig()
                .IgnoreNullValues(true);

            return services;
        }
    }
}
