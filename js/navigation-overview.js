var myChart = null;
var loadindextmp = 0;
var THEIGHT = 0;
var sbName = "英语";
var versionName = "";
XHRCONF = { withCredentials: true };
$(function() {
    sbName = decodeURIComponent(getQueryVariable("subjectName"));
    versionName = decodeURIComponent(getQueryVariable("versionName"));
    sbName = sbName == "" || sbName == "false" ? "英语" : sbName;
    versionName = versionName == "false" ? "" : versionName;

    $("#span-subjectName").text(sbName);
    $("#span-versionName").text(versionName == "" ? "不区分阶段" : versionName);

    $("#a-openmore").attr("href", "zhenduanKaoDian.html?subjectName=" + sbName + "&versionName=" + versionName);

    loadindextmp = layer.load(0, { shade: 0.25 });

    THEIGHT = (window.innerHeight - 240) * 0.5;

    InitData();
    EventRegister();
    LoadGlobalMsg();

})

function LoadGlobalMsg() {
    var tmpurl = apiconf.s_globalstatic + "?subjectName=" + sbName + "&versionName=" + versionName;
    $.ajax({ type: "GET", url: tmpurl, xhrFields: XHRCONF, })
        .then(data => {
            var alll = (data.data.questionTotalCount + '').replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, '$1,');
            $("#span-total").text(alll);
            if (data.data.keShiBieLvChange > 0) {
                $("#span-keshibielv").css("color", "red");
                var ttt = data.data.keShiBieLv + "%" + "(↑" + data.data.keShiBieLvChange + "%)"
                $("#span-keshibielv").text(ttt);
            } else if (data.data.keShiBieLvChange == 0) {
                var ttt = data.data.keShiBieLv + "%" + "(" + data.data.keShiBieLvChange + "%)"
                $("#span-keshibielv").css("color", "black");
                $("#span-keshibielv").text(ttt);
            } else {
                var ttt = data.data.keShiBieLv + "%" + "(↓" + data.data.keShiBieLvChange + "%)"
                $("#span-keshibielv").css("color", "#009688");
                $("#span-keshibielv").text(ttt);
            }

            if (data.data.shiBieZhunQueLvChange > 0) {
                $("#span-shiBieZhunQueLv").css("color", "red");
                var ttt = data.data.shiBieZhunQueLv + "%" + "(↑" + data.data.shiBieZhunQueLvChange + "%)"
                $("#span-shiBieZhunQueLv").text(ttt);
            } else if (data.data.shiBieZhunQueLvChange == 0) {
                var ttt = data.data.shiBieZhunQueLv + "%" + "(" + data.data.shiBieZhunQueLvChange + "%)"
                $("#span-shiBieZhunQueLv").css("color", "black");
                $("#span-shiBieZhunQueLv").text(ttt);
            } else {
                var ttt = data.data.shiBieZhunQueLv + "%" + "(↓" + data.data.shiBieZhunQueLvChange + "%)"
                $("#span-shiBieZhunQueLv").css("color", "#009688");
                $("#span-shiBieZhunQueLv").text(ttt);
            }
        });
}


function EventRegister() {
    $("#div-selectsubjectversion").click(_ => {
        layer.open({
            type: 1,
            title: '<b>选择学科、学习阶段</b>',
            shade: 0,
            anim: 5,
            btn: "Ok",
            isOutAnim: false,
            content: $('#div-select'),
            area: ['400px', '400px'],
            end: _ => $("#div-select").hide(),
            success: function() {
                $("#s_subjectName").val(sbName);
                $("#s_versionName").val(versionName);
                layui.form.render();
            },

            yes: function() {
                window.location.href = "/navigation.html?subjectName=" + sbName + "&versionName=" + versionName;
            }
        });
    });
    layui.form.on('select(s_subjectName)', function(data) {
        sbName = data.value;
    });
    layui.form.on('select(s_versionName)', function(data) {
        versionName = data.value;
    });
}

function InitData() {
    InitChart();
}

function InitChart() {

    var tmpurl = apiconf.s_globalChartstatic + "?subjectName=" + sbName + "&versionName=" + versionName;
    $.ajax({ type: "GET", url: tmpurl, xhrFields: XHRCONF, })
        .then(resData => {
            InitTiXingZhenDuan();

            var chartData = resData.data;
            var chartID = 'chart-kaodianzonghe';
            myChart = myChart == null ? echarts.init(document.getElementById(chartID)) : myChart;
            var selectConf = {};
            var zhibiaoConf = [];
            $.each(chartData.titles, (idx, ee) => {
                selectConf[ee] = idx == 0 ? true : false;

                var zhunlv = chartData.shiBieZhunQueLvs[idx];
                var shibiezhunquelv = {
                    name: zhunlv.title,
                    type: 'line',
                    silent: true,
                    showSymbol: false,
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    data: zhunlv.datas,
                    lineStyle: { type: "solid" },
                }
                zhibiaoConf.push(shibiezhunquelv);

                var kev = chartData.keShiBieLvs[idx];
                var keshibielv = {
                    name: kev.title,
                    type: 'line',
                    silent: true,
                    showSymbol: false,
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    data: kev.datas,
                    lineStyle: { type: "solid" },
                }
                zhibiaoConf.push(keshibielv);
            });


            var option = {
                title: [{
                    top: "52%",
                    left: 'center',
                    text: '识别准确率',
                    gridIndex: 0,
                }, {
                    bottom: "0%",
                    left: 'center',
                    text: '可识别率',
                    gridIndex: 1,
                }],
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: chartData.titles,
                    selected: selectConf,
                    top: '0%'
                },
                grid: [
                    { left: '5%', top: '18%', width: '90%', height: '30%' },
                    { left: '5%', bottom: '8%', width: '90%', height: '30%' }
                ],
                toolbox: {
                    feature: {
                        restore: { title: "还原" }
                    },
                    right: "0%",
                    top: "20%"
                },
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    name: "时间",
                    gridIndex: 0,
                    nameTextStyle: {
                        width: 50
                    },
                    data: chartData.times
                }, {
                    type: 'category',
                    boundaryGap: false,
                    name: "时间",
                    gridIndex: 1,
                    nameTextStyle: {
                        width: 50
                    },
                    data: chartData.times
                }],
                yAxis: [{
                    type: 'value',
                    name: "指标（%）",
                    show: true,
                    gridIndex: 0,
                    max: '100'

                }, {
                    type: 'value',
                    name: "指标（%）",
                    show: true,
                    gridIndex: 1,
                    max: '100'

                }],
                series: zhibiaoConf
            };
            myChart.setOption(option);

        });
}


function InitTiXingZhenDuan() {

    var tmpurl = apiconf.s_tixingstatic + "?subjectName=" + sbName + "&versionName=" + versionName;
    $.ajax({ type: "GET", url: tmpurl, xhrFields: XHRCONF, })
        .then(data => {
            InitZhiShiDianZhenDuan();
            layui.table.render({
                elem: '#table-latest',
                cellMinWidth: 80,
                height: THEIGHT,
                cols: [
                    [
                        { type: 'numbers', title: '序号' },
                        { field: 'questionTypeName', title: '题型', style: "font-weight:bold;" },
                        { field: 'questionTotalCount', title: '统计量', sort: true },
                        {
                            field: 'keShiBieLv',
                            title: '可识别率',
                            width: 115,
                            sort: true,
                            style: "font-weight:bold;color:black;",
                            templet: function(d) {
                                var tmp = (d.keShiBieLv * 100 + "").replace(/(?<=\.[0-9]{2})[0-9]+/g, "");
                                tmp = tmp == "0" ? tmp : tmp + "%";
                                return '<span>' + tmp + '</span>';
                            }
                        },
                        {
                            field: 'keShiBieLvChange',
                            title: '较上次',
                            width: 90,
                            sort: true,
                            style: "font-weight:bold;color:black;",
                            templet: function(d) {
                                var tmp = (d.keShiBieLvChange * 100 + "").replace(/(?<=\.[0-9]{2})[0-9]+/g, "");
                                tmp = tmp == "0" ? tmp : tmp + "%";
                                return '<span>' + tmp + '</span>';
                            }

                        },
                        {
                            field: 'shiBieZhunQueLv',
                            title: '识别准确率',
                            width: 120,
                            sort: true,
                            style: "font-weight:bold;color:black;",
                            templet: function(d) {
                                var tmp = (d.shiBieZhunQueLv * 100 + "").replace(/(?<=\.[0-9]{2})[0-9]+/g, "");
                                tmp = tmp == "0" ? tmp : tmp + "%";
                                return '<span>' + tmp + '</span>';
                            }
                        },
                        {
                            field: 'shiBieZhunQueLvChange',
                            title: '较上次',
                            width: 90,
                            sort: true,
                            style: "font-weight:bold;color:black;",
                            templet: function(d) {
                                var tmp = (d.shiBieZhunQueLvChange * 100 + "").replace(/(?<=\.[0-9]{2})[0-9]+/g, "");
                                tmp = tmp == "0" ? tmp : tmp + "%";
                                return '<span>' + tmp + '</span>';
                            }
                        },
                        { fixed: 'right', title: '操作', toolbar: '#tixingdingwei', width: 80 }
                    ]
                ],
                limit: 200,
                data: data.data,
                even: true
            });
            layui.table.on('tool(table-latest)', function(obj) {
                if (obj.event === 'dingweicuowu') {
                    window.location.href = "http://172.16.63.109:8088/checkpage-consumer-admin.html?taskid=1000134&shitiindex=0&taskname=undefined&newresultstatus=&checkstatus=&currentshitiid=&userid=1007";
                }
                if (obj.event === 'leixingdetail') {
                    if (obj.data.questionTotalCount > 0) {
                        window.location.href = "zhishidianleixingDetail.html?statisticsQuestionTypeID=" + obj.data.statisticsQuestionTypeID + "&tixing=" + obj.data.questionTypeName;
                    } else {
                        layui.layer.msg("不存在相关测试试题");
                    }
                }
            });
        });
}

function InitZhiShiDianZhenDuan() {
    var tmpurl = apiconf.s_zhishidianstatic + "?subjectName=" + sbName + "&versionName=" + versionName;
    $.ajax({ type: "GET", url: tmpurl, xhrFields: XHRCONF, })
        .then(data => {
            data.data.list.push({
                "knowledgename": "--- ---",
                "wrongcount": "---",
                "losecount": "---",
                "total": "---",
                "pushcount": "---"
            });
            layui.table.render({
                elem: '#table-kaodian-diagnose',
                cellMinWidth: 80,
                height: THEIGHT,
                cols: [
                    [
                        { field: 'knowledgename', title: '知识点名称' },
                        { field: 'knowledgetype', title: '知识点类型', width: 120 },
                        { field: 'wrongcount', title: '错识别数', width: 90 },
                        { field: 'losecount', title: '漏识别数', width: 90 },
                        { field: 'total', title: '统计总量', width: 90 },
                        { field: 'pushcount', title: '推荐次数', width: 90 }
                    ]
                ],
                limit: 200,
                data: data.data.list,
                even: true
            });
            layer.close(loadindextmp);
        });



}