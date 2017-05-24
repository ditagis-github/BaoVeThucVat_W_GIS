using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(BVTV.MobileWebApplication.Startup))]
namespace BVTV.MobileWebApplication
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
