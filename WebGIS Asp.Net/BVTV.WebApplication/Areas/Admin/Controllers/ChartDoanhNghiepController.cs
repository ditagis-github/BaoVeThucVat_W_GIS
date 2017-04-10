using BVTV.Entity;
using BVTV.WebApplication.Areas.Admin.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using System;

namespace BVTV.WebApplication.Areas.Admin.Controllers
{
    public class ChartDoanhNghiepController : Controller,IChartJson
    {
        private BaoVeThucVatEntities db = new BaoVeThucVatEntities();
        // GET: Admin/ChartDoanhNghiep
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult GetAll()
        {
            //use linq for get list data doanhnghiep with EntityFramework,
            //after set Data Property and Label Property, its provider for jquery getJson for drawChart
            var datas = from dn in db.DOANHNGHIEPs.ToList()
                        select new
                        {
                            Data = dn.SoLanViPham,
                            Label = dn.NguoiDaiDienDoanhNghiep
                        };

            return Json(datas, JsonRequestBehavior.AllowGet);
        }
    }
}