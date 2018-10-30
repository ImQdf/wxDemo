var areaData = address;
var $form;
var form;
var $;
layui.config({
	base : "../../js/"
}).use(['form','layer','upload','laydate'],function(){
	form = layui.form;
	var layer = parent.layer === undefined ? layui.layer : parent.layer;
		$ = layui.jquery;
		$form = $('form');
		laydate = layui.laydate;
        

		$(function () {
		    var userid = $('.userId').val();
            console.log(userid)
		    $.ajax({
		        url: "/AdminServiceUser/GetServiceUserByUserId",
		        type: "post",
		        dataType: "json",
		        data: { userId: userid },
		        async: false,
		        success: function (data) {
		            console.log(data)
		            console.log('success')
		        },
		        error: function (data) {
		            console.info('fail');
		        }
		    });
		})



})

