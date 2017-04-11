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
    public class DoanhNghiepController : Controller
    {
        private BaoVeThucVatEntities db = new BaoVeThucVatEntities();

        // GET: Admin/DoanhNghiep
        public ActionResult Index()
        {
            return View(db.DOANHNGHIEPs.ToList());
        }

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

        // GET: Admin/DoanhNghiep/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Admin/DoanhNghiep/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
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
        public ActionResult GetById(int id)
        {
            try
            {
                var dn = db.DOANHNGHIEPs.Find(id);
                if (dn != null)
                {
                    var data = new
                    {
                        MaDoanhNghiep = dn.MaDoanhNghiep,
                        Ten = dn.TenDonViDoanhNghiep,
                        DiaChi = dn.SoNha,
                        SoLanViPham = dn.SoLanViPham,
                        SanLuong = dn.SanLuongTrongNam,
                        NguoiCapNhat = dn.NguoiCapNhat,
                        MucPhat = dn.MucPhat
                    };
                    return Json(data, JsonRequestBehavior.AllowGet);
                }
                return null;

            }
            catch (Exception ex)
            {
                return View("Index");
            }
        }
    }
}
