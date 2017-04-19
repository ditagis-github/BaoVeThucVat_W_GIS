namespace WebApplicationIdentity.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("TIMDUONG")]
    public partial class TIMDUONG
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int OBJECTID { get; set; }

        [Required]
        [StringLength(16)]
        public string maNhanDang { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime ngayThuNhan { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? ngayCapNhat { get; set; }

        [Required]
        [StringLength(4)]
        public string maDoiTuong { get; set; }

        public short loaiDuongBo { get; set; }

        public short loaiChatLieuTraiMat { get; set; }

        public short loaiHienTrangSuDung { get; set; }

        public short loaiKetCau { get; set; }

        [Column(TypeName = "numeric")]
        public decimal doRong { get; set; }

        [StringLength(150)]
        public string ten { get; set; }

        [StringLength(150)]
        public string tenTuyen1 { get; set; }

        [StringLength(150)]
        public string tenTuyen2 { get; set; }

        [StringLength(150)]
        public string tenTuyen3 { get; set; }

        [StringLength(10)]
        public string MaHuyenTP { get; set; }

        public DbGeometry SHAPE { get; set; }
    }
}
