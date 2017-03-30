using BVTV.WebGIS.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using BVTV.Entity;

namespace BVTV.WebGIS.Controllers
{
    public class LoginController: Controller
    {
        //private Helper help;

        //public AdminAccountController(IUsersRepository usersRepository, Helper help)
        //{
        //    this.usersRepository = usersRepository;
        //    this.help = help;
        //}
        //
        // GET: /Admin/AdminAccount/
        BaoVeThucVatEntities entities = new BaoVeThucVatEntities();
            
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Index(Account account)
        {
            if (ModelState.IsValid)
            {
                if (this.isValid(account.username, account.pass))
                {
                    FormsAuthentication.SetAuthCookie(account.username, account.isRemember);

                        return RedirectToAction("Index", "Home");
                }
                else
                {
                    ModelState.AddModelError("", "Đăng nhập không thành công ");
                    ModelState.AddModelError("", "Tên đăng nhập hoặc mật khẩu có thể không tồn tại !");
                    ModelState.AddModelError("", "Tài khoản của bạn có thể bị khóa hoặc không có quyền truy cập trang này !");
                }
            }
            return View(account);
        }

        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            return RedirectToAction("Index", "Home");
        }


        private Boolean isValid(string username, string password)
        {
            return entities.Users.Any(a=>a.username.Equals(username) && a.password.Equals(password));
        }


        //public ActionResult changePass(int userID, string userName)
        //{
        //    if (!Request.IsAuthenticated)
        //    {
        //        TempData["message"] = "Bạn không có quyền truy cập vào trang thay đổi mật khẩu";
        //        TempData["messageType"] = "error";
        //        return RedirectToAction("Index", "AdminHome");
        //    }

        //    Users user = usersRepository.Users.Where(u => u.username == User.Identity.Name).FirstOrDefault();
        //    if (user != null)
        //    {
        //        if (user.id == userID && user.username == userName)
        //        {
        //            ChangePassUser changePassUser = new ChangePassUser();
        //            changePassUser.id = userID;
        //            changePassUser.username = userName;
        //            return View(changePassUser);

        //        }
        //        else
        //        {
        //            TempData["message"] = "Tài khoản của bạn không được xác minh . Bạn không thể đổi mật khẩu. <br/> Có vẻ bạn đang cố gắng thay đổi mật khẩu của một tài khoản không phải của mình  ";
        //            TempData["messageType"] = "error";
        //            return RedirectToAction("Index", "AdminHome");
        //        }
        //    }
        //    else
        //    {
        //        TempData["message"] = "Tài khoản của bạn không được xác minh . Bạn không thể đổi mật khẩu .";
        //        TempData["messageType"] = "error";
        //        return RedirectToAction("Index", "AdminHome");
        //    }
        //}

        //[HttpPost]
        //public ActionResult changePass(int userID, string userName, ChangePassUser changePassUser)
        //{
        //    if (!Request.IsAuthenticated)
        //    {
        //        TempData["message"] = "Bạn không có quyền truy cập vào trang thay đổi mật khẩu";
        //        TempData["messageType"] = "error";
        //        return RedirectToAction("Index", "AdminHome");
        //    }
        //    try
        //    {
        //        if (ModelState.IsValid)
        //        {
        //            Users user = usersRepository.Users.Where(u => u.id == changePassUser.id && u.username == changePassUser.username).FirstOrDefault();
        //            if (user == null)
        //            {
        //                TempData["message"] = "Tài khoản của bạn không được xác minh . Bạn không thể đổi mật khẩu. <br/> Có vẻ bạn đang cố gắng thay đổi mật khẩu của một tài khoản không phải của mình  ";
        //                TempData["messageType"] = "error";
        //                return View(changePassUser);
        //            }

        //            string oldPassMH, newPassMH;
        //            oldPassMH = help.mahoa(changePassUser.oldpass);

        //            if (user.pass != oldPassMH)
        //            {
        //                TempData["message"] = " Mật khẩu cũ của bạn không đúng .  ";
        //                TempData["messageType"] = "error";
        //                return View(changePassUser);
        //            }

        //            newPassMH = help.mahoa(changePassUser.pass);
        //            user.pass = newPassMH;

        //            string result = usersRepository.changePass(user);
        //            if (result.Trim().Length == 0)
        //            {
        //                FormsAuthentication.SignOut();
        //                return RedirectToAction("Login");
        //            }
        //            else
        //            {
        //                TempData["message"] = "Có lỗi hệ thống : " + result;
        //                TempData["messageType"] = "error";
        //                return View(changePassUser);
        //            }
        //        }
        //        else
        //        {
        //            TempData["message"] = "Dữ liệu bạn nhập vào không hợp lệ";
        //            TempData["messageType"] = "error";
        //            return View(changePassUser);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TempData["message"] = " Có lỗi hệ thống : " + ex.Message;
        //        TempData["messageType"] = "error";
        //        return View(changePassUser);
        //    }

        //}

        //public ActionResult changeInforUser(int userID, string userName)
        //{
        //    if (!Request.IsAuthenticated)
        //    {
        //        TempData["message"] = "Bạn không có quyền truy cập vào trang thay đổi thông tin cá nhân";
        //        TempData["messageType"] = "error";
        //        return RedirectToAction("Index", "AdminHome");
        //    }

        //    Users user = usersRepository.Users.Where(u => u.username == User.Identity.Name).FirstOrDefault();
        //    if (user != null)
        //    {
        //        if (user.id == userID && user.username == userName)
        //        {
        //            ChangeInforUser changeUser = new ChangeInforUser();
        //            changeUser.id = userID;
        //            changeUser.username = userName;
        //            changeUser.NameDisplay = user.NameDisplay;
        //            changeUser.email = user.email;
        //            changeUser.Avartar = user.Avartar;
        //            return View(changeUser);

        //        }
        //        else
        //        {
        //            TempData["message"] = "Tài khoản của bạn không được xác minh . Bạn không thể đổi thông tin cá nhân. <br/> Có vẻ bạn đang cố gắng thay đổi  thông tin cá nhân của một tài khoản không phải của mình  ";
        //            TempData["messageType"] = "error";
        //            return RedirectToAction("Index", "AdminHome");
        //        }
        //    }
        //    else
        //    {
        //        TempData["message"] = "Tài khoản của bạn không được xác minh . Bạn không thể đổi thông tin cá nhân .";
        //        TempData["messageType"] = "error";
        //        return RedirectToAction("Index", "AdminHome");
        //    }
        //}

        //[HttpPost]
        //public ActionResult changeInforUser(int userID, string userName, ChangeInforUser changeUser)
        //{
        //    if (!Request.IsAuthenticated)
        //    {
        //        TempData["message"] = "Bạn không có quyền truy cập vào trang thay đổi thông tin cá nhân";
        //        TempData["messageType"] = "error";
        //        return RedirectToAction("Index", "AdminHome");
        //    }
        //    try
        //    {
        //        Users user = usersRepository.Users.Where(u => u.id == changeUser.id && u.username == changeUser.username).FirstOrDefault();
        //        if (user == null)
        //        {
        //            TempData["message"] = "Tài khoản của bạn không được xác minh . Bạn không thể đổi thông tin cá nhân. <br/> Có vẻ bạn đang cố gắng thay đổi thông tin cá nhân của một tài khoản không phải của mình  ";
        //            TempData["messageType"] = "error";
        //            return View(changeUser);
        //        }

        //        if (ModelState.IsValid)
        //        {
        //            string result = usersRepository.changeInforUser(changeUser);
        //            if (result.Trim().Length == 0)
        //            {
        //                TempData["message"] = "Thông tin tài khoản của bạn đã được thay đổi thành công .";
        //                TempData["messageType"] = "inf";
        //                return RedirectToAction("Index", "AdminHome");
        //            }
        //            else
        //            {
        //                TempData["message"] = "Có lỗi hệ thống : " + result;
        //                TempData["messageType"] = "error";
        //                return RedirectToAction("Index", "AdminHome");
        //            }
        //        }
        //        else
        //        {
        //            TempData["message"] = "Dữ liệu bạn nhập vào không hợp lệ";
        //            TempData["messageType"] = "error";
        //            return View(changeUser);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        TempData["message"] = " Có lỗi hệ thống : " + ex.Message;
        //        TempData["messageType"] = "error";
        //        return View(changeUser);
        //    }

        //}

    }
}
