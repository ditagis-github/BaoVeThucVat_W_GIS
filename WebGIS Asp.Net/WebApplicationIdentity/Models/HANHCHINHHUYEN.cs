namespace WebApplicationIdentity.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("HANHCHINHHUYEN")]
    public partial class HANHCHINHHUYEN
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int OBJECTID { get; set; }

        [StringLength(100)]
        public string TenHuyen { get; set; }

        [StringLength(10)]
        public string MaHuyenTP { get; set; }

        public DbGeometry SHAPE { get; set; }
    }
}
