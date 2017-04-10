using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(BVTV.WebApplication.Startup))]
namespace BVTV.WebApplication
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
