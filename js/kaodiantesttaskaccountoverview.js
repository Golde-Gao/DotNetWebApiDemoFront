$(() => {
    layui.form.render();
    layui.laydate.render({
        elem: '#daterangeselect',
        range: true
    });




    let sampledata = [{
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 2,
        "wrongcount": 1,
        "correctcount": 2,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000365",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 2,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100030234",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 2,
        "losecount": 1,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000665",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100007865",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 4,
        "losecount": 2,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100045545",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 6,
        "losecount": 1,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100343445",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 2,
        "losecount": 1,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100008886",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 1,
        "losecount": 1,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100003421",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 6,
        "losecount": 1,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "10002223",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }, {
        "testentityid": "100000345",
        "stemview": "这是一个题的题干，题干说这个题是语文题",
        "status": "已审核",
        "allcount": 3,
        "losecount": 0,
        "wrongcount": 0,
        "correctcount": 0,
        "lastoperationtime": "2021-03-05 09:28:37"
    }];
    layui.table.render({
        elem: '#paging-table',
        cellMinWidth: 80,
        data: sampledata,
        height: "full-200",
        cols: [
            [
                { type: 'numbers', title: '序号', fixed: 'left' },
                { field: 'testentityid', title: '试题ID', width: 120 },
                { field: 'stemview', title: '题干', width: 420 },
                { field: 'status', title: '审核状态' },
                { field: 'allcount', title: '总识别数' },
                { field: 'losecount', title: '漏识别数' },
                { field: 'wrongcount', title: '错识别数' },
                { field: 'correctcount', title: '正确数' },
                { field: 'lastoperationtime', title: '上次操作时间' },
                { fixed: 'right', title: '#', toolbar: '#side-bar1', width: 66 }
            ]
        ],
        page: {
            limit: 20,
            limits: [10, 20, 30, 50],
            layout: ['limit', 'count', 'prev', 'next', 'page', 'skip']
        }
    });
    //监听行工具事件
    layui.table.on('tool(paging-table)', function(obj) {
        var data = obj.data;
        if (obj.event === 'lookover') {
            window.open("checkpage.html", '_blank').location;
        }
    });
    // 打

});