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
            bundles.Add(new ScriptBundle("~/bundles/map").Include(
                "~/Scripts/Map/search-feature.js",
                      "~/Scripts/Map/map.js"
                      ));

            bundles.Add(new ScriptBundle("~/js/lumino").Include(
                "~/Scripts/jquery-{version}.js",
                      "~/Scripts/bootstrap.min.js",
                      "~/Content/lumino/js/bootstrap-datepicker.js"
                      ));
            bundles.Add(new ScriptBundle("~/js/lumino/chart").Include(
                "~/Content/lumino/js/chart.min.js",
                      "~/Content/lumino/js/chart-data.js",
                      "~/Content/lumino/js/easypiechart.js",
                      "~/Content/lumino/js/easypiechart-data.js"
                      ));



            bundles.Add(new StyleBundle("~/css/lumino").Include(
                      "~/Content/bootstrap.min.css",
                      "~/Content/material-design-iconic-font.min.css",
                      "~/Content/lumino/css/datepicker3.css",
                      "~/Content/lumino/css/styles.css"
                      ));
            bundles.Add(new StyleBundle("~/Content/map").Include(
                      "~/Content/esri.css"));
            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.min.css",
                      "~/Content/site.css"));

            bundles.Add(new StyleBundle("~/css/hifugreen").Include(
                    "~/Content/bootstrap.min.css",
                    "~/Content/material-design-iconic-font.min.css",
                    "~/Content/font-awesome.min.css",
                    "~/Content/hifugreen/css/style.css"

                    ));

        }
    }
}
