namespace WebApplicationIdentity.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class GIAPHANBON_THUOCBVTT_NONGSAN_GIONG
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int OBJECTID { get; set; }

        public short? NhomGia { get; set; }

        public short? TenDoiTuong { get; set; }

        [StringLength(50)]
        public string Gia { get; set; }

        [StringLength(50)]
        public string MaDoiTuong { get; set; }
    }
}
