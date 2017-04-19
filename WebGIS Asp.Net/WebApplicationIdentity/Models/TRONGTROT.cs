namespace WebApplicationIdentity.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("TRONGTROT")]
    public partial class TRONGTROT
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int OBJECTID { get; set; }

        [StringLength(20)]
        public string MaDoiTuong { get; set; }

        public short? NhomCayTrong { get; set; }

        [StringLength(50)]
        public string LoaiCayTrong { get; set; }

        [Column(TypeName = "numeric")]
        public decimal? DienTichTrong { get; set; }

        public short? TinhHinhUngDungCongNghe { get; set; }

        [StringLength(100)]
        public string ToChucCaNhanQuanLy { get; set; }

        [StringLength(100)]
        public string TinhTrangThuHoach { get; set; }

        [StringLength(200)]
        public string GhiChu { get; set; }

        [StringLength(10)]
        public string MaLoaiCayTrong { get; set; }

        public short? PhuongThucTrong { get; set; }

        public short? ThoiVuTrongTrot { get; set; }

        [StringLength(50)]
        public string MatDoCayTrong { get; set; }

        [StringLength(50)]
        public string TenGiongCayTrong { get; set; }

        [StringLength(20)]
        public string MaHuyenTP { get; set; }

        public int? GiaiDoanSinhTruong { get; set; }

        [StringLength(50)]
        public string MaDuong { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? NgayCapNhat { get; set; }

        [StringLength(20)]
        public string NguoiCapNhat { get; set; }

        public DbGeometry SHAPE { get; set; }
    }
}
