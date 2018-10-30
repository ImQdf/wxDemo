layui.use("table", function () {
    var table = layui.table;

    table.render({
        elem: "#tableData"
      , url: "/UserAdmin/GetUserList"
      , page: true
      , cellMinWidth: 60
      , cols: [[
          { type: "checkbox" }
        , { field: "UserId", title: "用户ID" }
        , { field: "UserHead", title: "用户头像", templet: "#headimg" }
        , { field: "UserName", title: "用户昵称" }
        , { field: "RealName", title: "真实姓名" }
        , {
            field: "Sex", title: "性别", templet: function (d) {
                if (d.Sex === 1) {
                    return '男';
                }
                if (d.Sex === 2) {
                    return '女';
                }
                return '未知';
            }
        }
        , { field: "Phone", title: "手机" }
        , {
            field: "IsAmbassador", title: "等级", templet: function (d) {
                if (d.IsAmbassador === 1) {
                    return '推广大使';
                }
                return '普通会员';
            }
        }
        , { width: 300, fixed: "right", title: "操作", align: "center", toolbar: "#barUser" }
      ]],
        id: "tableDataDT"
    });

    function deleteAjax(ids) {
        if (ids.length <= 0) {
            layer.alert("请选择要删除的数据", { icon: 0, title: "提示信息" });
            return;
        }
        layer.confirm("确定删除选中的信息？", { icon: 3, title: "提示信息" }, function (index) {
            index = layer.msg("删除中，请稍候", { icon: 16, time: 60000, shade: 0.8 });
            $.ajax({
                url: "/UserAdmin/DeleteAPI",
                type: "post",
                dataType: "json",
                data: { ids: ids },
                //async: false,
                success: function (data) {
                    layer.close(index);
                    if (data.success) {
                        table.reload("tableDataDT");
                    } else {
                        layer.alert(data.msg);
                    }
                   
                },
                error: function (data) {
                    console.info("fail");
                }
            });

        });
    }

    table.on("tool(tableData)", function (obj) {
        var data = obj.data, layEvent = obj.event;
        var index;
        if (layEvent === "detail") {
            index = layui.layer.open({
                title: "查看用户",
                type: 2,
                content: "userDetail.html?id=" + data.UserId,
                success: function (layero, index) {
                    var body = layer.getChildFrame("body", index);
                }
            });
            layui.layer.full(index);
        } else if (layEvent === "del") {
            var ids = [];
            ids.push(data.UserId);
            deleteAjax(ids);
        } else if (layEvent === "edit") {
            index = layui.layer.open({
                title: "编辑用户",
                type: 2,
                content: "updateUser.html?id=" + data.UserId,
                success: function (layero, index) {
                    var body = layer.getChildFrame("body", index);
                }
            });
            layui.layer.full(index);
        }
    });

    var $ = layui.$, active = {
        reload: function () {
            var txtUserName = $("#txtUserName");
            var txtRealName = $("#txtRealName");
            table.reload("tableDataDT", {
                page: {
                    curr: 1
                },
                where: {
                    key: {
                        UserName: txtUserName.val(),
                        RealName: txtRealName.val()
                    }
                }
            });
        }
      , getCheckData: function () {
          var checkStatus = table.checkStatus("tableDataDT");
          var data = checkStatus.data;
          var ids = [];
          for (var i in data) {
              if (data.hasOwnProperty(i)) {
                  ids.push(data[i].UserId);
              }
          }
          deleteAjax(ids);
      }
    };

    $("#searchbtn,#batchdel").on("click", function () {
        var type = $(this).data("type");
        active[type] ? active[type].call(this) : "";
    });
});

