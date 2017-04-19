//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace BVTV.Entity
{
    using System;
    using System.Collections.Generic;
    
    public partial class SDE_layers
    {
        public int layer_id { get; set; }
        public string description { get; set; }
        public string database_name { get; set; }
        public string table_name { get; set; }
        public string owner { get; set; }
        public string spatial_column { get; set; }
        public int eflags { get; set; }
        public int layer_mask { get; set; }
        public double gsize1 { get; set; }
        public double gsize2 { get; set; }
        public double gsize3 { get; set; }
        public double minx { get; set; }
        public double miny { get; set; }
        public double maxx { get; set; }
        public double maxy { get; set; }
        public Nullable<double> minz { get; set; }
        public Nullable<double> maxz { get; set; }
        public Nullable<double> minm { get; set; }
        public Nullable<double> maxm { get; set; }
        public int cdate { get; set; }
        public string layer_config { get; set; }
        public Nullable<int> optimal_array_size { get; set; }
        public Nullable<int> stats_date { get; set; }
        public Nullable<int> minimum_id { get; set; }
        public int srid { get; set; }
        public int base_layer_id { get; set; }
        public Nullable<int> secondary_srid { get; set; }
    
        public virtual SDE_spatial_references SDE_spatial_references { get; set; }
        public virtual SDE_spatial_references SDE_spatial_references1 { get; set; }
    }
}
