var url = "https://api.github.com/users/";
var form = document.getElementById("search");
var myLocalStorage = {
    get: function (key) {
        return JSON.parse(localStorage.getItem(key));
    },
    set: function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}
var users = myLocalStorage.get("users") || [];
var a = {};
//form 表单监听并发送 Ajax 请求
form.onsubmit = function (e) {
    //取消默认跳转事件
    e.preventDefault();
    //获取输入框的用户名，默认DanielHe4rt
    var key = document.getElementById("key").value || "DanielHe4rt";
    searchUser(key)
    // console.log(key);
    // if(hadUser(key)){
    //     alert("已经查找并在也面中了");
    //     return;
    // }
    // //使用函数 createXHR 创建一个 XMLHttpRequest 对象并赋值给 request
    // var request = createXHR();
    // //打开一个异步的 get 请求
    // request.open("GET", url + key, true);
    // request.onreadystatechange = function () {
    //     if (request.readyState === 4) {
    //         if (request.status === 200) {
    //             //返回的 data 是 JSON 格式的，需要使用 JSON.parse 转为对象
    //             result(JSON.parse(request.responseText));
    //         } else {
    //             console.log('request.status:', request.status);
    //         }
    //     }
    // }
    // request.send(null);
}
searchUser("necan");
searchUser("uurrx0");
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
function result(data) {
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
        repos: getRepos(data.repos_url)
    }
    a.r = user;
    function getRepos(url) {
        function change(arr) {
            var narr = [];
            arr.forEach(function(item, index){
                narr[index] = {
                    name: item.name,
                    description: item.description,
                    clone_url: item.clone_url,
                    html_url: item.html_url,
                    pushed_at: item.pushed_at,
                    created_at: item.created_at,
                    updated_at: item.updated_at,
                }
            });
            user.repos = narr;
            users.push(user);
            myLocalStorage.set("users",users);
            render();
        }
        ajax(["GET", url, true],change);
    }
    
}

//把数据渲染到页面
function render(i) {
    var result = document.getElementById("result");
    var template = "";
    i = i >= 0 ? i : users.length - 1;
    var user = users[i];
    template += `
            <div class="user user${i}">
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
                    ${this.renderRepo(user.repos)}
                </div>
            </div>
        `;
    var doc = document.createRange().createContextualFragment(template);
    result.insertBefore(doc,result.children[0]);
}

function renderRepo(arr) {
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

function hadUser(key) {
    for(var i = 0; i < users.length; i++){
        var user = users[i];
        if (key.toLowerCase() === user.login.toLowerCase()) {
            var doc = document.querySelectorAll(".user .card-head .info .name>a");
            for(var j=0; j<doc.length; j++){
                if(doc[j].innerHTML === user.name){
                    alert("已在页面中了哦~");
                    return -1;
                }
            }
            return i;
        }
    }
}

var tryUser = document.getElementById("test");
tryUser.addEventListener("click",function(e){
    searchUser(e.target.innerHTML);
});

function searchUser(key){
    var i = hadUser(key);
    if (i>=0){
        render(i);
        return;
    } else if(i === -1){
        return;
    }
    ajax(["GET", url + key, true],this.result);
}

