$(function () {
    let {
        layer,
        form,
        laypage
    } = layui;

    let q = {
        pagenum: 1, // 页码值，默认请求第一页数据
        pagesize: 2, // 每页显示几条数据，默认每页显示2条
        cata_id: '', // 文章分类的id
        state: '' // 文章的发布状态
    };

    // 过滤器
    template.defaults.imports.dataFormat = function (date) {
        let dt = new Date(date);

        let y = dt.getFullYear();
        let m = padZero(dt.getMonth() + 1);
        let d = padZero(dt.getDate());

        let hh = padZero(dt.getHours());
        let mm = padZero(dt.getMinutes());
        let ss = padZero(dt.getSeconds());
        return `${y}-${m}-${d}  ${hh}:${mm}:${ss}`
    }

    initTable();
    initCate();

    // 定义补零的函数
    function padZero(n) {
        return n > 9 ? n : '0' + n
    }

    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: "GET",
            url: "/my/article/list",
            data: q,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败！')
                }
                // 使用模板引擎渲染页面的数据
                let htmlStr = template('tpl-table', res);
                $('tbody').html(htmlStr);

                renderPage(res.total);
            }
        });
    }

    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: "GET",
            url: "/my/article/cates",
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败！')
                }
                // 调用模板引擎渲染分类的可选项
                let htmlStr = template('tpl-cate', res);
                $('[name=cate_id]').html(htmlStr);
                // 通过 layui重新渲染表单区域的UI结构
                form.render();
            }
        });
    }

    // 为筛选表单绑定 submit 事件
    $('#form-search').on('submit', function (e) {
        e.preventDefault()
        // 获取表单中选中项的值
        var cate_id = $('[name=cate_id]').val()
        var state = $('[name=state]').val()
        // 为查询参数对象 q 中对应的属性赋值
        q.cate_id = cate_id
        q.state = state
        // 根据最新的筛选条件，重新渲染表格的数据
        initTable()
    })

    // 定义渲染分页的方法，接收一个总数量的参数
    function renderPage(total) {
        laypage.render({
            // 调用 laypage.render() 方法来渲染分页的结构
            elem: 'pageBox', // 分页器的 Id
            count: total, // 总数据条数
            limit: q.pagesize, // 每条显示几条数据
            curr: q.pagenum, // 设置默认被选中的分页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10], // 每页展示多少条
            jump(obj, first) {
                // console.log(obj);

                // 把最新的页码值，赋值到 q 这个查询参数对象中
                q.pagenum = obj.curr;
                // 把最新的条目数，赋值到 q 这个查询参数对象的 pagesize 属性中
                q.pagesize = obj.limit

                // 可以通过 first 的值，来判断是通过哪种方式，触发的 jump 回调
                // 如果 first 的值为 true，证明是方式2触发的
                // 否则就是方式1触发的
                if (!first) {
                    initTable();
                }
            }
        })
    }

    // 通过代理的方式为删除按钮绑定点击事件
    $('tbody').on('click', '.btn-delete', function () {
        // 获取删除按钮的个数
        let len = $('.btn-delete').length;
        //  获取到文章的id
        let id = $(this).data('id');
        // 询问用户是否删除数据
        layer.confirm('是否删除？', {
            icon: 3,
            title: '提示'
        }, function (index) {
            $.ajax({
                method: "GET",
                url: "/my/article/delete/" + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('删除文章失败！')
                    }
                    layer.msg('删除文章成功！')

                    // 当数据删除完成后，需判断当前这一页中是否还有剩余的数据
                    // 如果没有剩余的数据了，则让页码值 -1 然后在重新调用initTable() 方法
                    if (len === 1 && q.pagenum !== 1) {
                        // 如果len的值等于，证明删除完成后页码上没有任何数据了
                        // 页码值最小必须是 1
                        q.pagenum--;
                    }
                    initTable();
                }
            });
            layer.close(index);
        })
    })
});