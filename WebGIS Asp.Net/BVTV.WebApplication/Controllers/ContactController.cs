using BVTV.WebApplication.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BVTV.WebApplication.Controllers
{
    public class ContactController : Controller
    {
        //
        // GET: /Contact/

        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Send(Contact contact)
        {
            ModelState.AddModelError("", "Gửi liên hệ thành công ");
            return View("Index");
        }

    }
}
