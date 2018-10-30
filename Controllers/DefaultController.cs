using System;
using System.Text;
using System.Web;
using CYQ.Data;
using CYQ.Data.Cache;
using Taurus.Core;

namespace Controllers
{
    public class DefaultController : Controller
    {
        /// <summary>
        /// 权限验证
        /// </summary>
        /// <param name="controller"></param>
        /// <param name="methodName"></param>
        /// <returns></returns>
        public static bool CheckToken(IController controller, string methodName)
        {
            //string token2 = controller.Context.Request.Headers.Get("sign");
            //说明：若需验证，请在具体类中重写此方法
            return true;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="controller"></param>
        /// <param name="methodName"></param>
        /// <returns></returns>
        public static bool BeforeInvoke(IController controller, string methodName)
        {
            return true;

            //if (controller.IsHttpPost)
            //{
            //    //拦截全局处理
            //    controller.Write(methodName + " NoACK");
            //}
        }

    }
}
