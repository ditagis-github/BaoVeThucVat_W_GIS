using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace BVTV.WebApplication.Models
{
    public class Contact
    {
        [StringLength(100, ErrorMessage = "Cột {0} phải có ít nhất {2} kí tự và không lớn hơn {1} kí tự .", MinimumLength = 2)]
        [Required(ErrorMessage = "Vui lòng nhập {0} ")]
        public String Name { get; set; }
        [StringLength(100, ErrorMessage = "Cột {0} phải có ít nhất {2} kí tự và không lớn hơn {1} kí tự .", MinimumLength = 2)]
        [Required(ErrorMessage = "Vui lòng nhập {0} ")]
        public String Email { get; set; }
        [StringLength(100, ErrorMessage = "Cột {0} phải có ít nhất {2} kí tự và không lớn hơn {1} kí tự .", MinimumLength = 2)]
        [Required(ErrorMessage = "Vui lòng nhập {0} ")]
        public String Message { get; set; }
    }
}