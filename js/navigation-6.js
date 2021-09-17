let currtable = null;
let currdata = null;
$(function() {
    querypage();

    $("#btn-add").click(function() {
        layer.open({
            type: 1,
            offset: "auto",
            id: 'popup-add',
            content: $("#account-popup"),
            btn: '确定',
            btnAlign: 'r',
            title: "<b>新增测试账号</b>",
            area: ["500px", "410px"],
            success: function() {
                $("#c-name").val("");
                $("#c-password").val("");
                $("#c-memo").val("");
                $("#c-accounttype").val("");
                layui.form.render();
            },
            yes: function() {
                let name = $("#c-name").val().trim();
                let password = $("#c-password").val().trim();
                let memo = $("#c-memo").val().trim();
                let roleid = $("#c-accounttype").val().trim();

                if (name == "" || password == "" || memo == "" || roleid == "") {
                    return layer.open({ skin: "layui-layer-molv", content: "信息不完整", time: 1200 });
                }

                let createModel = {
                    "name": name,
                    "password": password,
                    "memo": memo,
                    "roleid": roleid
                };

                let createdata = JSON.stringify(createModel);
                $.ajax({
                    type: "POST",
                    url: apiconf.adduser,
                    contentType: "application/json",
                    data: createdata,
                    xhrFields: { withCredentials: true },
                    success: function(data) {
                        if (data.code == 200) {
                            layer.closeAll();
                            querypage();
                        } else {
                            layer.closeAll();
                            layer.open({
                                skin: "layui-layer-molv",
                                content: "规则限制，未添加成功",
                                time: 0
                            });
                        }
                    },
                    error() {
                        layer.closeAll();
                        layer.open({
                            skin: "layui-layer-molv",
                            content: "代码报错啦，请联系管理员",
                            time: 0
                        });
                    }
                });
            },
            end: function() {
                $("#account-popup").hide();
            }
        });
    });
});

function querypage() {
    var conf = {
        type: "front",
        page: null,
        url: apiconf.findalluser,
        colsconf: [
            [
                { type: 'numbers', title: '序号' },
                { field: 'id', width: 80, title: 'ID', sort: true },
                { field: 'name', title: '账号名' },
                { field: 'password', title: '密码' },
                { field: 'memo', title: '备注' },
                { field: 'roleid', title: '角色编码', sort: true },
                { fixed: 'right', title: '操作', toolbar: '#side-bar', width: 115 }
            ]
        ],
        title: "账号信息管理",
        startpage: 1,
        pagesize: 15
    };

    let pagesize = conf.pagesize;
    let backurl = conf.url;
    $.ajax({
        type: "GET",
        url: backurl,
        xhrFields: {
            withCredentials: true
        },
        success: function(data) {
            if (data.code == 200) {
                currdata = data.data;
                currtable = layui.table.render({
                    elem: '#paging-table',
                    cellMinWidth: 80,
                    height: "full-180",
                    cols: conf.colsconf,
                    data: currdata,
                    even: true,
                    page: {
                        limit: pagesize,
                        limits: [10, 15, 30, 60, 100, 300, 600],
                        layout: ['limit', 'count', 'prev', 'next', 'page', 'skip']
                    }
                });

                //监听行工具事件
                layui.table.on('tool(paging-table)', function(obj) {
                    var data = obj.data;
                    // 删除账户
                    if (obj.event === 'del') {
                        layer.confirm('确定要删除这个测试账号吗？<br>账号名：【' + data.name + '】', function() {
                            layer.confirm('真的要删除这个用户吗？【' +
                                data.name +
                                '】<br>删除后，该账号的其他任务信息等也将被关联删除，且不可恢复，所以，真的要删除吗？',
                                function(index) {
                                    let deletedata = '{"id":' + data.id + '}';
                                    $.ajax({
                                        type: "POST",
                                        url: apiconf.deleteuser,
                                        contentType: "application/json",
                                        data: deletedata,
                                        xhrFields: { withCredentials: true },
                                        success: function() { querypage(); },
                                        error: function() {
                                            layer.open({
                                                skin: "layui-layer-molv",
                                                content: "删除失败，请联系管理员",
                                                time: 2000
                                            });
                                            layer.close(index);
                                        }
                                    });
                                    layer.close(index);
                                });
                        });
                    }
                    // 编辑账户 
                    else if (obj.event === 'edit') {
                        layer.open({
                            type: 1,
                            offset: "auto",
                            id: 'user-edit',
                            content: $("#account-popup"),
                            btn: '确定',
                            btnAlign: 'r',
                            title: "编辑测试账号",
                            area: ["500px", "410px"],
                            success: function() {
                                $("#c-name").val(data.name);
                                $("#c-password").val(data.password);
                                $("#c-memo").val(data.memo);
                                $("#c-accounttype").val(data.roleid);
                                layui.form.render();
                            },
                            yes: function() {
                                let name = $("#c-name").val().trim();
                                let password = $("#c-password").val().trim();
                                let memo = $("#c-memo").val().trim();
                                let roleid = $("#c-accounttype").val().trim();

                                if (name == "" || password == "" || memo == "" || roleid == "") {
                                    return layer.open({ skin: "layui-layer-molv", content: "信息不完整", time: 1200 });
                                }

                                let updateModel = {
                                    "id": data.id,
                                    "name": name,
                                    "password": password,
                                    "memo": memo,
                                    "roleid": roleid
                                };

                                let updatedata = JSON.stringify(updateModel);
                                $.ajax({
                                    type: "POST",
                                    url: apiconf.updateuser,
                                    contentType: "application/json",
                                    data: updatedata,
                                    xhrFields: { withCredentials: true },
                                    success: function() {
                                        querypage();
                                        layer.closeAll();
                                    }
                                });
                            },
                            end: function() {
                                $("#account-popup").hide();
                            }

                        });
                    }
                });

                $("#table-title").empty();
                $("#table-title").append("<b>" + conf.title + "</b>");
            } else {
                layer.closeAll();
                layer.open({
                    skin: "layui-layer-molv",
                    content: "暂无权限查看",
                    time: 1200
                });
            }
        },
        error(data) {
            layer.closeAll();
            layer.open({
                skin: "layui-layer-molv",
                content: "代码报错啦，请联系管理员",
                time: 0
            });
        }
    });
}