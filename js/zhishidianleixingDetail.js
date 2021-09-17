var XHRCONF = { withCredentials: true };

$(() => {
    var statisticsQuestionTypeID = getQueryVariable("statisticsQuestionTypeID");
    var showtixing = decodeURIComponent(getQueryVariable("tixing"));
    $("#div-showtixing").text(showtixing);
    var tmpurl = apiconf.s_shitiLeiXingDetailtatic + "?sQuestionTypeId=" + statisticsQuestionTypeID;
    $.ajax({ type: "GET", url: tmpurl, xhrFields: XHRCONF, })
        .then(data => {
            layui.table.render({
                id: "table-latest-id",
                elem: '#table-latest',
                cellMinWidth: 80,
                height: "full-300",
                cols: [
                    [
                        // { type: 'radio' },
                        { type: 'numbers', title: "序号" },
                        { field: 'knowledgeType', title: '知识点类型', width: 130, style: "font-weight:bold;" },
                        { field: 'countWrong', title: '错识别题量（含多识别）', sort: true },
                        { field: 'countLose', title: '漏识别题量（含多识别）', sort: true },
                        { fixed: 'right', title: '操作', toolbar: '#tixingdingwei', width: 205 }
                    ]
                ],
                data: data.data,
                even: true,
                limit: 100
            });

            var chartOneData = $.map(data.data, ee => {
                if (ee.countWrong > 0) {
                    return {
                        name: ee.knowledgeType,
                        value: ee.countWrong
                    }
                }
            });
            InitChartOne(chartOneData);
            var chartTwoData = $.map(data.data, ee => {
                if (ee.countLose > 0) {
                    return {
                        name: ee.knowledgeType,
                        value: ee.countLose
                    }
                }
            });
            InitChartTwo(chartTwoData);
            layui.table.on('tool(table-latest)', function(obj) {
                if (obj.event === 'dingweicuowu') {
                    window.location.href = "checkpage-consumer-general.html?staticType=kptype&SQuestionTypeID=" + statisticsQuestionTypeID +
                        "&KnowledgeTypeName=" + obj.data.knowledgeType +
                        "&stype=wrong" +
                        "&stitle=按“题型-知识点类型”诊断，错识别【" + showtixing + "-" + obj.data.knowledgeType + "】";
                }
                if (obj.event === 'dingweiyilou') {
                    window.location.href = "checkpage-consumer-general.html?staticType=kptype&SQuestionTypeID=" + statisticsQuestionTypeID +
                        "&KnowledgeTypeName=" + obj.data.knowledgeType +
                        "&stype=lose" +
                        "&stitle=按“题型-知识点类型”诊断，漏识别【" + showtixing + "-" + obj.data.knowledgeType + "】";
                }
            });
        });

    $("#button-createtask").click(event => {
        var checkStatus = layui.table.checkStatus('table-latest-id'); //idTest 即为基础参数 id 对应的值
        if (checkStatus.data.length == 1) {
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
                    area: ['520px', '290px'],
                    success: _ => {
                        $("#new-tixing").text(showtixing);
                        $("#new-zhishidianType").text(checkStatus.data[0].knowledgeType);
                        $("#new-tiliang-wrong").text(checkStatus.data[0].countWrong);
                        $("#new-tiliang-lose").text(checkStatus.data[0].countLose);

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

function InitChartOne(dataList) {
    var sortData = dataList.sort((a, b) => a.value - b.value);
    var chartDom = document.getElementById('chart-kaodianfenlei');
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        title: {
            text: '知识点类型相关题量统计（错识别）',
            subtext: '',
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        series: [{
            name: '访问来源',
            type: 'pie',
            radius: '50%',
            data: sortData,
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };

    myChart.setOption(option);
}

function InitChartTwo(dataList) {
    var sortData = dataList.sort((a, b) => a.value - b.value);
    var chartDom = document.getElementById('chart-kaodianfenlei2');
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        title: {
            text: '知识点类型相关题量统计（漏识别）',
            subtext: '',
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        series: [{
            name: '访问来源',
            type: 'pie',
            radius: '50%',
            data: sortData,
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };

    myChart.setOption(option);

}