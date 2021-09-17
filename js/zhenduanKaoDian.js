var XHRCONF = { withCredentials: true };
var sbName = "英语";
var kaodianType = "";

var tablecols = [
    [
        { field: 'index', title: '序号', width: 70 },
        { field: 'knowledgename', title: '考点名称', width: 380 },
        { field: 'knowledgetype', title: '知识点类型' },
        { field: 'wrongcount', title: '错识别题量', width: 100 },
        { field: 'losecount', title: '漏识别题量', width: 100 },
        { field: 'total', title: '总数', width: 90 },
        { field: 'pushcount', title: '推荐次数', width: 90 },
        { fixed: 'right', title: '操作', toolbar: '#dingweishiti', width: 205 }
    ]
];


function OrgQueryUrl(pagenumber, pagesize) {
    return apiconf.s_zhishidianstatic + "?pageNum=" + pagenumber + "&pageSize=" + pagesize +
        "&subjectName=" + sbName +
        "&versionName=" + versionName +
        "&kpType=" + kaodianType +
        "&kaoDianKey=" + $("#s-knowledgeName").val().trim() +
        "&minWrongCount=" + $("#s-minWrongCount").val().trim() +
        "&minLoseCount=" + $("#s-minLoseCount").val().trim() +
        "&minTotal=" + $("#s-minAllCount").val().trim() +
        "&minPushCount=" + $("#s-minPushCount").val().trim();
}

function QueryData() {
    $("#a-download-knowledge").attr("href", apiconf.s_knowledgedownloadstatic + "?subjectName=英语");

    var pagesize = 15;
    var pagenumber = 1;
    var tmpurl = OrgQueryUrl(pagenumber, pagesize);
    $.ajax({ type: "GET", url: tmpurl, xhrFields: XHRCONF, })
        .then(data => {
            let tabledata = $.map(data.data.list, (item, ind) => {
                item.index = (pagenumber - 1) * pagesize + ind + 1;
                return item;
            });

            layui.table.render({
                id: "table-latest-id",
                elem: '#table-latest',
                cellMinWidth: 80,
                height: "full-200",
                limit: 40,
                cols: tablecols,
                data: tabledata,
                even: true
            });

            layui.laypage.render({
                elem: 'paging',
                count: data.data.total,
                limit: pagesize,
                layout: ['count', 'prev', 'next', 'page', 'skip'],
                jump: function(obj) {
                    pagenumber = obj.curr;
                    let backurlpage2 = OrgQueryUrl(pagenumber, pagesize);
                    $.ajax({ type: "GET", url: backurlpage2, xhrFields: XHRCONF }).then(data => {
                        let tabledata = $.map(data.data.list, (item, ind) => {
                            item.index = (pagenumber - 1) * pagesize + ind + 1;
                            return item;
                        });
                        layui.table.render({
                            id: "table-latest-id",
                            elem: '#table-latest',
                            cellMinWidth: 80,
                            height: "full-200",
                            limit: 40,
                            cols: tablecols,
                            data: tabledata,
                            even: true
                        });
                    });
                }
            });
        });
}

$(() => {
    sbName = decodeURIComponent(getQueryVariable("subjectName"));
    versionName = decodeURIComponent(getQueryVariable("versionName"));
    sbName = sbName == "" || sbName == "false" ? "英语" : sbName;
    versionName = versionName == "false" ? "" : versionName;

    QueryData();
    $("#btn-search").click(() => {
        QueryData();
    });


    layui.table.on('tool(table-latest)', function(obj) {
        if (obj.event === 'dingweicuowu') {
            window.location.href = "checkpage-consumer-general.html?staticType=kp&sKnowledgeID=" + obj.data.id + "&stype=wrong" + "&stitle=按知识点诊断，错识别【" + obj.data.knowledgename + "】";
        }
        if (obj.event === 'dingweiyilou') {
            window.location.href = "checkpage-consumer-general.html?staticType=kp&sKnowledgeID=" + obj.data.id + "&stype=lose" + "&stitle=按知识点诊断，漏识别【" + obj.data.knowledgename + "】";
        }
    });



    $("#button-createtask").click(event => {
        var checkStatus = layui.table.checkStatus('table-latest-id'); //idTest 即为基础参数 id 对应的值
        if (checkStatus.data.length > 0) {

        } else {
            layui.layer.msg("请选择测试信息！", () => {});
            return;
        }
    });

    var tmpurl = apiconf.s_zhishidianPieStatic + "?subjectName=英语";
    $.ajax({ type: "GET", url: tmpurl, xhrFields: XHRCONF, })
        .then(data => {
            var sortData = data.data.sort((a, b) => a.value - b.value);
            var chartDom = document.getElementById('chart-kaodianfenlei');
            var myChart = echarts.init(chartDom);
            var option;



            option = {
                title: {
                    text: '按知识点类型试题数量统计',
                    subtext: '',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item'
                },
                // legend: {
                //     orient: '',
                //     left: '',
                // },
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


            var sortData2 = data.data.sort((a, b) => b.value - a.value);
            var selectelement = $('#select-knowledgeType');
            $(selectelement).empty();
            $(selectelement).append('<option value="">' + '知识点类型' + '</option>');
            $.each(sortData2, (__, item) => {
                let html = '<option value="' + item.name + '">' + item.name + '</option>';
                $(selectelement).append(html);
            });
            layui.form.on('select(select-knowledgeType)', function(data) {
                kaodianType = data.value;
            });
            layui.form.render();
        });
});