using BVTV.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApplicationTest
{
    class Program
    {
        static void Main(string[] args)
        {
            BaoVeThucVatEntities db = new BaoVeThucVatEntities();
            var datas = (from tt in db.TRONGTROTs
                         where tt.PhuongThucTrong.HasValue
                         select tt.PhuongThucTrong.Value).Distinct().ToList();
            //var query = new LinkedList<object>();
            foreach (var ptt in datas)
            {
                Console.WriteLine(ptt);
            }
            var query = from ptt in datas
                        join pttName in db.PhuongThucTrongs on ptt equals pttName.id
                        select new
                        {
                            Label = pttName.Name,
                            Data = (from tt in db.TRONGTROTs
                                   where tt.PhuongThucTrong.HasValue && tt.PhuongThucTrong.Value.Equals(ptt)
                                   select tt).Count()
                        };
            Console.WriteLine(query.Count());
            //List<object> datas = new List<object>();
            //var tts = db.TRONGTROTs;
            //foreach (var nct in db.NhomCayTrongs)
            //{
            //    var tt = tts.Where(w => w.NhomCayTrong.Value == nct.id).ToList();
            //    var data = tt.Count;
            //    datas.Add(new
            //    {
            //        Label = nct.id,
            //        Data = data
            //    });
            //}
        }
    }
}
