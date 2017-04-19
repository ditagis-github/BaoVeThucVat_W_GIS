namespace WebApplicationIdentity.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("SAUBENHGAYHAI")]
    public partial class SAUBENHGAYHAI
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int OBJECTID { get; set; }

        [StringLength(50)]
        public string MaSauBenh { get; set; }

        public short? NhomCayTrong { get; set; }

        [StringLength(50)]
        public string LoaiCayTrong { get; set; }

        [Column("SauBenhGayHai")]
        [StringLength(50)]
        public string SauBenhGayHai1 { get; set; }

        public short? Thang { get; set; }

        public short? Nam { get; set; }
    }
}
