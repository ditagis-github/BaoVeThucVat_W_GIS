using System.Web.Mvc;

namespace BVTV.WebApplication.Areas.Admin
{
    public class AdminAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "Admin";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "Admin_default",
                "Admin/{controller}/{action}/{id}",
                new { action = "Index", controller="Home",id = UrlParameter.Optional },
                namespaces: new[] { "BVTV.WebApplication.Areas.Admin.Controllers" }
            );
            context.MapRoute(
              "Chart",
              "Admin/{controller}/{action}/{thang}/{nam}",
              new { action = "Chart", controller = "TrongTrot", thang = UrlParameter.Optional,nam=UrlParameter.Optional },
              namespaces: new[] { "BVTV.WebApplication.Areas.Admin.Controllers" }
          );
        }
    }
}