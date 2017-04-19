namespace WebApplicationIdentity.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("MATDUONGBO")]
    public partial class MATDUONGBO
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

        [StringLength(4)]
        public string maDoiTuong { get; set; }

        public int? doiTuong { get; set; }

        [StringLength(10)]
        public string MaHuyenTP { get; set; }

        public DbGeometry SHAPE { get; set; }
    }
}
