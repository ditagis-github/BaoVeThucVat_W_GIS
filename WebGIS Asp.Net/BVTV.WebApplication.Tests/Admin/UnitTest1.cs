using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using BVTV.WebApplication.Areas.Admin.Controllers;
using System.Web.Mvc;

namespace BVTV.WebApplication.Tests.Admin
{
    [TestClass]
    public class UnitTest1
    {
        [TestMethod]
        public void GetAll()
        {
            TrongTrotController controller = new TrongTrotController();
            // Act
            JsonResult result = controller.GetAll() as JsonResult;

            // Assert
            Assert.IsNotNull(result);
        }
    }
}
