$(() => {

    layui.table.on('tool(accounttasktable)', function(obj) {
        var data = obj.data;
        // 删除记录
        if (obj.event === 'lookover') {
            window.open("kaodiantesttaskaccountoverview.html", '_blank').location;
        }
    });






    $("#gotest").click(() => {
        window.open("kaodiantesttaskaccountoverview.html", '_blank').location;
    });











    let sampledata = [{
            "accountname": "笪梦雅",
            "total": 999,
            "finish": 999,
            "wrong": 44,
            "lose": 32,
            "correct": 710,
            "ccate": "83%",
            "rcate": "81%"
        },
        {
            "accountname": "陈瑞",
            "total": 999,
            "finish": 999,
            "wrong": 14,
            "lose": 30,
            "correct": 724,
            "ccate": "93%",
            "rcate": "89%"
        },
        {
            "accountname": "孟繁雪",
            "total": 999,
            "finish": 899,
            "wrong": 22,
            "lose": 32,
            "correct": 730,
            "ccate": "87%",
            "rcate": "81%"
        },
        {
            "accountname": "高思鑫",
            "total": 999,
            "finish": 876,
            "wrong": 21,
            "lose": 12,
            "correct": 674,
            "ccate": "77%",
            "rcate": "67%"
        }
    ];
    layui.table.render({
        elem: '#accounttasktable',
        cellMinWidth: 80,
        data: sampledata,
        even: true,
        cols: [
            [
                { field: 'accountname', title: '账号', width: 80, fixed: 'left' },
                { field: 'total', title: '题量', width: 60 },
                { field: 'finish', title: '已完成', width: 73 },
                { field: 'wrong', title: '错识别', width: 73 },
                { field: 'lose', title: '漏识别', width: 73 },
                { field: 'correct', title: '正确', width: 60 },
                { field: 'ccate', title: '准确率', width: 73 },
                { field: 'rcate', title: '可识别率' },
                { fixed: 'right', title: '操作', toolbar: '#side-bar1', width: 66 }
            ]
        ]
    });


    var myChartCount = echarts.init($('#chart-overview-count')[0]);
    var option = {
        xAxis: {
            type: 'category',
            data: ['已完成', '错识别', '漏识别', '完全正确']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: [{
                value: 2678,
                itemStyle: {
                    color: '#a90000'
                }
            }, 134, 165, 2457],
            type: 'bar'
        }]
    };

    myChartCount.setOption(option);

    var myChartRate = echarts.init($('#chart-overview-rate')[0]);
    var option;

    option = {
        legend: {},
        tooltip: {},
        dataset: {
            source: [
                ['type', '准确率', '可识别率'],
                ['单选题', 83.3, 85.8],
                ['填空题', 83.1, 73.4],
                ['改错题', 86.4, 65.2],
                ['阅读题-现代文', 86.4, 65.2],
                ['阅读题-文言文', 86.4, 65.2],
                ['阅读题-古诗词', 86.4, 65.2],
                ['作文题', 72.4, 53.9]
            ]
        },
        xAxis: { type: 'category' },
        yAxis: { type: 'value' },
        // Declare several bar series, each will be mapped
        // to a column of dataset.source by default.
        series: [{
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: '#c23531'
                    }
                }
            },
            {
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: '#61a0a8'
                    }
                }
            }
        ]
    };

    myChartRate.setOption(option);
});