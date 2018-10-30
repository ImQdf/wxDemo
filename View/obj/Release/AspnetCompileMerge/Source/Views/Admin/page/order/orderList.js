layui.use("table", function () {
    var table = layui.table;

    table.render({
        elem: "#tableData"
      , url: "/OrderAdmin/GetOrderList"
      , page: true
      , cellMinWidth: 60
      , cols: [[
          { type: "checkbox" }
        , { field: "OrderId", title: "ID" }
        , { field: "OrderMarking", title: "订单号" }
        , { field: "OrderDate", title: "下单时间" }
        , { field: "UserName", title: "下单人昵称" }
        , { field: "Consignee", title: "收货人昵称" }
        , { field: "ConsigneeTel", title: "收货人电话" }
        , { field: "PaymentType", title: "支付方式" }
        , { field: "OrderTotal", title: "订单金额" }
        , {
            field: "OrderStatus", title: "订单状态", templet: function (d) {
                if (d.OrderStatus === 0) {
                    return '待付款';
                }
                if (d.OrderStatus === 1) {
                    return '待发货';
                }
                return '未知';
            }
        }
        , { width: 300, title: "操作", align: "center", toolbar: "#barProduct" }
      ]],
        id: "tableDataDT"
    });

    function deleteAjax(ids) {
        console.info(ids);
        if (ids.length <= 0) {
            layer.alert("请选择要删除的数据", { icon: 0, title: "提示信息" });
            return;
        }
        layer.confirm("确定删除选中的信息？", { icon: 3, title: "提示信息" }, function (index) {
            index = layer.msg("删除中，请稍候", { icon: 16, time: 60000, shade: 0.8 });
            $.ajax({
                url: "/OrderAdmin/DeleteAPI",
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
                content: "userDetail.html?id=" + data.OrderId,
                success: function (layero, index) {
                    var body = layer.getChildFrame("body", index);
                }
            });
            layui.layer.full(index);
        } else if (layEvent === "del") {
            var ids = [];
            ids.push(data.OrderId);
            deleteAjax(ids);
        } else if (layEvent === "edit") {
            index = layui.layer.open({
                title: "编辑用户",
                type: 2,
                content: "updateUser.html?id=" + data.OrderId,
                success: function (layero, index) {
                    var body = layer.getChildFrame("body", index);
                }
            });
            layui.layer.full(index);
        }
    });

    var $ = layui.$, active = {
        reload: function () {
            var txtOrderId = $("#txtOrderId");

            table.reload("tableDataDT", {
                page: {
                    curr: 1
                },
                where: {
                    key: {
                        OrderId: txtOrderId.val()
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
                  ids.push(data[i].OrderId);
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

