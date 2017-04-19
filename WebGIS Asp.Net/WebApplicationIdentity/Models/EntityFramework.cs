namespace WebApplicationIdentity.Models
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;

    public partial class EntityFramework : DbContext
    {
        public EntityFramework()
            : base("name=EntityFramework")
        {
        }

        public virtual DbSet<DanhMucCayTrongRauMau> DanhMucCayTrongRauMaus { get; set; }
        public virtual DbSet<DOANHNGHIEP> DOANHNGHIEPs { get; set; }
        public virtual DbSet<HANHCHINHHUYEN> HANHCHINHHUYENs { get; set; }
        public virtual DbSet<MATDUONGBO> MATDUONGBOes { get; set; }
        public virtual DbSet<NhomCayTrong> NhomCayTrongs { get; set; }
        public virtual DbSet<PHUBEMAT> PHUBEMATs { get; set; }
        public virtual DbSet<SAUBENH> SAUBENHs { get; set; }
        public virtual DbSet<SONGHO> SONGHOes { get; set; }
        public virtual DbSet<TIMDUONG> TIMDUONGs { get; set; }
        public virtual DbSet<TRONGTROT> TRONGTROTs { get; set; }
        public virtual DbSet<CONDUONG> CONDUONGs { get; set; }
        public virtual DbSet<CONGNGHECAO> CONGNGHECAOs { get; set; }
        public virtual DbSet<GIAPHANBON_THUOCBVTT_NONGSAN_GIONG> GIAPHANBON_THUOCBVTT_NONGSAN_GIONG { get; set; }
        public virtual DbSet<GIONGCAYTRONG> GIONGCAYTRONGs { get; set; }
        public virtual DbSet<SAUBENHGAYHAI> SAUBENHGAYHAIs { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<DanhMucCayTrongRauMau>()
                .Property(e => e.id)
                .IsUnicode(false);

            modelBuilder.Entity<SAUBENH>()
                .Property(e => e.DienTich)
                .HasPrecision(38, 8);

            modelBuilder.Entity<TIMDUONG>()
                .Property(e => e.doRong)
                .HasPrecision(38, 8);

            modelBuilder.Entity<TRONGTROT>()
                .Property(e => e.DienTichTrong)
                .HasPrecision(38, 8);
        }
    }
}
