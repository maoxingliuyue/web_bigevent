$(function () {
    // 调用getUserInfo 获取用户的基本信息
    getUserInfo();

    var layer = layui.layer

    // 点击按钮，实现退出功能
    $('#btnLogout').on('click', function () {
        // 提示用户是否确认退出
        layer.confirm('确定退出登录?', {
            icon: 3,
            title: '提示'
        }, function (index) {
            //do something
            // 1. 清空本地存储中的 token
            localStorage.removeItem('token')
            // 2. 重新跳转到登录页面
            location.href = '/login.html'

            // 关闭 confirm 询问框
            layer.close(index)
        })
    })
});

// 封装获取用户基本信息函数
function getUserInfo() {
    $.ajax({
        method: "GET",
        url: "/my/userinfo",
        // headers: {
        //     Authorization: localStorage.getItem('token') || ''
        // },
        success: function (res) {
            if (res.status !== 0) {
                return layui.layer.msg(res.message)
            }
            // 调用renderAvatar函数 渲染用户的头像
            renderAvatar(res.data);
        },
        error(err) {},
        
    });
}

// 封装渲染用户头像函数
function renderAvatar(user) {
    // 获取用户的名称
    let name = user.nickname || user.username;

    // 设置欢迎的文本
    $('#welcome').html(`欢迎&nbsp;&nbsp;${name}`);

    // 按需渲染用户的头像
    if (user.user_pic) {
        // 渲染图片头像
        $('.layui-nav-img').attr('src', user.user_pic).show();
        $('.text-avatar').hide();
    } else {
        // 渲染文字头像
        $('.layui-nav-img').hide();
        let first = name[0].toUpperCase();
        $('.text-avatar').html(first).show();
    }
}