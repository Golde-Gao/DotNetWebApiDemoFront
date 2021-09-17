var XHRCONF = { withCredentials: true };

$(() => {
    layui.table.render({
        id: "table-latest-id",
        elem: '#table-latest',
        cellMinWidth: 80,
        height: "full-200",
        cols: [
            [
                { type: 'radio' },
                { field: 'category', title: '项目', width: 100, style: "font-weight:bold;" },
                { field: 'count', title: '统计量', width: 110 },
                { field: 'countWrong', title: '错识别试题量（含多识别）' },
                { field: 'countLose', title: '漏识别试题量（含多识别）' },
                // { field: 'calculateTime', title: '统计时间', width: 170 },
                { field: 'keshibielv', title: '可识别率', width: 120, sort: true, style: "font-weight:bold;color:black;" },
                // { title: '操作', toolbar: '#dingweishiti', width: 100 },
                { field: 'zhunquelv', title: '识别准确率', width: 120, sort: true, style: "font-weight:bold;color:black;" },
                { fixed: 'right', title: '操作', toolbar: '#dingweishiti', width: 340 }
            ]
        ],


        data: [{
            "category": "总体",
            "zhunquelv": "92%",
            "keshibielv": "91%",
            "count": "2000",
            "countWrong": "344",
            "countLose": "234",
            "calculateTime": "2021-06-20 10:47:55"
        }, {
            "category": "单选题",
            "zhunquelv": "96%",
            "keshibielv": "92.6%",
            "count": "30000",
            "countWrong": "76",
            "countLose": "86",
            "calculateTime": "2021-06-20 10:47:55"
        }, {
            "category": "词汇填空",
            "zhunquelv": "94%",
            "keshibielv": "92%",
            "count": "3433",
            "countWrong": "3412",
            "countLose": "33",
            "calculateTime": "2021-06-20 10:47:55"
        }, {
            "category": "听力选择",
            "zhunquelv": "96%",
            "keshibielv": "95%",
            "count": "2300",
            "countWrong": "34",
            "countLose": "234",
            "calculateTime": "2021-06-20 10:47:55"
        }, {
            "category": "阅读理解",
            "zhunquelv": "91%",
            "keshibielv": "91.9%",
            "count": "1222",
            "countWrong": "34",
            "countLose": "234",
            "calculateTime": "2021-06-20 10:47:55"
        }, {
            "category": "完形填空",
            "zhunquelv": "93.4%",
            "keshibielv": "94%",
            "count": "4000",
            "countWrong": "23",
            "countLose": "21",
            "calculateTime": "2021-06-20 10:47:55"
        }, {
            "category": "作文",
            "zhunquelv": "95%",
            "keshibielv": "95%",
            "count": "2333",
            "countWrong": "2354",
            "countLose": "33",
            "calculateTime": "2021-06-20 10:47:55"
        }, {
            "category": "语言表达",
            "zhunquelv": "95%",
            "keshibielv": "95%",
            "count": "2333",
            "countWrong": "333",
            "countLose": "234",
            "calculateTime": "2021-06-20 10:47:55"
        }, {
            "category": "阅读综合",
            "zhunquelv": "95%",
            "keshibielv": "95%",
            "count": "2333",
            "countWrong": "22",
            "countLose": "1",
            "calculateTime": "2021-06-20 10:47:55"
        }, {
            "category": "听力填空",
            "zhunquelv": "95%",
            "keshibielv": "95%",
            "count": "2333",
            "countWrong": "543",
            "countLose": "23",
            "calculateTime": "2021-06-20 10:47:55"
        }, {
            "category": "听力选择",
            "zhunquelv": "95%",
            "keshibielv": "95%",
            "count": "2333",
            "countWrong": "435",
            "countLose": "112",
            "calculateTime": "2021-06-20 10:47:55"
        }],
        even: true
    });
    layui.table.on('tool(table-latest)', function(obj) {
        if (obj.event === 'dingweicuowu') {
            window.location.href = "checkpage-consumer-admin.html?taskid=1000134&shitiindex=0&taskname=undefined&newresultstatus=&checkstatus=&currentshitiid=&userid=1007";
        }
        if (obj.event === 'leixingdetail') {
            window.location.href = "zhishidianleixingDetail.html";
        }
    });
    $("#button-createtask").click(event => {
        var checkStatus = layui.table.checkStatus('table-latest-id'); //idTest 即为基础参数 id 对应的值
        if (checkStatus.data.length > 0) {
            if (checkStatus.data[0].category != "总体") {
                layer.open({
                    id: "testtask",
                    type: 1,
                    title: '<div><b>新建针对性测试任务</b></div>',
                    shadeClose: true,
                    shade: 0,
                    anim: 5,
                    btn: "Ok",
                    isOutAnim: false,
                    content: $('#div-createtask'),
                    area: ['520px', '260px'],
                    success: _ => {
                        $("#new-tixing").text(checkStatus.data[0].category);
                        $("#new-tiliang").text(checkStatus.data[0].count);
                    },
                    end: _ => {
                        $("#div-createtask").hide();
                    }
                });
            } else {
                layui.layer.msg("不能针对整体试题创建任务", () => {})
            }

        } else {
            layui.layer.msg("请选择测试信息！", () => {})
        }
    });

});