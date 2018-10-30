

//此层作为控制器入口，数据验证,权限验证等，尽量少做业务逻辑处理；逻辑处理代码写入logic层
可以建立xxBaseController继承Controller基类作为扩展基类编写自定义代码
DefaultController.cs做为全局拦截类，若编写具体的业务请在对应的控制器中编写

控制器命名规范；控制目录最多3层{域名}/{控制器}/{方法}
要避免控制器层类名一致，虽然命名空间不同，但获取是程序集的全部类所有会导致冲突
xx业务AdminController
xx业务AdminApiController
xx业务Controller
xx业务ApiController
xx控制器.cs与View层Views文件夹 -> xx文件夹对应
例如view/Views/xx/    则建立xxController.cs类
若需要使用ajax异步请求API,则建立xxApiController.cs类

方法名规范渲染html；重载方法只取第一个方法
xx.cs->index()与View层 -> Views文件夹 -> xx文件夹名称 -> index.html对应
例如view/Views/xx/index    则在xxController.cs类中添加index方法


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

//特殊；避免这种情况下；最好只有3层目录
又分文件夹情况下:view/Views/AdminWeb/xx 
那么控制器建立在：Controllers/Admin/xxAdminController.cs
方法中使用：
path = "Views/AdminWeb/user/" + Action + ".html";
View = ViewEngine.Create(path);//创建视图
渲染html的加载







