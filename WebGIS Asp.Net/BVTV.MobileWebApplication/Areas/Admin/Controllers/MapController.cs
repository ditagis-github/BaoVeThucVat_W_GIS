using BVTV.MobileWebApplication.Models;
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
        ApplicationDbContext db = new ApplicationDbContext();
        // GET: Admin/Map
        public ActionResult Index()
        {
            return View();
        }
        [Authorize]
        public ActionResult GetRoles()
        {
            
            var query = from role in db.Users.First(f => f.UserName.Equals(User.Identity.Name)).Roles
                        select role.RoleId;
            return Json(query.ToList(), JsonRequestBehavior.AllowGet);
        }
    }

}