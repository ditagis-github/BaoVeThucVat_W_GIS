using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web.Mvc;
using BVTV.Entity;
using System.Web.Security;
using BVTV.WebApplication.Areas.Admin.Interfaces;
using System.Collections;
using System.Collections.Generic;

namespace BVTV.WebApplication.Areas.Admin.Controllers
{
    [Authorize]
    public class TrongTrotController : Controller,IChartJson
    {
        private BaoVeThucVatEntities db = new BaoVeThucVatEntities();
        // GET: Admin/TrongTrot
        [Authorize(Roles = "admin,updater,testerandupdater,tester")]
        public ActionResult Index()
        {
            var data = db.TRONGTROTs.Take(100).ToList();
            //if (!User.IsInRole("Admin") && !User.IsInRole("Mod")) {
            //    var roles = Roles.GetRolesForUser(User.Identity.Name);
            //    var qr = from tt in db.TRONGTROTs
            //             from rl in roles
            //             where tt.MaHuyenTP.Equals(rl)
            //             select tt;
            //    data = qr.ToList();
            //}
            return View(data);
        }
        // GET: Admin/TrongTrot
        [Authorize(Roles = "admin,updater,testerandupdater,tester")]
        public ActionResult Map()
        {
            return View();
        }
        [Authorize(Roles = "admin,updater,testerandupdater")]
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
        [Authorize(Roles = "admin,updater,testerandupdater")]
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
        [Authorize(Roles = "admin,updater,testerandupdater")]
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
        [Authorize(Roles = "admin,updater,testerandupdater")]
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
        [Authorize(Roles = "admin,updater,testerandupdater")]
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

        [HttpGet]
        //public ActionResult GetAll(int ?thang)
        //{
        //    List<object> datas = new List<object>();
        //    var tts = db.THOIGIANSANXUATTRONGTROTs.Where(w => w.Thang.Value == thang );
        //    //if (thang.HasValue)
        //        tts.Where(w => w.Thang.HasValue && w.Nam.Value == 2017);
        //    foreach (var nct in db.NhomCayTrongs)
        //    {
        //        datas.Add(new
        //        {
        //            Label = nct.name,
        //            Data = tts.Where(w=>w.NhomCayTrong.Value == nct.id).Count()
        //        });
        //    }
        //    return Json(datas, JsonRequestBehavior.AllowGet);
        //}
        public ActionResult GetAll(int? thang, int? nam)
        {
            List<object> datas = new List<object>();
            var tts = db.THOIGIANSANXUATTRONGTROTs.Where(w => w.Nam.Value == nam);
            if (thang.HasValue)
                tts =tts.Where(w => w.Thang.HasValue && w.Thang.Value == thang);
            foreach (var nct in db.NhomCayTrongs)
            {
                datas.Add(new
                {
                    Label = nct.name,
                    Data = tts.Where(w => w.NhomCayTrong.Value == nct.id).Count()
                });
            }
            return Json(datas, JsonRequestBehavior.AllowGet);
        }
        
        public ActionResult GetAll()
        {
            List<object> datas = new List<object>();
            var tts = db.THOIGIANSANXUATTRONGTROTs.Where(w => w.Nam.Value == 2015);    
                   
            foreach (var nct in db.NhomCayTrongs)
            {
                datas.Add(new
                {
                    Label = nct.name + 10,
                    Data = tts.Where(w => w.NhomCayTrong.Value == nct.id).Count()
                });
            }
            return Json(datas, JsonRequestBehavior.AllowGet);
        }
        public ActionResult GetAllByPhuongThucTrong()
        {
            var ptts = (from tt in db.TRONGTROTs
                        where tt.PhuongThucTrong.HasValue
                         select tt.PhuongThucTrong.Value).Distinct();
            var datas = from ptt in ptts
                        join pttName in db.PhuongThucTrongs on ptt equals pttName.id
                        select new
                        {
                            Label = pttName.Name,
                            Data = db.TRONGTROTs.Where(w => w.PhuongThucTrong.Value.Equals(ptt)).Count()
                        };
            return Json(datas.ToList(), JsonRequestBehavior.AllowGet);
        }
        public ActionResult Chart()
        {

            ViewBag.Thang = from qh in db.THOIGIANSANXUATTRONGTROTs.Select(o => o.Thang.Value).Distinct().OrderBy(p => p)
            select new SelectListItem
                                {
                                    Text = qh.ToString(),
                                    Value = qh.ToString()
                            };

            ViewBag.Nam = from qh in db.THOIGIANSANXUATTRONGTROTs.Select(o => o.Nam.Value).Distinct().OrderBy(p => p)
                          select new SelectListItem
                            {
                                Text = qh.ToString(),
                                Value = qh.ToString()
                            };
            return View();

        }
    }
}
