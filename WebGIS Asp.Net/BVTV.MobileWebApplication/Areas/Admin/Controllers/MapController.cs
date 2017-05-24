using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BVTV.MobileWebApplication.Areas.Admin.Controllers
{
    [Authorize]
    public class MapController : Controller
    {
        // GET: Admin/Map
        public ActionResult Index()
        {
            return View();
        }
    }
}