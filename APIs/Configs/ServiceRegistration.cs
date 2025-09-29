using Common.DTOs.AuthDto;
using Common.DTOs.ProfileStaffDto;
using Common.DTOs.VehicleModelDto;
using Mapster;
using MapsterMapper;
using Infrastructure.Models;

namespace APIs.Configs
{
    public static class ServiceRegistration
    {
        public static IServiceCollection ExtensionServices(this IServiceCollection services)
        {
            // Register other services here if needed
            // services.AddScoped<IAuthService, AuthService>();
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
            TypeAdapterConfig<SCStaff, StaffViewDto>.NewConfig()
                .Map(dest => dest.Name, src => src.UserAccountNavigation != null ? src.UserAccountNavigation.Name : null)
                .Map(dest => dest.Email, src => src.UserAccountNavigation != null ? src.UserAccountNavigation.Email : null);

            TypeAdapterConfig<VehicleModelUpdateDto, VehicleModel>.NewConfig()
                .IgnoreNullValues(true);

            return services;
        }
    }
}
