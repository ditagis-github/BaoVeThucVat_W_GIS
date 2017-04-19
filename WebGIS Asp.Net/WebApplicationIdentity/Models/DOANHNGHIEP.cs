namespace WebApplicationIdentity.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("DOANHNGHIEP")]
    public partial class DOANHNGHIEP
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int OBJECTID { get; set; }

        [StringLength(20)]
        public string MaDoanhNghiep { get; set; }

        [StringLength(50)]
        public string NguoiDaiDienDoanhNghiep { get; set; }

        [StringLength(150)]
        public string SoNha { get; set; }

        [StringLength(50)]
        public string TenDuong { get; set; }

        [StringLength(50)]
        public string MaPhuongXa { get; set; }

        [StringLength(50)]
        public string MaHuyenTP { get; set; }

        [StringLength(50)]
        public string Website { get; set; }

        [StringLength(200)]
        public string DiaChiKho { get; set; }

        [StringLength(50)]
        public string TenCBPhuTrach { get; set; }

        [StringLength(50)]
        public string Email { get; set; }

        public short? LoaiDonViSXKD { get; set; }

        public short? DanhMucSanPham { get; set; }

        public byte[] GiayPhepSXKD { get; set; }

        public short? SanLuongTrongNam { get; set; }

        public byte[] GiayCNDuDieuKienSXKD { get; set; }

        public short? DanhGiaXepLoai { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? ThoiGianThanhTra { get; set; }

        public short? NguyenNhanThanhTra { get; set; }

        public short? HinhThucPhat { get; set; }

        public short? MucPhat { get; set; }

        [StringLength(50)]
        public string MaHoSoLuuTru { get; set; }

        public short? SoLanViPham { get; set; }

        [StringLength(15)]
        public string DienThoai { get; set; }

        [StringLength(15)]
        public string Fax { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? NgayCapNhat { get; set; }

        [StringLength(20)]
        public string NguoiCapNhat { get; set; }

        public DbGeometry SHAPE { get; set; }

        [StringLength(200)]
        public string TenDonViDoanhNghiep { get; set; }

        public short? SanPham { get; set; }
    }
}
