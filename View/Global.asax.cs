#define 使用RegisterServices方式注册

using System;
using System.Collections.Specialized;
using System.Web;
using Logic.WxSenparc;


namespace View
{
    public class Global : HttpApplication
    {
        protected void Application_Start(object sender, EventArgs e)
        {

#if 使用RegisterServices方式注册
            new WxHelper().RegisterV5();
#else
            new WxHelper().RegisterWeixinThreads(); 
#endif
        }

        protected void Session_Start(object sender, EventArgs e)
        {

        }

        protected void Application_BeginRequest(object sender, EventArgs e)
        {

        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {
        

        }

        protected void Session_End(object sender, EventArgs e)
        {

        }

        protected void Application_End(object sender, EventArgs e)
        {
          
        }
     

    }
}