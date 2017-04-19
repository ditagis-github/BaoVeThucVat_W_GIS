namespace WebApplicationIdentity.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("SAUBENH")]
    public partial class SAUBENH
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int OBJECTID { get; set; }

        public short? NhomCayTrong { get; set; }

        [StringLength(50)]
        public string LoaiCayTrong { get; set; }

        [StringLength(50)]
        public string TenSauBenhGayHai { get; set; }

        public short? MatDoSauBenhGayHai { get; set; }

        public short? PhamViAnhHuong { get; set; }

        public short? MucDoAnhHuong { get; set; }

        public short? ThoiGianGayHai { get; set; }

        public short? CapDoGayHai { get; set; }

        public short? TinhHinhKiemSoatDichBenh { get; set; }

        public short? MucDoKiemSoat { get; set; }

        [StringLength(50)]
        public string BienPhapXuLy { get; set; }

        [Column(TypeName = "numeric")]
        public decimal? DienTich { get; set; }

        [StringLength(10)]
        public string MaHuyenTP { get; set; }

        public int? GiaiDoanSinhTruong { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? NgayCapNhat { get; set; }

        [StringLength(20)]
        public string NguoiCapNhat { get; set; }

        [StringLength(50)]
        public string MaSauBenh { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? NgayXayRa { get; set; }

        [StringLength(50)]
        public string SauBenhGayHai { get; set; }

        public DbGeometry SHAPE { get; set; }
    }
}
