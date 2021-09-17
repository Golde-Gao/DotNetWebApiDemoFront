var prebutton = null;
var tableconf = null;
var myChartRate = null;
$(function() {
    let width = $('#display-area').css("width");
    $('#chartelement').css("width", width)
    myChartRate = echarts.init($('#chartelement')[0]);
    tableconf = [{
            type: "front",
            buttonid: "btn-subject-tixing",
            url: apiconf.questionpropertyTixing,
            colsconf: [
                [
                    { type: 'numbers', title: '序号' },
                    { field: 'subjectName', title: '学科名称' },
                    { field: 'subjectCode', title: '学科编码' },
                    { field: 'questionTypeName', title: '题型名称' },
                    { field: 'questionTypeCode', title: '题型编码' },
                    { field: 'tixingCount', title: '试题数量' }
                ]
            ],
            title: "【学科-题型】信息",
            startpage: 1,
            currpage: 1,
            pagesize: 15,
            confheight: "full-230"
        }, {
            type: "front",
            buttonid: "btn-shiticonf-all",
            url: apiconf.questionproperty,
            colsconf: [
                [
                    { type: 'numbers', title: '序号' },
                    { field: 'groupid', width: 80, title: 'ID', sort: true },
                    { field: 'subjectcode', title: '学科编码' },
                    { field: 'subjectname', title: '学科名称' },
                    { field: 'versioncode', title: '学习阶段编码' },
                    { field: 'versionname', title: '学习阶段名称' },
                    { field: 'questiontypecode', title: '题型编码' },
                    { field: 'questiontypename', title: '题型名称' },
                    { field: 'genrecode', title: '题材编码' },
                    { field: 'genrename', title: '题材名称' }
                ]
            ],
            title: "试题配置信息",
            startpage: 1,
            currpage: 1,
            pagesize: 15,
            confheight: "full-230"
        },
        {
            type: "front",
            buttonid: "btn-subject-tixing",
            url: apiconf.questionproperty,
            colsconf: [
                [
                    { type: 'numbers', title: '序号' },
                    { field: 'groupid', width: 80, title: 'ID', sort: true },
                    { field: 'subjectcode', title: '学科编码' },
                    { field: 'subjectname', title: '学科名称' },
                    { field: 'versioncode', title: '学习阶段编码' },
                    { field: 'versionname', title: '学习阶段名称' },
                    { field: 'questiontypecode', title: '题型编码' },
                    { field: 'questiontypename', title: '题型名称' },
                    { field: 'genrecode', title: '题材编码' },
                    { field: 'genrename', title: '题材名称' }
                ]
            ],
            title: "学科配置信息",
            startpage: 1,
            currpage: 1,
            pagesize: 15,
            confheight: "full-270"
        },
        {
            type: "front",
            buttonid: "btn-tixing-all",
            url: apiconf.getalltixing,
            colsconf: [
                [
                    { type: 'numbers', title: '序号' },
                    { field: 'id', width: 80, title: 'ID', sort: true },
                    { field: 'code', title: '题型编码' },
                    { field: 'name', title: '题型名称' },
                    { field: 'memo', title: '备注' }
                ]
            ],
            title: "题型信息",
            startpage: 1,
            currpage: 1,
            pagesize: 15,
            confheight: "full-230"
        },
        {
            type: "front",
            buttonid: "btn-ticai-all",
            url: apiconf.getallgenre,
            colsconf: [
                [
                    { type: 'numbers', title: '序号' },
                    { field: 'id', width: 80, title: 'ID', sort: true },
                    { field: 'code', title: '体裁编码' },
                    { field: 'name', title: '体裁名称' },
                    { field: 'memo', title: '备注' }
                ]
            ],
            title: "体裁信息",
            startpage: 1,
            currpage: 1,
            pagesize: 15,
            confheight: "full-230"
        },
        {
            type: "back",
            buttonid: "btn-log-all",
            url: apiconf.getalloperation,
            colsconf: [
                [
                    { type: 'numbers', title: '序号' },
                    { field: 'id', width: 140, title: 'ID', sort: true },
                    { field: 'operDesc', title: '操作描述' },
                    { field: 'operUsername', title: '操作执行用户' },
                    { field: 'operIp', title: '用户登录IP' },
                    { field: 'operCreatetime', title: '操作时间' },
                ]
            ],
            title: "系统日志",
            startpage: 1,
            currpage: 1,
            pagesize: 100,
            confheight: "full-280"
        },
        {
            type: "back",
            buttonid: "btn-shitireview-all",
            url: apiconf.questiondetail,
            colsconf: [
                [
                    { type: 'numbers', title: '序号' },
                    { field: 'entityid', width: 140, title: 'ID', sort: true },
                    { field: 'subjectname', title: '学科' },
                    { field: 'versionname', title: '学习阶段' },
                    { field: 'questiontypename', title: '题型' },
                    { field: 'genrename', title: '体裁' },
                    { field: 'entityxml', title: '详情' },
                ]
            ],
            title: "试题预览",
            startpage: 1,
            currpage: 1,
            pagesize: 100,
            confheight: "full-280"
        }
    ];
    loadView("btn-shiticonf-all");

    prebutton = $("#btn-shiticonf-all");
    $(prebutton).addClass("layui-btn-warm");
    $(".layui-btn").click(function(event) {
        // 给当前button class 加上layui-btn-warm class
        // 给上一个class 删除layui-btn-warm class
        $(prebutton).removeClass("layui-btn-warm");
        $(event.currentTarget).addClass("layui-btn-warm");
        prebutton = event.currentTarget;

        loadView(event.target.id);
    });
});

function loadView(targetid) {
    var conf = $.grep(tableconf, item => item.buttonid == targetid)[0];


    loadTable(conf);
    // $("#chartelement").css("height", "500px");
    if (conf.title == '【学科-题型】信息') {
        $("#chart-message").hide();
        $("#chartelement").show();
        loadChart("【学科-题型】题量柱状图");
    } else {
        clearChart();
        $("#chart-message").hide();
        $("#chart-message").show(10);
        $("#chartelement").hide();
    }
}

function clearChart() {
    $("#chartelement").css("height", "0px");

    myChartRate.clear();
}

function loadChart(chartname) {
    if (chartname == "【学科-题型】题量柱状图") {
        tiliangbargraph(chartname);
    }
}

function tiliangbargraph(chartname) {
    var option;

    option = {
        title: {
            text: chartname,
            subtext: '',
            left: 'center'
        },
        legend: { data: ['题量'] },
        tooltip: {},
        dataset: {
            source: [
                ["单选题", 58793],
                ["词汇填空", 42511],
                ["听力选择", 23975],
                ["阅读理解", 18556],
                ["朗读", 6941],
                ["完形填空", 6411],
                ["作文", 5504],
                ["匹配题", 5403],
                ["翻译题", 4553],
                ["跟读", 3274],
                ["话题简述", 1757],
                ["改错题", 1748],
                ["阅读简答", 1321],
                ["复述", 1229],
                ["阅读填空", 1118],
                ["情景问答", 820],
                ["听力填空", 801],
                ["阅读综合", 743],
                ["听力匹配", 624],
                ["连词成句", 409],
                ["补全对话", 268],
                ["听力综合", 225],
                ["看图写句子", 181],
                ["听力判断", 180],
                ["配音", 113],
                ["复合题", 100],
                ["听力简答", 13],
                ["听写", 0],
                ["阅读匹配", 0],
                ["口语简述", 0],
                ["口语问答", 0],
                ["口语对话", 0],
                ["口头作文", 0]
            ]
        },
        xAxis: {
            type: 'category',
            name: "题型",
            show: true,
            axisLabel: {
                show: true,
                interval: 0,
                overflow: "breakAll",
                rotate: -45
            }
        },
        yAxis: { type: 'value', name: "题量", show: true },
        // Declare several bar series, each will be mapped
        // to a column of dataset.source by default.
        series: [{
            type: 'bar',
            itemStyle: {
                normal: {
                    color: '#00782D'
                }
            }
        }]
    };
    myChartRate.setOption(option);
}

function loadTable(conf) {
    if (conf.type == "front") {
        //隐藏后端分页条
        $("#paging-bar").hide();
        let pagenumber = conf.startpage;
        let pagesize = conf.pagesize;
        let backurl = conf.url + "?pageNum=" + pagenumber + "&pageSize=" + pagesize;
        $.ajax({
            type: "GET",
            url: backurl,
            xhrFields: {
                withCredentials: true
            },
            success: function(data) {
                if (data.code == 200) {
                    layui.table.render({
                        elem: '#paging-table',
                        cellMinWidth: 80,
                        height: conf.confheight,
                        cols: conf.colsconf,
                        limit: pagesize,
                        data: data.data,
                        even: true,
                        page: {
                            limit: pagesize,
                            limits: [10, 15, 30, 60, 100, 300, 600],
                            layout: ['limit', 'count', 'prev', 'next', 'page', 'skip']
                        }
                    });
                    $("#table-title").empty();
                    $("#table-title").append("<b>" + conf.title + "</b>");
                } else {
                    layer.open({
                        skin: "layui-layer-molv",
                        content: "暂无权限查看",
                        time: 1200
                    });
                }
            },
            error() {
                layer.open({
                    skin: "layui-layer-molv",
                    content: "代码报错啦，请联系管理员",
                    time: 0
                });
            }
        });
    } else if (conf.type == "back") {
        $("#paging-bar").show();
        let pagenumber = conf.startpage;
        let pagesize = conf.pagesize;
        let backurl = conf.url + "?pageNum=" + pagenumber + "&pageSize=" + pagesize;
        $.ajax({
            type: "GET",
            url: backurl,
            xhrFields: {
                withCredentials: true
            },
            success: function(data) {
                if (data.code == 200) {
                    layui.table.render({
                        elem: '#paging-table',
                        cellMinWidth: 80,
                        height: conf.confheight,
                        cols: conf.colsconf,
                        limit: pagesize,
                        data: data.data.list,
                        even: true
                    });
                    $("#table-title").empty();
                    $("#table-title").append("<b>" + conf.title + "</b>");
                    layui.laypage.render({
                        elem: 'paging-bar',
                        count: data.data.total,
                        limit: pagesize,
                        layout: ['count', 'prev', 'next', 'page', 'skip'],
                        jump: function(obj) {
                            pagenumber = obj.curr;
                            backurl = conf.url + "?pageNum=" + pagenumber + "&pageSize=" + pagesize;
                            $.ajax({
                                type: "GET",
                                url: backurl,
                                xhrFields: {
                                    withCredentials: true
                                },
                                success: function(data) {
                                    layui.table.render({
                                        elem: '#paging-table',
                                        cellMinWidth: 80,
                                        height: conf.confheight,
                                        cols: conf.colsconf,
                                        limit: pagesize,
                                        data: data.data.list,
                                        even: true
                                    });
                                    $("#data-table1-title").empty();
                                    $("#data-table1-title").append("<b>" + conf.title + "</b>");
                                }
                            });
                        }
                    });

                } else {
                    layer.open({
                        skin: "layui-layer-molv",
                        content: "暂无权限查看",
                        time: 1200
                    });
                }
            },
            error() {
                layer.open({
                    skin: "layui-layer-molv",
                    content: "代码报错啦，请联系管理员",
                    time: 0
                });
            }
        });
    }
}