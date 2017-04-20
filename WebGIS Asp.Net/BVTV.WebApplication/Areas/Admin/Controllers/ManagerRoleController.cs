using BVTV.WebApplication.Models;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Linq;
using System.Web.Mvc;

namespace BVTV.WebApplication.Areas.Admin.Controllers
{
    [Authorize(Roles ="Admin")]
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

            IdentityRole model = null;

            try

            {

                model = db.Roles.Find(Id);

                db.Roles.Remove(model);

                db.SaveChanges();

                return RedirectToAction("Index");

            }

            catch (Exception ex)

            {

                ModelState.AddModelError("", ex.Message);

            }

            return View(model);

        }
    }
}