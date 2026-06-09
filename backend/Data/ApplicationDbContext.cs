using Microsoft.EntityFrameworkCore;
using SecurePaymentsPortal.Models;

namespace SecurePaymentsPortal.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<FailedLoginEvent> FailedLoginEvents { get; set; }
        public DbSet<RateLimitEvent> RateLimitEvents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => u.AccountNumber).IsUnique();
                entity.HasIndex(u => u.IdNumber).IsUnique();
                entity.Property(u => u.Role).HasDefaultValue("Customer");
                entity.Property(u => u.CreatedAt);
            });

            // Payment configuration
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.ToTable("payments");
                entity.HasKey(p => p.Id);
                entity.Property(p => p.Status).HasDefaultValue("PENDING");
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(p => p.Amount).HasColumnType("decimal(18,2)");

                entity.HasOne(p => p.User)
                      .WithMany(u => u.Payments)
                      .HasForeignKey(p => p.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
