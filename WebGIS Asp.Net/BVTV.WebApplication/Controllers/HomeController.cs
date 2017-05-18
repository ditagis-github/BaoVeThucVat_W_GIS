using BVTV.Entity;
using BVTV.WebApplication.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BVTV.WebApplication.Controllers
{
    public class HomeController : Controller
    {
        private BaoVeThucVatEntities db = new BaoVeThucVatEntities();
        //
        // GET: /Home/

        public ActionResult Index()
        {
            return View("Map");
        }
        public ActionResult About()
        {
            return View();
        }
        public ActionResult Contact()
        {
            return View();
        }
        public ActionResult Map()
        {
            ViewBag.QuanHuyen = from qh in db.HANHCHINHHUYENs
                                select new SelectListItem
                                {
                                    Text = qh.TenHuyen,
                                    Value = qh.MaHuyenTP
                                };
            return View();
        }
        [HttpPost]
        public ActionResult Send(Contact contact)
        {
            ModelState.AddModelError("", "Gửi liên hệ thành công ");
            return View("Contact");
        }
    }
}

