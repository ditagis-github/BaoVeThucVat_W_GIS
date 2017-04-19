namespace WebApplicationIdentity.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("CONGNGHECAO")]
    public partial class CONGNGHECAO
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int OBJECTID { get; set; }

        [StringLength(100)]
        public string HoVaTen { get; set; }

        [StringLength(100)]
        public string CongNgheUngDung { get; set; }

        [StringLength(20)]
        public string MaDoiTuong { get; set; }

        [StringLength(11)]
        public string SoDienThoai { get; set; }
    }
}
