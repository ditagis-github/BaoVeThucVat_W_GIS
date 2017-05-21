using System;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web.Mvc;
using BVTV.Entity;
using BVTV.WebApplication.Areas.Admin.Interfaces;

namespace BVTV.WebApplication.Areas.Admin.Controllers
{
    public class SauBenhController : Controller,IChartJson,IFeatureLayerController
    {
        private BaoVeThucVatEntities db = new BaoVeThucVatEntities();

        // GET: Admin/SauBenh
        [Authorize(Roles = "admin,updater,tester")]
        public ActionResult Index()
        {
            return View(db.SAUBENHs.ToList());
        }
        // GET: Admin/SauBenh/Map
        [Authorize(Roles = "admin,updater,tester")]
        public ActionResult Map()
        {
            return View();
        }

        // GET: Admin/SauBenh/Details/5
        [Authorize(Roles = "admin,updater")]
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            SAUBENH sAUBENH = db.SAUBENHs.Find(id);
            if (sAUBENH == null)
            {
                return HttpNotFound();
            }
            return View(sAUBENH);
        }

        // GET: Admin/SauBenh/Edit/5
        [Authorize(Roles = "admin,updater")]
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            SAUBENH sAUBENH = db.SAUBENHs.Find(id);
            if (sAUBENH == null)
            {
                return HttpNotFound();
            }
            return View(sAUBENH);
        }

        // POST: Admin/SauBenh/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [Authorize(Roles = "admin,updater")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "OBJECTID,NhomCayTrong,LoaiCayTrong,TenSauBenhGayHai,MatDoSauBenhGayHai,PhamViAnhHuong,MucDoAnhHuong,ThoiGianGayHai,CapDoGayHai,TinhHinhKiemSoatDichBenh,MucDoKiemSoat,BienPhapXuLy,DienTich,MaHuyenTP,GiaiDoanSinhTruong,NgayCapNhat,NguoiCapNhat,MaSauBenh,SHAPE")] SAUBENH sAUBENH)
        {
            if (ModelState.IsValid)
            {
                db.Entry(sAUBENH).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(sAUBENH);
        }

        // GET: Admin/SauBenh/Delete/5
        [Authorize(Roles = "admin,updater")]
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            SAUBENH sAUBENH = db.SAUBENHs.Find(id);
            if (sAUBENH == null)
            {
                return HttpNotFound();
            }
            return View(sAUBENH);
        }

        // POST: Admin/SauBenh/Delete/5
        [Authorize(Roles = "admin,updater")]
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            SAUBENH sAUBENH = db.SAUBENHs.Find(id);
            db.SAUBENHs.Remove(sAUBENH);
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
            var query = from nct in db.NhomCayTrongs
                        select new
                        {
                            Count = from tt in db.TRONGTROTs
                                    where nct.id.Equals(tt.NhomCayTrong.Value)
                                    select tt.OBJECTID
                        };

            return Json(query.ToList(), JsonRequestBehavior.AllowGet);
        }
        [Authorize(Roles = "admin,updater,tester")]
        public ActionResult Chart()
        {
            return View();
        }

        public ActionResult Create()
        {
            throw new NotImplementedException();
        }

        public ActionResult Search()
        {
            throw new NotImplementedException();
        }
    }
}
