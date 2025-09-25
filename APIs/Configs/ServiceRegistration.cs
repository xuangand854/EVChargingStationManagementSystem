using Common.DTOs.AuthDto;
using Common.DTOs.ProfileStaffDto;
using Mapster;
using MapsterMapper;
using Repositories.Models;

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

            TypeAdapterConfig<RegisterAccountDto, UserAccount>.NewConfig()
                .Map(dest => dest.UserName, src => src.Email)
                .Map(dest => dest.PhoneNumber, src => src.Phone)
                .Ignore(dest => dest.Id)
                .IgnoreNullValues(true);

            TypeAdapterConfig<SCStaff, StaffViewDto>.NewConfig()
                .Map(dest => dest.Name, src => src.UserAccountNavigation != null ? src.UserAccountNavigation.Name : null)
                .Map(dest => dest.Email, src => src.UserAccountNavigation != null ? src.UserAccountNavigation.Email : null);

            return services;
        }
    }
}
