using BVTV.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BVTV.WebApplication.Areas.Admin.Models
{
    public class RolesManager
    {
        
        public static String[] GetRolesForUser(String userName)
        {
            BaoVeThucVatEntities db = new BaoVeThucVatEntities();
            var user = db.AspNetUsers.First(f => f.UserName.Equals(userName));
            if(user != null)
            {
                var result = from role in user.AspNetRoles
                             select role.Id;
                return result.ToArray();
            }
            return null;
        }
    }
}