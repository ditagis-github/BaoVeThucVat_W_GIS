using System;
using System.ComponentModel;

namespace BVTV.WebApplication.Models
{
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
        public Nullable<int> GiaiDoanSinhTruong { get; set; }
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