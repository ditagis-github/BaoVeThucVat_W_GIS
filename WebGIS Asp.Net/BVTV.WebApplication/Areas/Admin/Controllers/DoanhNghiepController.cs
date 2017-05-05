using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using BVTV.Entity;
using BVTV.WebApplication.Areas.Admin.Interfaces;
using BVTV.WebApplication.Areas.Admin.Models;

namespace BVTV.WebApplication.Areas.Admin.Controllers
{
   [Authorize]
    public class DoanhNghiepController : Controller,IChartJson,IFeatureLayerController
    {
        private BaoVeThucVatEntities db = new BaoVeThucVatEntities();
        [Authorize(Roles = "admin,updater,testerandupdater,tester")]
        // GET: Admin/DoanhNghiep
        public ActionResult Index()
        {
            return View(db.DOANHNGHIEPs.ToList());
        }
        // GET: Admin/DoanhNghiep/Map
        [Authorize(Roles = "admin,updater,testerandupdater,tester")]
        public ActionResult Map()
        {
            return View();
        }
        // GET: Admin/DoanhNghiep/Details/5
        [Authorize(Roles = "admin,updater,testerandupdater")]
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            DOANHNGHIEP dOANHNGHIEP = db.DOANHNGHIEPs.Find(id);
            if (dOANHNGHIEP == null)
            {
                return HttpNotFound();
            }
            ViewBag.Heading = "Chi tiết " + dOANHNGHIEP.OBJECTID;
            return View(dOANHNGHIEP);
        }
        
        // GET: Admin/DoanhNghiep/Create
        [Authorize(Roles = "admin,updater,testerandupdater")]
        public ActionResult Create()
        {
            return View();
        }


        // GET: Admin/DoanhNghiep/Edit/5
        [Authorize(Roles = "admin,updater,testerandupdater")]
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            DOANHNGHIEP dOANHNGHIEP = db.DOANHNGHIEPs.Find(id);
            if (dOANHNGHIEP == null)
            {
                return HttpNotFound();
            }
            return View(dOANHNGHIEP);
        }

        // POST: Admin/DoanhNghiep/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [Authorize(Roles = "admin,updater,testerandupdater")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "MaDoanhNghiep,NguoiDaiDienDoanhNghiep,SoNha,TenDuong,PhuongXa,QuanHuyen,Website,DiaChiKho,TenCBPhuTrach,DienThoai,Fax,Email,LoaiDonViSXKD,DanhMucSanPham,GiayPhepSXKD,SanLuongTrongNam,GiayCNDuDieuKienSXKD,DanhGiaXepLoai,ThoiGianThanhTra,NguyenNhanThanhTra,HinhThucPhat,MucPhat,MaHoSoLuuTru,SoLanViPham")] DOANHNGHIEP dOANHNGHIEP)
        {
            if (ModelState.IsValid)
            {
                db.Entry(dOANHNGHIEP).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(dOANHNGHIEP);
        }

        // GET: Admin/DoanhNghiep/Delete/5
        [Authorize(Roles = "admin,updater,testerandupdater")]
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            DOANHNGHIEP dOANHNGHIEP = db.DOANHNGHIEPs.Find(id);
            if (dOANHNGHIEP == null)
            {
                return HttpNotFound();
            }
            return View(dOANHNGHIEP);
        }

        // POST: Admin/DoanhNghiep/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "admin,updater,testerandupdater")]
        public ActionResult DeleteConfirmed(int id)
        {
            DOANHNGHIEP dOANHNGHIEP = db.DOANHNGHIEPs.Find(id);
            db.DOANHNGHIEPs.Remove(dOANHNGHIEP);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
       
        [AllowAnonymous]
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

        [Authorize]
        public ActionResult Chart()
        {
            return View();
        }

        [Authorize]
        public ActionResult Search()
        {
            return null;
        }

    }
}
