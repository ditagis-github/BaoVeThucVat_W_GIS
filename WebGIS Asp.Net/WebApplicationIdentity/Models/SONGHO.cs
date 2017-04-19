namespace WebApplicationIdentity.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("SONGHO")]
    public partial class SONGHO
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

        public short loaiTrangThaiNuocMat { get; set; }

        [StringLength(150)]
        public string danhTuChung { get; set; }

        [StringLength(150)]
        public string diaDanh { get; set; }

        [StringLength(10)]
        public string MaHuyenTP { get; set; }

        public DbGeometry Shape { get; set; }
    }
}
