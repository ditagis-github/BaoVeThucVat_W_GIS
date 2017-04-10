using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BVTV.WebApplication.Areas.Admin.Controllers
{
    public class HomeController : Controller
    {
        // GET: Admin/Home
        public ActionResult Index()
        {
            return View();
        }
        [ChildActionOnly]
        public PartialViewResult GetRightMenu()
        {
            return PartialView("~/Areas/Admin/Views/Shared/RightMenu");
        }
    }
}