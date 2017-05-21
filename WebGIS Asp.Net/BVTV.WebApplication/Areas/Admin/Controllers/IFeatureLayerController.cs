using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace BVTV.WebApplication.Areas.Admin.Controllers
{
    public interface IFeatureLayerController
    {
        [Authorize(Roles = "admin,updater,tester")]
        ActionResult Index();
        [Authorize(Roles = "admin,updater")]
        ActionResult Map();
        ActionResult Details(int? id);
        [Authorize(Roles = "admin,updater")]
        ActionResult Create();
        [Authorize(Roles = "admin,updater,tester")]
        ActionResult Chart();
        [Authorize(Roles = "admin,tester")]
        ActionResult Search();
    }
}
