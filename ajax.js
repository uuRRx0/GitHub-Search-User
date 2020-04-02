var url = "https://api.github.com/users/";

var myLocalStorage = {
    get: function (key) {
        return JSON.parse(localStorage.getItem(key));
    },
    set: function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}
var users = myLocalStorage.get("users") || [];
function init(){
    //form 表单监听并发送 Ajax 请求
    var form = document.getElementById("search");
    form.onsubmit = function (e) {
        //取消默认跳转事件
        e.preventDefault();
        //获取输入框的用户名，默认DanielHe4rt
        var key = document.getElementById("key").value || "DanielHe4rt";
        searchUser(key);
    }
    
    //HTML 页面试一试监听事件并处理
    var tryUser = document.getElementById("test");
    tryUser.addEventListener("click", function (e) {
        searchUser(e.target.innerHTML);
    });

    //搜索预设两用户
    searchUser("necan");
    searchUser("uurrx0");
}
init();

//创建一个 XMLHttpRequest 对象, 兼容IE5, IE6
function createXHR() {
    var request = null;
    //判断是否浏览器存在 XMLHttpRequest 
    if (window.XMLHttpRequest) {
        //IE7+. Firefox, Chrome, Opera, Safari...
        request = new window.XMLHttpRequest();
    } else {
        //适合IE6, IE5
        new ActiveXObject("Microsoft.XMLHTTP");
    }
    return request;
}

//发送 Ajax 请求，并调用函数 f 处理 JSON.parse 后的数据
function ajax([type, url, boolean, data],f) {
    var [type, url, boolean, data] = arguments[0];
    var request = createXHR();
    request.open(type, url, boolean);
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            if (request.status === 200) {
                return f(JSON.parse(request.responseText));
            } else {
                console.log('request.status:', request.status);
            }
        }
    }
    request.send(data || null);
}

//处理返回的数据
function result(data,f) {
    //返回的 JSON 数据解构
    // data = JSON.parse(data);
    //把返回的 data 处理存到 user 对象
    var user = {
        name: data.name || data.login,
        login: data.login,
        bio: data.bio,
        reposNumber: data.public_repos,
        blog: data.blog,
        createTime: data.created_at,
        imgUrl: data.avatar_url,
        repos_url: data.repos_url,
        url: data.html_url,
        getTime: new Date().getTime(),
        repos: getRepos(data.repos_url)
    }
    //获取 repos 数组
    function getRepos(url) {
        function change(arr) {
            // arr = JSON.parse(arr);
            //处理返回的 repos 数组
            var newArr = [];
            arr.forEach(function(item, index){
                newArr[index] = {
                    name: item.name,
                    description: item.description,
                    clone_url: item.clone_url,
                    html_url: item.html_url,
                    pushed_at: item.pushed_at,
                    created_at: item.created_at,
                    updated_at: item.updated_at
                }
            });
            //把处理后的数组 设置为对象 user 的 repos 属性
            user.repos = newArr;
            //回调函数
            // console.log(user);
            callback(user);
        }
        ajax(["GET", url, true],change);
    }
    function callback(user){
        if(f){
            // console.log("执行函数："+f)
            f(user);
        } else {
            // console.log("默认");
            users.push(user);
            render();
        }
        myLocalStorage.set("users", users);
    }
    
}

//把数据渲染到页面
function render(i) {
    var result = document.getElementById("result");
    var template = "";
    i = i >= 0 ? i : users.length - 1;
    // console.log(i,users);
    var user = users[i];
    template += `
            <div class="user" id="user${i}">
                <div class="card-head clearfix">
                    <a target="_black" href="${user.url}"><img class="avatar left" src="${user.imgUrl}" alt="${user.name}"></a>
                    <div class="info">
                        <div class="name"><a target="_black" href="${user.url}">${user.name}</a></div>
                        <div class="desc">${user.bio || "这人很懒还没有填写"}</div>
                        <div class="other">
                            <span><a target="_black" href="${user.blog}">${user.blog}</a></span>
                            <span>${user.createTime.slice(0, 10)}</span>
                        </div>
                    </div>
                </div>
                <div class="card-content clearfix">
                    <div class="title">
                        <span class="repo">Pinned repositories</span><span class="num">${user.reposNumber}</span>
                    </div>
                    ${user.repos && this.renderRepos(user.repos)}
                </div>
            </div>
        `;
    var doc = document.createRange().createContextualFragment(template);
    var selector = "#result #user" + i;
    var self = document.querySelector(selector);
    self && self.parentElement.removeChild(self);
    result.insertBefore(doc,result.children[0]);
}

//渲染 repos
function renderRepos(arr) {
    var template = "";
    var len = arr.length;
    for (var i = 0; i < len; i++) {
        var repo = arr[i];
        template += `
            <div class="repos repos${i} left">
                <div class="repos-name" title="${repo.name}"><a target="_black" href="${repo.html_url}">${repo.name}</a></div>
                <div class="repo-desc" title="${repo.description || "-"}">${repo.description || "-"}</div>
                <div class="repo-other">${repo.created_at.slice(0, 10)}</div>
            </div>
        `
    }
    return template;
}

// 判断是否本地存储有该用户
function hadUser(key) {
    for(var i = 0; i < users.length; i++){
        var user = users[i];
        if (key.toLowerCase() === user.login.toLowerCase()) {
            var doc = document.querySelectorAll(".user .card-head .info .name>a");
            for(var j=0; j<doc.length; j++){
                if(doc[j].innerHTML === user.name){
                    //console.log("已在页面中了哦~");
                    //更新已有数据并重新渲染到 DOM
                    update(i,true);
                }
            }
            //渲染已有用户到 DOM 中
            render(i);
            return i;
        }
    }
}

//查找用户
function searchUser(key){
    //判断是否本地储存有用户，有就本地读取，否则执行 Ajax 函数发送 Ajax 请求
    hadUser(key) || ajax(["GET", url + key, true],result);
}

//更新已有的用户数据
function update(i,isRender) {
    // render(i);
    // return;
    if(new Date().getTime() - users[i].getTime > 1000 * 60 ){
        var key = users[i].login;
        ajax(["GET", url + key, true], function(data){
            result(data,function(user) {
                if(JSON.stringify(user) !== JSON.stringify(users[i])) {
                    users[i] = user;
                    isRender && render(i);
                }
            })
        });
    }
    return i;
}

