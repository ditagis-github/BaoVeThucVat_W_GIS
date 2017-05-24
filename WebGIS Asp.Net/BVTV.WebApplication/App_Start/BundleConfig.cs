using System.Web;
using System.Web.Optimization;

namespace BVTV.WebApplication
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            //bundles.UseCdn = true;
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.js",
                      "~/Scripts/respond.js"));

            bundles.Add(new ScriptBundle("~/js/hifugreen").Include(
                      "~/Scripts/hifugreen/plugins.js",
                      "~/Scripts/hifugreen/main.js"
                      ));
            bundles.Add(new ScriptBundle("~/js/map").Include(
               "~/Scripts/map/map.js"));
            bundles.Add(new ScriptBundle("~/js/map/admin").Include(
                "~/Scripts/map/dtg.3.4.arcgis.widget.SauBenhMode.js",
                "~/Scripts/map/dtg.3.4.arcgis.widget.FeatureTableUI.js",
                "~/Scripts/map/map-admin.js"));

            bundles.Add(new ScriptBundle("~/js/lumino").Include(
                "~/Scripts/jquery-{version}.js",
                      "~/Scripts/bootstrap.min.js",
                      "~/Content/lumino/js/bootstrap-datepicker.js",
                      "~/Content/lumino/js/lumino.js"
                      ));
            bundles.Add(new ScriptBundle("~/js/lumino/chart").Include(
                "~/Content/lumino/js/chart.min.js",
                      "~/Content/lumino/js/chart-data.js",
                      "~/Content/lumino/js/easypiechart.js",
                      "~/Content/lumino/js/easypiechart-data.js"
                      ));
            bundles.Add(new ScriptBundle("~/js/chartjs").Include(
                        "~/Scripts/chartjs/chart.js"));

            bundles.Add(new ScriptBundle("~/js/bootstrap-table").Include(
               "~/Scripts/bootstrap-table.min.js",
               "~/Scripts/tableExport.js",
               "~/Scripts/jquery.base64.js",
               "~/Scripts/bootstrap-table-export.js",
               "~/Scripts/jspdf.min.js",
               "~/Scripts/xlsx.core.min.js",
               "~/Scripts/bootstrap-table-detail.js"
               ));


            bundles.Add(new StyleBundle("~/css/lumino").Include(
                      "~/Content/bootstrap.min.css",
                      "~/Content/lumino/css/datepicker3.css",
                      "~/Content/lumino/css/admin.css"
                      ));
            bundles.Add(new StyleBundle("~/Content/map").Include(
                      "~/Content/esri.css"));

            bundles.Add(new StyleBundle("~/css/hifugreen").Include(
                    "~/Content/bootstrap.min.css",
                    "~/Content/hifugreen/css/hifugreen.css"
                    ));

        }
    }
}
