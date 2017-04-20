using BVTV.WebApplication.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace BVTV.WebApplication.Areas.Admin.Controllers
{
    [Authorize(Roles = "Admin")]
    public class ManagerUserController : Controller
    {

        ApplicationDbContext context = new ApplicationDbContext();

        // GET: Admin/ManageUser

        public ActionResult Index()

        {

            IEnumerable<ApplicationUser> model = context.Users.AsEnumerable();

            return View(model);

        }

        //GET: Admin/ManagerUser/Manage
        public ActionResult Manage()
        {
            return View();
        }

        public ActionResult Edit(string Id)

        {

            ApplicationUser model = context.Users.Find(Id);

            return View(model);

        }

        [HttpPost]

        [ValidateAntiForgeryToken]

        public ActionResult Edit(ApplicationUser model)

        {

            try

            {

                context.Entry(model).State = System.Data.Entity.EntityState.Modified;

                context.SaveChanges();

                return RedirectToAction("Index");

            }

            catch (Exception ex)

            {

                ModelState.AddModelError("", ex.Message);

                return View(model);

            }

        }

        public ActionResult EditRole(string Id)
        {
            //tìm một một model sử dụng EF(entity framework) với id truyền vào
            ApplicationUser model = context.Users.Find(Id);

            //ApplicationUserCustom model = new ApplicationUserCustom
            //{
            //    AccessFailedCount = au.AccessFailedCount,
            //    DisplayName = au.DisplayName,
            //    Email = au.Email,
            //    Id = au.Id,
            //    RolesCustom = from rl in au.Roles
            //                  select new RoleCustom
            //                  {
            //                      RoleId = rl.RoleId,
            //                      RoleName = context.Roles.First(f => f.Id.Equals(rl.RoleId)).Name,
            //                      UserId = rl.UserId
            //                  }
            
            //};

            //set một combobox tất cả các quyền mà user chưa có
            ViewBag.RoleId = new SelectList(context.Roles.ToList().Where(item => model.Roles.FirstOrDefault(r => r.RoleId == item.Id) == null).ToList(), "Id", "Name");

            ////tạo roles name gán vào Viewbag để hiển thị ở ViewỀ
            //var roleQuery = from role in context.Roles.ToList()
            //                join mdRole in model.Roles.ToList() on role.Id equals mdRole.RoleId
            //                select new
            //                {
            //                    RoleId = mdRole.RoleId,
            //                    UserId = mdRole.UserId,
            //                    RoleName = role.Name
            //                };
            //ViewBag.RolesName = roleQuery.ToList();
            return View(model);

        }

        [HttpPost]

        [ValidateAntiForgeryToken]

        public ActionResult AddToRole(string UserId, string[] RoleId)

        {

            ApplicationUser model = context.Users.Find(UserId);

            if (RoleId != null && RoleId.Count() > 0)

            {

                foreach (string item in RoleId)

                {

                    IdentityRole role = context.Roles.Find(RoleId);

                    model.Roles.Add(new IdentityUserRole() { UserId = UserId, RoleId = item });

                }

                context.SaveChanges();

            }

            ViewBag.RoleId = new SelectList(context.Roles.ToList().Where(item => model.Roles.FirstOrDefault(r => r.RoleId == item.Id) == null).ToList(), "Id", "Name");

            return RedirectToAction("EditRole", new { Id = UserId });

        }

        [HttpPost]

        [ValidateAntiForgeryToken]

        public ActionResult DeleteRoleFromUser(string UserId, string RoleId)

        {

            ApplicationUser model = context.Users.Find(UserId);

            model.Roles.Remove(model.Roles.Single(m => m.RoleId == RoleId));

            context.SaveChanges();

            ViewBag.RoleId = new SelectList(context.Roles.ToList().Where(item => model.Roles.FirstOrDefault(r => r.RoleId == item.Id) == null).ToList(), "Id", "Name");

            return RedirectToAction("EditRole", new { Id = UserId });

        }

        public ActionResult Delete(string Id)

        {

            var model = context.Users.Find(Id);

            return View(model);

        }

        [HttpPost]

        [ValidateAntiForgeryToken]

        [ActionName("Delete")]

        public ActionResult DeleteConfirmed(string Id)

        {

            ApplicationUser model = null;

            try

            {

                model = context.Users.Find(Id);

                context.Users.Remove(model);

                context.SaveChanges();

                return RedirectToAction("Index");

            }

            catch (Exception ex)

            {

                ModelState.AddModelError("", ex.Message);

                return View("Delete", model);

            }

        }

        private ApplicationSignInManager _signInManager;
        private ApplicationUserManager _userManager;
        public ApplicationUserManager UserManager
        {
            get
            {
                return _userManager ?? HttpContext.GetOwinContext().GetUserManager<ApplicationUserManager>();
            }
            private set
            {
                _userManager = value;
            }
        }

        public ApplicationSignInManager SignInManager
        {
            get
            {
                return _signInManager ?? HttpContext.GetOwinContext().Get<ApplicationSignInManager>();
            }
            private set
            {
                _signInManager = value;
            }
        }

        //
        // GET: /Account/Register
        [AllowAnonymous]
        public ActionResult Register()
        {
            return View();
        }


        //
        // POST: /Account/Register
        [HttpPost]
        [AllowAnonymous]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> Register(RegisterViewModel model)
        {
            if (ModelState.IsValid)
            {
                var user = new ApplicationUser { UserName = model.UserName, DisplayName = model.DisplayName };
                var result = await UserManager.CreateAsync(user, model.Password);
                if (result.Succeeded)
                {
                    //await SignInManager.SignInAsync(user, isPersistent: false, rememberBrowser: false);

                    // For more information on how to enable account confirmation and password reset please visit http://go.microsoft.com/fwlink/?LinkID=320771
                    // Send an email with this link
                    // string code = await UserManager.GenerateEmailConfirmationTokenAsync(user.Id);
                    // var callbackUrl = Url.Action("ConfirmEmail", "Account", new { userId = user.Id, code = code }, protocol: Request.Url.Scheme);
                    // await UserManager.SendEmailAsync(user.Id, "Confirm your account", "Please confirm your account by clicking <a href=\"" + callbackUrl + "\">here</a>");

                    return RedirectToAction("Index", "ManagerUser");
                }
                AddErrors(result);
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }
        private void AddErrors(IdentityResult result)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error);
            }
        }
        //
        // GET: /Manage/ChangePassword
        public ActionResult ChangePassword()
        {
            return View();
        }
        public enum ManageMessageId
        {
            AddPhoneSuccess,
            ChangePasswordSuccess,
            SetTwoFactorSuccess,
            SetPasswordSuccess,
            RemoveLoginSuccess,
            RemovePhoneSuccess,
            Error
        }
        //
        // POST: /Manage/ChangePassword
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult> ChangePassword(ChangePasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            var result = await UserManager.ChangePasswordAsync(User.Identity.GetUserId(), model.OldPassword, model.NewPassword);
            if (result.Succeeded)
            {
                var user = await UserManager.FindByIdAsync(User.Identity.GetUserId());
                if (user != null)
                {
                    await SignInManager.SignInAsync(user, isPersistent: false, rememberBrowser: false);
                }
                return RedirectToAction("Index", new { Message = ManageMessageId.ChangePasswordSuccess });
            }
            AddErrors(result);
            return View(model);
        }
    }
}
