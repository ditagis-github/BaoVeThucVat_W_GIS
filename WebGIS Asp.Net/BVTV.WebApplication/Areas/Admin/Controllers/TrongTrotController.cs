using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using BVTV.Entity;

namespace BVTV.WebApplication.Areas.Admin.Controllers
{
    public class TrongTrotController : Controller
    {
        private BaoVeThucVatEntities db = new BaoVeThucVatEntities();

        // GET: Admin/TrongTrot
        public ActionResult Index()
        {
            
            return View(db.TRONGTROTs.Take(100).ToList());
        }

        // GET: Admin/TrongTrot/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            TRONGTROT tRONGTROT = db.TRONGTROTs.Find(id);
            if (tRONGTROT == null)
            {
                return HttpNotFound();
            }
            return View(tRONGTROT);
        }

        // GET: Admin/TrongTrot/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Admin/TrongTrot/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "OBJECTID,MaDoiTuong,NhomCayTrong,LoaiCayTrong,DienTichTrong,TinhHinhUngDungCongNghe,ToChucCaNhanQuanLy,TinhTrangThuHoach,GhiChu,MaLoaiCayTrong,PhuongThucTrong,ThoiVuTrongTrot,MatDoCayTrong,TenGiongCayTrong,MaHuyenTP,GiaiDoanSinhTruong,MaDuong,NgayCapNhat,NguoiCapNhat,SHAPE")] TRONGTROT tRONGTROT)
        {
            if (ModelState.IsValid)
            {
                db.TRONGTROTs.Add(tRONGTROT);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(tRONGTROT);
        }

        // GET: Admin/TrongTrot/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            TRONGTROT tRONGTROT = db.TRONGTROTs.Find(id);
            if (tRONGTROT == null)
            {
                return HttpNotFound();
            }
            return View(tRONGTROT);
        }

        // POST: Admin/TrongTrot/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "OBJECTID,MaDoiTuong,NhomCayTrong,LoaiCayTrong,DienTichTrong,TinhHinhUngDungCongNghe,ToChucCaNhanQuanLy,TinhTrangThuHoach,GhiChu,MaLoaiCayTrong,PhuongThucTrong,ThoiVuTrongTrot,MatDoCayTrong,TenGiongCayTrong,MaHuyenTP,GiaiDoanSinhTruong,MaDuong,NgayCapNhat,NguoiCapNhat,SHAPE")] TRONGTROT tRONGTROT)
        {
            if (ModelState.IsValid)
            {
                db.Entry(tRONGTROT).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(tRONGTROT);
        }

        // GET: Admin/TrongTrot/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            TRONGTROT tRONGTROT = db.TRONGTROTs.Find(id);
            if (tRONGTROT == null)
            {
                return HttpNotFound();
            }
            return View(tRONGTROT);
        }

        // POST: Admin/TrongTrot/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            TRONGTROT tRONGTROT = db.TRONGTROTs.Find(id);
            db.TRONGTROTs.Remove(tRONGTROT);
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
    }
}
