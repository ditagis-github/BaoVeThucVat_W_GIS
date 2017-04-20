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
    public class DoanhNghiepController : Controller,IChartJson
    {
        private BaoVeThucVatEntities db = new BaoVeThucVatEntities();
        [Authorize(Roles = "Admin,Mod")]
        // GET: Admin/DoanhNghiep
        public ActionResult Index()
        {
            var datas = from sb in db.DOANHNGHIEPs.ToList()
                        select new DoanhNghiep(sb);
            return View(datas.ToList());
        }
        [Authorize(Roles = "Admin,Mod")]
        // GET: Admin/DoanhNghiep/Map
        public ActionResult Map()
        {
            return View();
        }
        [Authorize(Roles = "Admin,Mod")]
        // GET: Admin/DoanhNghiep/Details/5
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
        [Authorize(Roles = "Admin,Mod")]
        // GET: Admin/DoanhNghiep/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Admin/DoanhNghiep/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [Authorize(Roles = "Admin,Mod")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "OBJECTID,MaDoanhNghiep,NguoiDaiDienDoanhNghiep,SoNha,TenDuong,PhuongXa,QuanHuyen,Website,DiaChiKho,TenCBPhuTrach,DienThoai,Fax,Email,LoaiDonViSXKD,DanhMucSanPham,GiayPhepSXKD,SanLuongTrongNam,GiayCNDuDieuKienSXKD,DanhGiaXepLoai,ThoiGianThanhTra,NguyenNhanThanhTra,HinhThucPhat,MucPhat,MaHoSoLuuTru,SoLanViPham,SHAPE")] DOANHNGHIEP dOANHNGHIEP)
        {
            if (ModelState.IsValid)
            {
                db.DOANHNGHIEPs.Add(dOANHNGHIEP);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(dOANHNGHIEP);
        }

        // GET: Admin/DoanhNghiep/Edit/5
        [Authorize(Roles = "Admin,Mod")]
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
        [Authorize(Roles = "Admin,Mod")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "OBJECTID,MaDoanhNghiep,NguoiDaiDienDoanhNghiep,SoNha,TenDuong,PhuongXa,QuanHuyen,Website,DiaChiKho,TenCBPhuTrach,DienThoai,Fax,Email,LoaiDonViSXKD,DanhMucSanPham,GiayPhepSXKD,SanLuongTrongNam,GiayCNDuDieuKienSXKD,DanhGiaXepLoai,ThoiGianThanhTra,NguyenNhanThanhTra,HinhThucPhat,MucPhat,MaHoSoLuuTru,SoLanViPham,SHAPE")] DOANHNGHIEP dOANHNGHIEP)
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
        [Authorize(Roles = "Admin,Mod")]
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
        [Authorize(Roles = "Admin,Mod")]
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
        /// <summary>
        /// Dùng hiển thị biểu đồ mặc định để chartjs dùng ajax load dữ liệu
        /// </summary>
        /// <returns>Dữ liệu Json chứa Data và Label</returns>
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
        public ActionResult Chart()
        {
            return View();
        }
    }
}
