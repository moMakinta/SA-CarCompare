using Microsoft.EntityFrameworkCore;

namespace SACarCompare.Models
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Car> Cars { get; set; }
        public DbSet<Dealer> Dealers { get; set; }
        // Add DbSets for Appointments and Reviews here when you're ready
    }
}