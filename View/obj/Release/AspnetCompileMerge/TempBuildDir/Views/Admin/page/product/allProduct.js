layui.use("table", function () {
    var table = layui.table;

    table.render({
        elem: "#tableData"
      , url: "/ProductAdmin/GetProductList"
      , page: true
      , cellMinWidth: 60
      , cols: [[
          { type: "checkbox" }
        , { field: "ProductId", title: "ID" }
        , { field: "ProductName", title: "商品图片", templet: "#headimg" }
        , { field: "ProductName", title: "商品名称" }
        , { field: "SKU", title: "商品SKU" }
        , { field: "MarketPrice", title: "市场价" }
        , { field: "SalePrice", title: "销售价" }
        , { field: "StockNum", title: "库存数量" }
        , {
            field: "IsProps", title: "类型", templet: function (d) {
                if (d.IsProps) {
                    return '虚拟道具';
                }
                return '普通产品';
            }
        }
        , { width: 300, title: "操作", align: "center", toolbar: "#barProduct" }
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
                url: "/ProductAdmin/DeleteAPI",
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
                content: "userDetail.html?id=" + data.ProductId,
                success: function (layero, index) {
                    var body = layer.getChildFrame("body", index);
                }
            });
            layui.layer.full(index);
        } else if (layEvent === "del") {
            var ids = [];
            ids.push(data.ProductId);
            deleteAjax(ids);

        } else if (layEvent === "edit") {
            index = layui.layer.open({
                title: "编辑用户",
                type: 2,
                content: "updateUser.html?id=" + data.ProductId,
                success: function (layero, index) {
                    var body = layer.getChildFrame("body", index);
                }
            });
            layui.layer.full(index);
        }
    });

    var $ = layui.$, active = {
        reload: function () {
            var txtProductName = $("#txtProductName");
            table.reload("tableDataDT", {
                page: {
                    curr: 1
                },
                where: {
                    key: {
                        ProductName: txtProductName.val()
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
                  ids.push(data[i].ProductId);
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

