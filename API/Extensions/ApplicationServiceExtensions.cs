using API.interfaces;
using API.Services;
using API.Data;
using Microsoft.EntityFrameworkCore;
using API.Helpers;
using API.SignalR;
using Microsoft.AspNetCore.Authentication.Certificate;

namespace API.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
        {
            //Binding database to the application
            services.AddAuthentication(
            CertificateAuthenticationDefaults.AuthenticationScheme)
            .AddCertificate();

            services.AddSingleton<PresenceTracker>();
            services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IPhotoService, PhotoService>();
            services.AddScoped<IUnitOfWork,UnitOfWork>();
            services.AddScoped<LogUserActivity>();
            services.AddAutoMapper(typeof(AutoMapperProfiles).Assembly);
            services.AddDbContext<DataContext>(options => {
                options.UseSqlite(config.GetConnectionString("DefaultConnection"));
            });
            return services;
            
        }
    }
}