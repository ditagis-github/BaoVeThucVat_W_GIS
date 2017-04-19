namespace WebApplicationIdentity.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Table("DanhMucCayTrongRauMau")]
    public partial class DanhMucCayTrongRauMau
    {
        [StringLength(5)]
        public string id { get; set; }

        [StringLength(50)]
        public string name { get; set; }
    }
}
