namespace WebApplicationIdentity.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("PHUBEMAT")]
    public partial class PHUBEMAT
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int OBJECTID { get; set; }

        [StringLength(255)]
        public string maNhanDang { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? ngayThuNhan { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? ngayCapNhat { get; set; }

        [StringLength(255)]
        public string maDoiTuong { get; set; }

        [StringLength(255)]
        public string ten { get; set; }

        public int? loaiPhuBeMat { get; set; }

        public short? doiTuong { get; set; }

        [StringLength(50)]
        public string ghichu { get; set; }

        [StringLength(10)]
        public string MaHuyenTP { get; set; }

        public DbGeometry SHAPE { get; set; }
    }
}
