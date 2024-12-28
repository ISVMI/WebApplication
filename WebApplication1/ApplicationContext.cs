using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.FileProviders;
using System;
using System.Text.Encodings.Web;
using System.Text.Json;
using static System.Net.WebRequestMethods;

namespace WebApplication1
{
    public class ApplicationContext : DbContext
    {
        public DbSet<Tasks> Tasks { get; set; } = null!;
         public ApplicationContext(DbContextOptions<ApplicationContext> options)
             : base(options)
         {
             Database.Migrate();
         }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;" +
                "Database=aspnet-53bc9b9d-9d6a-45d4-8429-2a2761773502;" +
                "Trusted_Connection=True;MultipleActiveResultSets=true");
        }
    }
}
