namespace WebApplicationIdentity.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("GIONGCAYTRONG")]
    public partial class GIONGCAYTRONG
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int OBJECTID { get; set; }

        [StringLength(50)]
        public string MaGiongCayTrong { get; set; }

        [StringLength(50)]
        public string LoaiCayTrong { get; set; }

        [Column("GiongCayTrong")]
        [StringLength(50)]
        public string GiongCayTrong1 { get; set; }
    }
}
