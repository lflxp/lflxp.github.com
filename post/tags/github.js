function Github() {
    this.user = ''
    this.repos = ''
    this.token = ''
    this.key = ['username','repos','token'];
    
    this.url = 'https://api.github.com'
    this.tags = 'tags'
    this.session = 'session'
    this.bookmarks = 'bookmarks'

    this.test = function() {
        console.log('ajax test')
        // https://www.e-learn.cn/content/wangluowenzhang/14974
        // https://blog.csdn.net/xianhenyuan/article/details/92669817
        // $.ajax({
        //     type: 'GET',
        //     url: 'https://www.baidu.com',
        //     success: function(result) {
        //         console.log(result)
        //         alert('baidu' + result)
        //     },
        //     error: function(e) {
        //         console.log(e.status)
        //         alert('error '+ e.status)
        //     }
        // })

        fetch('https://www.baidu.com')
            .then((resp) => {
                alert(resp)
            })
            .then((myjson)=>{
                console.log(myjson)
            })
    }

    // https://www.jianshu.com/p/14437764eff3
    this.stringtobase64 = function(info) {
        return window.btoa(info)
    }

    this.base64tostring = function(info) {
        return window.atob(info)
    }

    /*
    传输方法：PUT
    访问路径：https://api.github.com/repos/用户名/仓库名/contents/文件路径
    JSON格式：
        {
        "message": "commit from INSOMNIA",
        "content": "$sha="
        }
    */
    this.create = function(filepath) {
        var data = {
            "message": "commit init",
            "content": "eyJkZWZhdWx0IjpbeyJuYW1lIjoidGl0bGUiLCJ1cmwiOiJodHRwOi8vYmFpZHUuY29tIiwiaWNvbiI6IjEyMyIsInRpbWUiOiIyMDE5LTAxLTAxIn1dfQo="
        }

        chrome.storage.local.get(this.key,function(result) {
            this.url = 'https://api.github.com'
            this.user = result.username
            this.repos = result.repos
            this.token = result.token
            this.headers = {'Authorization': 'token '+this.token,'Content-type': 'application/json'}
            console.log('1111 '+ this.user+this.repos+this.token)
            if (this.user === '' || this.user === undefined) {
                alert('未配置认证信息')
                return
            }

            fetch(this.url + '/repos/' + this.user + '/' + this.repos + '/contents/' + filepath,{
                method: 'PUT',
                body: JSON.stringify(data),
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': 'token ' + this.token
                })
            }).then(res=>res.json())
            .catch((error) => {
                chrome.notifications.create(null,{
                    type: 'basic',
                    iconUrl: 'img/icon.png',
                    title: '创建tags/create目录',
                    message: error
                })
            })
            .then(response => console.log('Success:',response))
        })
        
    }

    // 远程加载
    this.get = function(filepath) {
        // 全量清空 然后再加载
        chrome.bookmarks.getTree((re) => {
            // console.log('reeee',JSON.stringify(re),re[0])
            removeall(re);

            chrome.storage.local.get(this.key,function(result) {
                this.url = 'https://api.github.com'
                this.user = result.username
                this.repos = result.repos
                this.token = result.token
                this.headers = {'Authorization': 'token '+this.token,'Content-type': 'application/json'}
                console.log('1111 '+ this.user+this.repos+this.token)
                if (this.user === '' || this.user === undefined) {
                    alert('未配置认证信息')
                    return
                }
                
                fetch(this.url + '/repos/' + this.user + '/' + this.repos + '/contents/' + filepath,{
                    method: 'GET',
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        'Authorization': 'token ' + this.token
                    })
                }).then(res=>res.json())
                .catch(error => console.error('Error:',error))
                .then((result) => {
                    let info = JSON.parse(decodeURIComponent(window.atob(result['content'])));
                    addAll(info[0].children,'');
                    chrome.notifications.create(null,{
                        type: 'basic',
                        iconUrl: 'img/icon.png',
                        title: '更新本地书签',
                        message: '同步完成 '
                    })
                })
            })
        });
    }

    // todo 远程同步
    this.updateTags = function(filepath,message) {
        let _this = this
        chrome.storage.local.get(this.key,function(result) {
            _this.create(filepath);
            let _this2 = this
            this.url = 'https://api.github.com'
            this.user = result.username
            this.repos = result.repos
            this.token = result.token
            if (this.user === '' || this.user === undefined) {
                alert('user is nil')
                return
            }

            var urls = this.url + '/repos/' + this.user + '/' + this.repos + '/contents/' + filepath

            fetch(urls,{
                method: 'GET',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': 'token ' + this.token
                })
            }).then(res=>res.json())
            .catch(error => console.error('Error:',error))
            .then((result) => {
                console.log('github get success' + JSON.stringify(result),result['sha'])
                // chrome.bookmarks.getChildren("1",(re) => {
                chrome.bookmarks.getTree((re) => {
                    console.log('reeee',JSON.stringify(re))
                    // "content": window.btoa(encodeURIComponent(JSON.stringify(re))),
                    // "content": window.btoa(unescape(encodeURIComponent(JSON.stringify(re)))),
                    var data = {
                        "message": '全量同步bookmarks '+message,
                        "content": window.btoa(encodeURIComponent(JSON.stringify(re))),
                        "sha": result['sha']
                    }
                
                    var urls = _this2.url + '/repos/' + _this2.user + '/' + _this2.repos + '/contents/' + filepath
                    console.log('urls',urls,data)

                    fetch(urls,{
                        method: 'PUT',
                        body: JSON.stringify(data),
                        headers: new Headers({
                            'Content-Type': 'application/json',
                            'Authorization': 'token ' + _this2.token
                        })
                    }).then(res=>res.json())
                    .catch((error) => {
                        chrome.notifications.create(null,{
                            type: 'basic',
                            iconUrl: 'img/icon.png',
                            title: '上传全量书签错误',
                            message: error
                        })
                    })
                    .then((response) => {
                        chrome.notifications.create(null,{
                            type: 'basic',
                            iconUrl: 'img/icon.png',
                            title: '上传全量书签成功',
                            message: JSON.stringify(response)
                        })
                    })
                })
            })
        })
    }

    /*
    传输方法：PUT
    访问路径：https://api.github.com/repos/用户名/仓库名/contents/文件路径
    JSON格式：
        {
        "message": "update from INSOMNIA",
        "content": "$sha",
        "sha": "$sha"
        }
    */
    this.update = function(filepath,message,content) {
        chrome.storage.local.get(this.key,function(result) {
            this.url = 'https://api.github.com'
            this.user = result.username
            this.repos = result.repos
            this.token = result.token
            this.headers = {'Authorization': 'token '+this.token,'Content-type': 'application/json'}
            console.log('1111 '+ this.user+this.repos+this.token)
            if (this.user === '' || this.user === undefined) {
                alert('user is nil')
                return
            }

            var urls = this.url + '/repos/' + this.user + '/' + this.repos + '/contents/' + filepath
            console.log('urls',urls)

            fetch(urls,{
                method: 'GET',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': 'token ' + this.token
                })
            }).then(res=>res.json())
            .catch(error => console.error('Error:',error))
            .then((result) => {
                console.log('github get success' + JSON.stringify(result),result['sha'])
                var data = {
                    "message": message,
                    "content": window.btoa(content),
                    "sha": result['sha']
                }
            
                var urls = _this.url + '/repos/' + _this.user + '/' + _this.repos + '/contents/' + filepath
                console.log('urls',urls,data)

                fetch(urls,{
                    method: 'PUT',
                    body: JSON.stringify(data),
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        'Authorization': 'token ' + this.token
                    })
                }).then(res=>res.json())
                .catch(error => console.error('Error:',error))
                .then(response => console.log('github update success' + JSON.stringify(response)))
            })
        })
    }

    /*
    传输方法：DELETE
    访问路径：https://api.github.com/repos/用户名/仓库名/contents/文件路径
    JSON格式：
    {
    "message": "delete a file",
    "sha": "$sha"
    }
    */
    this.delete = function(filepath,message) {
        chrome.storage.local.get(this.key,function(result) {
            this.url = 'https://api.github.com'
            this.user = result.username
            this.repos = result.repos
            this.token = result.token
            this.headers = {'Authorization': 'token '+this.token,'Content-type': 'application/json'}
            console.log('1111 '+ this.user+this.repos+this.token)
            if (this.user === '' || this.user === undefined) {
                alert('user is nil')
                return
            }

            var urls = this.url + '/repos/' + this.user + '/' + this.repos + '/contents/' + filepath
            console.log('urls',urls)
            $.ajax({
                type: 'GET',
                url: urls,
                headers: this.headers,
                dataType: 'json',
                success: function(result) {
                    console.log('github get success' + JSON.stringify(result),result['sha'])
                    var data = {
                        "message": message,
                        "sha": result['sha']
                    }

                    console.log('urls',urls)
                    $.ajax({
                        type: 'DELETE',
                        url: urls,
                        headers: this.headers,
                        data: JSON.stringify(data),
                        dataType: 'json',
                        success: function(result1) {
                            console.log('github delete success' + JSON.stringify(result1))
                        },
                        error: function(e) {
                            console.log('delete error',e.status)
                        }
                    })
                },
                error: function(e) {
                    console.log('delete error',e.status)
                }
            })

            fetch(urls,{
                method: 'GET',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': 'token ' + this.token
                })
            }).then(res=>res.json())
            .catch(error => console.error('Error:',error))
            .then((result) => {
                console.log('github get success' + JSON.stringify(result),result['sha'])
                var data = {
                    "message": message,
                    "content": window.btoa(content),
                    "sha": result['sha']
                }
            
                var urls = _this.url + '/repos/' + _this.user + '/' + _this.repos + '/contents/' + filepath
                console.log('urls',urls,data)

                fetch(urls,{
                    method: 'PUT',
                    body: JSON.stringify(data),
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        'Authorization': 'token ' + this.token
                    })
                }).then(res=>res.json())
                .catch(error => console.error('Error:',error))
                .then(response => console.log('github update success' + JSON.stringify(response)))
            })
        })
    }
}