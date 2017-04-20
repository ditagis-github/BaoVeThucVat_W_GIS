using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace BVTV.WebApplication.Areas.Admin.Interfaces
{
    /// <summary>
    /// Interface dùng cho những Controller cung cấp dữ liệu để hiện thị biểu đồ ở View
    /// </summary>
    public interface IChartJson
    {
        /// <summary>
        /// Dùng hiển thị biểu đồ mặc định để chartjs dùng ajax load dữ liệu
        /// </summary>
        /// <returns>Dữ liệu Json chứa Data và Label</returns>
        ActionResult GetAll();
    }
}
