using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using BVTV.Entity;
using System.Web.Security;
using Microsoft.AspNet.Identity;
using BVTV.WebApplication.Areas.Admin.Interfaces;

namespace BVTV.WebApplication.Areas.Admin.Controllers
{
    [Authorize]
    public class TrongTrotController : Controller,IChartJson
    {
        private BaoVeThucVatEntities db = new BaoVeThucVatEntities();
        [Authorize(Roles = "Admin,Mod")]
        // GET: Admin/TrongTrot
        public ActionResult Index()
        {
            var data = db.TRONGTROTs.ToList();
            if (!User.IsInRole("Admin") && !User.IsInRole("Mod")) {
                var roles = Roles.GetRolesForUser(User.Identity.Name);
                var qr = from tt in db.TRONGTROTs
                         from rl in roles
                         where tt.MaHuyenTP.Equals(rl)
                         select tt;
                data = qr.ToList();
            }
            return View(data);
        }
        [Authorize(Roles = "Admin,Mod")]
        // GET: Admin/TrongTrot
        public ActionResult Map()
        {
            return View();
        }
        [Authorize(Roles = "Admin,Mod")]
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
        [Authorize(Roles = "Admin,Mod")]
        [Authorize(Roles = "Admin,Mod")]
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
        [Authorize(Roles = "Admin,Mod")]
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
        [Authorize(Roles = "Admin,Mod")]
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
        [Authorize(Roles = "Admin,Mod")]
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

        public ActionResult GetAll()
        {
            return Json(new object());
        }
    }
}
