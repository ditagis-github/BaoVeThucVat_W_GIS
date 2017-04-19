namespace WebApplicationIdentity.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("CONDUONG")]
    public partial class CONDUONG
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int OID { get; set; }

        [StringLength(255)]
        public string MaConDuong { get; set; }

        [StringLength(255)]
        public string TenConDuong { get; set; }
    }
}
