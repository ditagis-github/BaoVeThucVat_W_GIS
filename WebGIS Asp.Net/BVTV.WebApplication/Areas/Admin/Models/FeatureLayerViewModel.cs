using BVTV.Entity;
using System;
using System.ComponentModel;

namespace BVTV.WebApplication.Areas.Admin.Models
{
    public class DoanhNghiep
    {
        public int ObjectID { get; set; }
        [DisplayName("Mã")]
        public string MaDoanhNghiep { get; set; }
        [DisplayName("Tên")]
        public string NguoiDaiDienDoanhNghiep { get; set; }
        [DisplayName("Địa chỉ")]
        public string SoNha { get; set; }
        public string TenDuong { get; set; }
        public string MaPhuongXa { get; set; }
        public string MaHuyenTP { get; set; }
        public string Website { get; set; }
        [DisplayName("Địa chỉ kho")]
        public string DiaChiKho { get; set; }
        [DisplayName("Tên cán bộ phụ trách")]
        public string TenCBPhuTrach { get; set; }
        public string Email { get; set; }
        [DisplayName("Loại đơn vị SXKD")]
        public Nullable<short> LoaiDonViSXKD { get; set; }
        [DisplayName("Danh mục sản phẩm")]
        public Nullable<short> DanhMucSanPham { get; set; }
        [DisplayName("Giấy phép SXKD")]
        public byte[] GiayPhepSXKD { get; set; }
        [DisplayName("Sản lượng trong năm")]
        public Nullable<short> SanLuongTrongNam { get; set; }
        [DisplayName("Giấy chứng nhận")]
        public byte[] GiayCNDuDieuKienSXKD { get; set; }
        [DisplayName("Đánh giá xếp loại")]
        public Nullable<short> DanhGiaXepLoai { get; set; }
        [DisplayName("Thời gian thanh tra")]
        public Nullable<System.DateTime> ThoiGianThanhTra { get; set; }
        [DisplayName("Nguyên nhân thanh tra")]
        public Nullable<short> NguyenNhanThanhTra { get; set; }
        [DisplayName("Hình thức phạt")]
        public Nullable<short> HinhThucPhat { get; set; }
        [DisplayName("Mức phạt")]
        public Nullable<short> MucPhat { get; set; }
        public string MaHoSoLuuTru { get; set; }
        public Nullable<short> SoLanViPham { get; set; }
        [DisplayName("Số điện thoại")]
        public string DienThoai { get; set; }
        public string Fax { get; set; }
        public Nullable<System.DateTime> NgayCapNhat { get; set; }
        [DisplayName("Người cập nhật")]
        public string NguoiCapNhat { get; set; }
        public System.Data.Entity.Spatial.DbGeometry SHAPE { get; set; }
        [DisplayName("Tên đơn vị")]
        public string TenDonViDoanhNghiep { get; set; }
        public DoanhNghiep(BVTV.Entity.DOANHNGHIEP obj)
        {
            this.DanhGiaXepLoai = obj.DanhGiaXepLoai;
            this.DanhMucSanPham = obj.DanhMucSanPham;
            this.DiaChiKho = obj.DiaChiKho;
            this.DienThoai = obj.DienThoai;
            this.Email = obj.Email;
            this.Fax = obj.Fax;
            this.GiayCNDuDieuKienSXKD = obj.GiayCNDuDieuKienSXKD;
            this.GiayPhepSXKD = obj.GiayPhepSXKD;
            this.HinhThucPhat = obj.HinhThucPhat;
            this.LoaiDonViSXKD = obj.LoaiDonViSXKD;
            this.MaDoanhNghiep = obj.MaDoanhNghiep;
            this.MaHoSoLuuTru = obj.MaHoSoLuuTru;
            this.MaHuyenTP = obj.MaHuyenTP;
            this.MaPhuongXa = obj.MaPhuongXa;
            this.MucPhat = obj.MucPhat;
            this.NgayCapNhat = obj.NgayCapNhat;
            this.NguoiCapNhat = obj.NguoiCapNhat;
            this.NguoiDaiDienDoanhNghiep = obj.NguoiDaiDienDoanhNghiep;
            this.NguyenNhanThanhTra = obj.NguyenNhanThanhTra;
            this.ObjectID = obj.OBJECTID;
            this.SanLuongTrongNam = obj.SanLuongTrongNam;
            this.SHAPE = obj.SHAPE;
            this.SoLanViPham = obj.SoLanViPham;
            this.SoNha = obj.SoNha;
            this.TenCBPhuTrach = obj.TenCBPhuTrach;
            this.TenDonViDoanhNghiep = obj.TenDonViDoanhNghiep;
            this.TenDuong = obj.TenDuong;
            this.ThoiGianThanhTra = obj.ThoiGianThanhTra;
            this.Website = obj.Website;
        }
    }
    public partial class SauBenh
    {
        public int OBJECTID { get; set; }
        [DisplayName("Nhóm cây trồng")]
        public Nullable<short> NhomCayTrong { get; set; }
        [DisplayName("Loại cây trồng")]
        public string LoaiCayTrong { get; set; }
        [DisplayName("Tên sâu bệnh gây hại")]
        public string TenSauBenhGayHai { get; set; }
        [DisplayName("Mật độ sâu bệnh gây hại")]
        public Nullable<short> MatDoSauBenhGayHai { get; set; }
        [DisplayName("Phạm vi ảnh ưởng")]
        public Nullable<short> PhamViAnhHuong { get; set; }
        [DisplayName("Mức độ ảnh hưởng")]
        public Nullable<short> MucDoAnhHuong { get; set; }
        [DisplayName("Thời gian gây hại")]
        public Nullable<short> ThoiGianGayHai { get; set; }
        [DisplayName("Cấp độ gây hại")]
        public Nullable<short> CapDoGayHai { get; set; }
        [DisplayName("Tình hình kiểm soát dịch bệnh")]
        public Nullable<short> TinhHinhKiemSoatDichBenh { get; set; }
        [DisplayName("Mức độ kiểm soát")]
        public Nullable<short> MucDoKiemSoat { get; set; }
        [DisplayName("Biện pháp xử lý")]
        public string BienPhapXuLy { get; set; }
        [DisplayName("Diện tích")]
        public Nullable<decimal> DienTich { get; set; }
        [DisplayName("Huyện/TP")]
        public string MaHuyenTP { get; set; }
        [DisplayName("Giai đoạn sinh trưởng")]
        public string GiaiDoanSinhTruong { get; set; }
        [DisplayName("Ngày cập nhật")]
        public Nullable<System.DateTime> NgayCapNhat { get; set; }
        [DisplayName("Người cập nhật")]
        public string NguoiCapNhat { get; set; }
        [DisplayName("Mã sâu bệnh")]
        public string MaSauBenh { get; set; }

        public System.Data.Entity.Spatial.DbGeometry SHAPE { get; set; }

        public SauBenh(BVTV.Entity.SAUBENH obj)
        {
            this.BienPhapXuLy = obj.BienPhapXuLy;
            this.CapDoGayHai = obj.CapDoGayHai;
            this.DienTich = obj.DienTich;
            this.GiaiDoanSinhTruong = obj.GiaiDoanSinhTruong;
            this.LoaiCayTrong = obj.LoaiCayTrong;
            this.MaHuyenTP = obj.MaHuyenTP;
            this.MaSauBenh = obj.MaSauBenh;
            this.MatDoSauBenhGayHai = obj.MatDoSauBenhGayHai;
            this.MucDoAnhHuong = obj.MucDoAnhHuong;
            this.MucDoKiemSoat = obj.MucDoKiemSoat;
            this.NgayCapNhat = obj.NgayCapNhat;
            this.NguoiCapNhat = obj.NguoiCapNhat;
            this.NhomCayTrong = obj.NhomCayTrong;
            this.OBJECTID = obj.OBJECTID;
            this.PhamViAnhHuong = obj.PhamViAnhHuong;
            this.SHAPE = obj.SHAPE;
            this.TenSauBenhGayHai = obj.TenSauBenhGayHai;
            this.ThoiGianGayHai = obj.ThoiGianGayHai;
            this.TinhHinhKiemSoatDichBenh = obj.TinhHinhKiemSoatDichBenh;
        }
    }
}