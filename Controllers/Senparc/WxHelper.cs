using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using System.Xml.Linq;
using CYQ.Data;
using CYQ.Data.Tool;
using Senparc.CO2NET;
using Senparc.CO2NET.Cache;
using Senparc.CO2NET.RegisterServices;
using Senparc.CO2NET.Threads;
using Senparc.Weixin;
using Senparc.Weixin.Entities;
using Senparc.Weixin.Entities.TemplateMessage;
using Senparc.Weixin.Exceptions;
using Senparc.Weixin.MP;
using Senparc.Weixin.MP.AdvancedAPIs;
using Senparc.Weixin.MP.AdvancedAPIs.Media;
using Senparc.Weixin.MP.AdvancedAPIs.OAuth;
using Senparc.Weixin.MP.AdvancedAPIs.User;
using Senparc.Weixin.MP.CommonAPIs;
using Senparc.Weixin.MP.Containers;
using Senparc.Weixin.MP.Entities;
using Senparc.Weixin.MP.Entities.Menu;
using Senparc.Weixin.MP.Entities.Request;
using Senparc.Weixin.MP.Helpers;
using Senparc.Weixin.MP.TenPayLibV3;
//using Senparc.Weixin.Threads;

namespace Logic.WxSenparc
{
    /// <summary>
    /// 微信帮助类
    /// </summary>
    public partial class WxHelper : ApplicationException
    {
        public WxHelper()
        {

        }

        #region //内部变量
        
        private static readonly string AppId = AppConfig.GetApp("AppId");
        private static readonly string Secret = AppConfig.GetApp("AppSecret");
        private static readonly string MchId = AppConfig.GetApp("mch_id");
        private static readonly string MchIdkey = AppConfig.GetApp("mch_idkey");

        private static readonly string CertPath = AppDomain.CurrentDomain.BaseDirectory + AppConfig.GetApp("certPath");
        private static readonly string CertPassword = AppConfig.GetApp("certPwd");
        #endregion

        #region [建立连接，POST被动回复]
        /// <summary>
        /// 建立链接
        /// </summary>
        /// <param name="signature"></param>
        /// <param name="timestamp"></param>
        /// <param name="nonce"></param>
        /// <param name="echostr"></param>
        /// <returns></returns>
        public static string Check(string signature, string timestamp, string nonce, string echostr)
        {
            PostModel postModel = new PostModel()
            {
                Signature = signature,
                Timestamp = timestamp,
                Nonce = nonce
            };
            return CheckSignature.Check(postModel.Signature, postModel.Timestamp, postModel.Nonce, AppConfig.GetApp("token")) ? echostr : "验证未通过";
        }

        /// <summary>
        /// 接收微信post消息
        /// </summary>
        /// <param name="inputStream"></param>
        /// <param name="maxRecordCount"></param>
        /// <returns></returns>
        public static string WxRequest(Stream inputStream, int maxRecordCount = 10)
        {
            //验证字符串...
            var messageHandler = new CustomMessageHandler(inputStream, null, maxRecordCount);
            try
            {
                messageHandler.Execute();
            }
            catch (Exception ex)
            {
                // ignored
            }
            return messageHandler.ResponseDocument.ToString();
        }
        #endregion


        #region[微信授权登录相关]
        /// <summary>
        /// 获取授权登录地址
        /// </summary>
        /// <param name="redirectUrl">回调地址</param>
        /// <param name="state">携带参数</param>
        /// <returns></returns>
        public static string GetAuthorizeUrl(string redirectUrl, string state = "")
        {
            try
            {
                return OAuthApi.GetAuthorizeUrl(AppId, redirectUrl, state, OAuthScope.snsapi_userinfo);
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        /// <summary>
        /// 根据code获取AccessToken
        /// </summary>
        /// <param name="code"></param>
        /// <returns></returns>
        public static OAuthAccessTokenResult GetAccessToken(string code)
        {
            try
            {
                OAuthAccessTokenResult result = OAuthApi.GetAccessToken(AppId, Secret, code);
                return result;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
        /// <summary>
        /// 根据OpenId拉取用户信息
        /// </summary>
        /// <param name="OpenId"></param>
        /// <returns></returns>
        public static UserInfoJson GetUserInfo(string OpenId)
        {
            try
            {
                var UserInfo = UserApi.Info(AppId, OpenId);
                return UserInfo;
            }
            catch (Exception ex)
            {
                return null;
            }
        }


        /// <summary>
        /// 根据AccessToken和openid拉取用户信息
        /// </summary>
        /// <returns></returns>
        public static OAuthUserInfo GetUserInfo(string accessToken, string openId)
        {
            try
            {
                OAuthUserInfo userInfo = OAuthApi.GetUserInfo(accessToken, openId);
                return userInfo;
            }
            catch (ErrorJsonResultException ex)
            {
               
                return null;
            }
        }
        #endregion
        

      
    }


    /// <summary>
    /// 
    /// </summary>
    public partial class WxHelper
    {
        #region 全局配置信息
        /// <summary>
        /// 激活微信缓存 v5.0版本以下
        /// </summary>
        public void RegisterWeixinThreads()
        {
            try
            {
                ThreadUtility.Register();//如果不注册此线程，则AccessToken、JsTicket等都无法使用SDK自动储存和管理。
                AccessTokenContainer.Register(AppId, Secret);
            }
            catch (Exception ex)
            {
              
            }

        }

        /// <summary>
        /// v5.0版本注册
        /// </summary>
        public void RegisterV5()
        {
            //设置全局 Debug 状态
            var isGLobalDebug = true;
            //全局设置参数，将被储存到 Senparc.CO2NET.Config.SenparcSetting
            var senparcSetting = SenparcSetting.BuildFromWebConfig(isGLobalDebug);

            IRegisterService register = RegisterService.Start(senparcSetting)
                                        .UseSenparcGlobal(false, () => GetExCacheStrategies(senparcSetting))
                 .RegisterThreads();


            var isWeixinDebug = true;
            //全局设置参数，将被储存到 Senparc.Weixin.Config.SenparcWeixinSetting
            var senparcWeixinSetting = SenparcWeixinSetting.BuildFromWebConfig(isWeixinDebug);

            register.UseSenparcWeixin(senparcWeixinSetting, senparcSetting)
               .RegisterMpAccount(AppId, Secret, "【xx】公众号");

        }
        /// <summary>
        /// 获取Container扩展缓存策略
        /// </summary>
        /// <returns></returns>
        private IList<IDomainExtensionCacheStrategy> GetExCacheStrategies(SenparcSetting senparcSetting)
        {
            var exContainerCacheStrategies = new List<IDomainExtensionCacheStrategy>();
            senparcSetting = senparcSetting ?? new SenparcSetting();
            //判断Redis是否可用
            //var redisConfiguration = ConfigurationManager.AppSettings["Cache_Redis_Configuration"];
            //if ((!string.IsNullOrEmpty(redisConfiguration) && redisConfiguration != "Redis配置"))
            //{
            //    exContainerCacheStrategies.Add(RedisContainerCacheStrategy.Instance);
            //}

            //判断Memcached是否可用
            //var memcachedConfiguration = ConfigurationManager.AppSettings["Cache_Memcached_Configuration"];
            //if ((!string.IsNullOrEmpty(memcachedConfiguration) && redisConfiguration != "Memcached配置"))
            //{
            //    exContainerCacheStrategies.Add(MemcachedContainerCacheStrategy.Instance);
            //}

            //也可扩展自定义的缓存策略

            return exContainerCacheStrategies;
        }

        #endregion

      
    }

}
