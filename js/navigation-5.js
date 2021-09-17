var myChartRate = null;
var prebutton = null;
$(function() {
    myChartRate = echarts.init($('#chartelement')[0]);
    showchart("btn-chart-knowledgelose");



    prebutton = $("#btn-chart-knowledgelose");
    $(prebutton).addClass("layui-btn-warm");
    $(".layui-btn").click(function(event) {
        // 给当前button class 加上layui-btn-warm class
        // 给上一个class 删除layui-btn-warm class
        $(prebutton).removeClass("layui-btn-warm");
        $(event.currentTarget).addClass("layui-btn-warm");
        prebutton = event.currentTarget;

        showchart(event.target.id);
    });
});

function showchart(buttonid) {
    if (myChartRate == null) {
        myChartRate = echarts.init($('#chartelement')[0]);
    }
    myChartRate.clear();

    let title = "漏识别考点类型饼状图";
    let url = apiconf.knowledgelosecountview;
    if (buttonid == "btn-chart-knowledgelose") {
        url = apiconf.knowledgelosecountview;
        title = "漏识别考点类型饼状图";
    } else if (buttonid == "btn-chart-knowledgewrong") {
        url = apiconf.knowledgewrongcountview;
        title = "错识别考点类型饼状图";
    } else if (buttonid == "ch-tiliang-weiquchong") {
        url = ""; //apiconf.knowledgewrongcountview;
        title = "语文各题型已测题量柱状图（未去重）";
    } else if (buttonid == "eng-tiliang-weiquchong") {
        url = ""; //apiconf.knowledgewrongcountview;
        title = "英语各题型已测题量柱状图（未去重）";
    } else if (buttonid == "ch-history-zhibiao") {
        url = ""; //apiconf.knowledgewrongcountview;
        title = "语文各题型历史指标线形图";
    } else if (buttonid == "ch-kaocheleixig") {
        url = ""; //apiconf.knowledgewrongcountview;
        title = "考查类型识别统计柱状图";
    } else {

        return;
    }

    if (url != "") {
        $.ajax({
            type: "GET",
            url: url,
            xhrFields: {
                withCredentials: true
            },
            success: function(data) {
                if (data.code == 200) {
                    if (myChartRate == null) {
                        myChartRate = echarts.init($('#chartelement')[0]);
                    }

                    var option;

                    option = {
                        title: {
                            text: title,
                            left: 'center'
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: '{b} : {c} ({d}%)'
                        },
                        legend: {
                            bottom: 10,
                            left: 'center'
                        },
                        series: [{
                            name: '数量',
                            type: 'pie',
                            radius: '50%',
                            data: data.data,
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }]
                    };
                    myChartRate.setOption(option);
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

    } else if (title == "语文各题型历史指标线形图") {
        if (myChartRate == null) {
            myChartRate = echarts.init($('#chartelement')[0]);
        }

        var option;
        option = {
            title: {
                text: title,
                left: 'center'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['单选题', '填空题', '改错题', '语言表达题', '作文题'],
                left: 'left'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '200px',
                containLabel: true
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                name: "时间",
                show: true,
                type: 'category',
                boundaryGap: false,
                data: ['2020-11-21', '2021-01-21', '2021-01-31', '2021-02-21', '2021-03-21', '2021-04-01', '2021-04-21']
            },
            yAxis: {
                type: 'value',
                name: "准确率",
                show: true,
            },
            series: [{
                    name: '单选题',
                    type: 'line',
                    stack: '总量',
                    data: [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
                },
                {
                    name: '填空题',
                    type: 'line',
                    stack: '总量',
                    data: [0.153, 0.23, 0.24, 0.15, 0.36, 0.57, 0.68]
                },
                {
                    name: '改错题',
                    type: 'line',
                    stack: '总量',
                    data: [0.1, 0.2, 0.3, 0.4, 0.5, 0.7, 0.9]
                },
                {
                    name: '语言表达题',
                    type: 'line',
                    stack: '总量',
                    data: [0.12, 0.23, 0.24, 0.25, 0.26, 0.37, 0.48]
                },
                {
                    name: '作文题',
                    type: 'line',
                    stack: '总量',
                    data: [0.22, 0.31, 0.44, 0.51, 0.62, 0.75, 0.88]
                }
            ]
        };
        myChartRate.setOption(option);
    } else if (title == "考查类型识别统计柱状图") {
        if (myChartRate == null) {
            myChartRate = echarts.init($('#chartelement')[0]);
        }
        var option;

        option = {
            title: {
                text: '考查类型识别统计柱状图',
                subtext: '任务名称，XXXXXXXXX测试任务'
            },
            legend: {},
            tooltip: {},
            dataset: {
                source: [
                    ['单选题', 93.3],
                    ['多选题', 83.1],
                    ['填空题', 86.4],
                    ['改错题', 72.4],
                    ['默写题', 82.4],
                    ['语言表达题', 36.4],
                    ['句子运用', 66.4],
                    ['阅读综合', 76.4],
                    ['翻译题', 96.4],
                    ['作文题', 84.4]

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
            yAxis: {
                type: 'value',
                name: "考查类型识别准确率（%）",
                show: true,
                max: '100'

            },
            // Declare several bar series, each will be mapped
            // to a column of dataset.source by default.
            series: [{
                type: 'bar',
                color: '#009688'
            }]
        };

        myChartRate.setOption(option);

    } else {

        if (myChartRate == null) {
            myChartRate = echarts.init($('#chartelement')[0]);
        }

        var option;

        option = {
            title: {
                text: title,
                subtext: '',
                left: 'center'
            },
            legend: { data: ['题量'] },
            tooltip: {},
            dataset: {
                source: [
                    ["单选题", 28676],
                    ["词汇填空", 21458],
                    ["听力选择", 5624],
                    ["阅读理解", 8959],
                    ["朗读", 1000],
                    ["完形填空", 4425],
                    ["作文", 2105],
                    ["匹配题", 3569],
                    ["翻译题", 3541],
                    ["跟读", 2964],
                    ["话题简述", 757],
                    ["改错题", 1141],
                    ["阅读简答", 821],
                    ["复述", 729],
                    ["阅读填空", 818],
                    ["情景问答", 420],
                    ["听力填空", 101],
                    ["阅读综合", 443],
                    ["听力匹配", 224],
                    ["连词成句", 301],
                    ["补全对话", 208],
                    ["听力综合", 115],
                    ["看图写句子", 110],
                    ["听力判断", 40],
                    ["配音", 11],
                    ["复合题", 10],
                    ["听力简答", 3],
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


}