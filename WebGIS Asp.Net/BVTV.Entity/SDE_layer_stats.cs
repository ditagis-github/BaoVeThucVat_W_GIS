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
    
    public partial class SDE_layer_stats
    {
        public int oid { get; set; }
        public int layer_id { get; set; }
        public Nullable<int> version_id { get; set; }
        public double minx { get; set; }
        public double miny { get; set; }
        public double maxx { get; set; }
        public double maxy { get; set; }
        public Nullable<double> minz { get; set; }
        public Nullable<double> minm { get; set; }
        public Nullable<double> maxz { get; set; }
        public Nullable<double> maxm { get; set; }
        public int total_features { get; set; }
        public int total_points { get; set; }
        public System.DateTime last_analyzed { get; set; }
    
        public virtual SDE_versions SDE_versions { get; set; }
    }
}
