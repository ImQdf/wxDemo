using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Globalization;
using System.IO;
using System.Web;
using CYQ.Data;
using CYQ.Data.Table;
using CYQ.Data.Tool;
using Logic;
using Logic.WxSenparc;
using Taurus.Core;

namespace Controllers
{
    public class WeiXinApiController : Controller
    {
        public WeiXinApiController()
        {
        }
        /// <summary>
        /// 作为API使用时，CancelLoadHtml=true;
        /// </summary>
        /// <param name="methodName"></param>
        /// <returns></returns>
        public override bool BeforeInvoke(string methodName)
        {
            CancelLoadHtml = true;//使用API时取消读取html
            return true;
        }

        #region [变量]
        /// <summary>
        /// API域名
        /// </summary>
        private readonly string _domianName = AppConfig.GetApp("DomianName");

        #endregion


        /// <summary>
        /// 微信消息接口对接;wxinxinapi/WxRequest
        /// </summary>
        public void WxRequest()
        {
            if (IsHttpPost)
            {
                try
                {
                    Stream s = Context.Request.InputStream;
                    string responseDoc = WxHelper.WxRequest(s);
                    Write(responseDoc);
                }
                catch (Exception ex)
                {
                    Log.WriteLogToTxt("异常微信接口对接:" + ex.Message, LogType.Error);
                }
            }
            else
            {
                string signature = Query<string>("signature");
                string nonce = Query<string>("nonce");
                string timestamp = Query<string>("timestamp");
                string echostr = Query<string>("echostr");
                Write(WxHelper.Check(signature, timestamp, nonce, echostr));

            }

        }

        /// <summary>
        /// 获取微信授权登录地址
        /// </summary>
        public void GetOAuthUrl()
        {
            string returnurl = Query<string>("returnurl");
            string redirectUri = _domianName + "/WeiXinApi/WxOAuth?returnurl=" + returnurl;//你的回调地址,通过returnurl参数携带其他参数
            string url = WxHelper.GetAuthorizeUrl(redirectUri);//微信授权登录地址，会携带code跳转到回调
            Write(url, true);
        }

        /// <summary>
        /// 根据code拉取授权信息
        /// </summary>
        public void WxOAuth()
        {
            try
            {
                string userAgent = Context.Request.UserAgent;
                if (userAgent != null && userAgent.ToLower().Contains("micromessenger"))
                {
                    string code = Query<string>("code");
                    string returnurl = Query<string>("returnurl");
                    Log.WriteLogToTxt("returnurl：" + returnurl);
                    var result = WxHelper.GetAccessToken(code);//通过code拉取
                    Log.WriteLogToTxt(JsonHelper.ToJson(result));
                    if (result.errcode == Senparc.Weixin.ReturnCode.请求成功)
                    {
                        var unionId = result.unionid;
                        var openId = result.openid;
                        var accessToken = result.access_token;

                        //具体的业务逻辑了...
                        if (WxRegistere(accessToken, openId, unionId))
                        {
                            //注册成功后的逻辑
                            Context.Response.Redirect(returnurl);
                        }
                    }
                }
                else
                {
                    //不是微信浏览器
                    Log.WriteLogToTxt("not micromessenger !");
                }
            }
            catch (Exception)
            {

            }

        }

        /// <summary>
        /// 微信授权用户注册
        /// 根据自己的业务重写即可
        /// </summary>
        /// <returns></returns>
        public bool WxRegistere(string accessToken, string openId, string unionId)
        {
            using (MAction m = new MAction("WXUser"))
            {
                #region [OpenId/UnionId是否存在]
                var fill = !string.IsNullOrEmpty(unionId)
                    ? m.Fill("UnionId='" + unionId + "'")
                    : m.Fill("OpenId='" + openId + "'");
                #endregion

                #region 微信用户拉取信息拉取
                var UserInfo = WxHelper.GetUserInfo(accessToken, openId);//拉取用户微信信息
                Log.WriteLogToTxt("通过accessToken+openid拉取用户信息：" + JsonHelper.ToJson(UserInfo));
                var IsUserInfo = WxHelper.GetUserInfo(openId);//用于判断是否关注了公众号的用户信息
                Log.WriteLogToTxt("通过openId拉取的用户信息：" + JsonHelper.ToJson(IsUserInfo));
                #endregion

                //下面是你的具体业务，我就不写了哈。

                long userId;
                if (fill)
                {
                    //用户已存在，你可以根据你的业务需求重写编写
                    return true;
                }
                else
                {
                    //注册方法
                    //m.Set("字段名",vaule);
                    var result = m.Insert();
                    return result;
                }
            }

        }


    }


}
