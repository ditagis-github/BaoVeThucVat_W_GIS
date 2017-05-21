using BVTV.WebApplication.Models;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;

namespace BVTV.WebApplication.Areas.Admin.Controllers
{
    [Authorize(Roles = "admin")]
    public class ManagerRoleController : Controller
    {
        ApplicationDbContext db = new ApplicationDbContext();
        // GET: Admin/ManagerRole
        public ActionResult Index()
        {
            var model = db.Roles.AsEnumerable();
            return View(model);
        }
        public ViewResult Create()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create(IdentityRole role)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    db.Roles.Add(role);
                    db.SaveChanges();
                }
                return RedirectToAction("Index");
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", ex.Message);
            }
            return View(role);
        }
        public ActionResult Delete(string Id)
        {
            var model = db.Roles.Find(Id);
            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [ActionName("Delete")]
        public ActionResult DeleteConfirmed(string Id)
        {
            IdentityRole role = null;
            try
            {
                role = db.Roles.Find(Id);
                //kiểm tra nếu như tài khoản được cấp quyền role thì thông báo lỗi không được xóa
                if (role.Users.Count > 0)
                {
                    ModelState.AddModelError("", "Không thể xóa quyền bởi vì tồn tại ít nhất một tài khoản đã được cấp quyền này");
                }
                else
                {
                    db.Roles.Remove(role);
                    db.SaveChanges();
                    return RedirectToAction("Index");
                }
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", ex);
            }
            return View(role);
        }
        [Authorize(Roles ="admin")]
        public ActionResult Edit(string Id)
        {
            var model = db.Roles.Find(Id);
            return View(model);
        }
        [Authorize(Roles = "admin")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit(string id,IdentityRole model)
        {
            if (ModelState.IsValid)
            {
                var role = db.Roles.Find(id);
                role.Name = model.Name;
                role.Id = model.Id;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(model);
        }
    }
}