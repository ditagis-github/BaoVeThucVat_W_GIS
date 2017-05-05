using BVTV.Entity;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BVTV.WebApplication.Areas.Admin.Controllers
{
    public class DashBoard
    {
        [DisplayName("Doanh nghiệp")]
        public int DoanhNghiepCount { get; set; }
        [DisplayName("Sâu bệnh")]
        public int SauBenhCount { get; set; }
        [DisplayName("Thành viên")]
        public int MemberCount { get; set; }
        [DisplayName("Đất trồng")]
        public int DatTrongCount { get; set; }
    }
    [Authorize]
    public class HomeController : Controller
    {
        private BaoVeThucVatEntities db = new BaoVeThucVatEntities();
        // GET: Admin/Home
        public ActionResult Index()
        {
            var md = new DashBoard
            {
                DatTrongCount = db.TRONGTROTs.Count(),
                DoanhNghiepCount = db.DOANHNGHIEPs.Count(),
                MemberCount = db.AspNetUsers.Count(),
                SauBenhCount = db.SAUBENHs.Count()
            };
            ViewBag.QuanHuyen = from qh in db.HANHCHINHHUYENs
                                select new SelectListItem
                                {
                                    Text = qh.TenHuyen,
                                    Value = qh.MaHuyenTP
                                };
            return View(md);
        }
       
        [ChildActionOnly]
        public PartialViewResult GetRightMenu()
        {
            return PartialView("~/Areas/Admin/Views/Shared/RightMenu");
        }
    }
}