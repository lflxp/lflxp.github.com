// 清空标签
function clearBookmarks() {
    console.log('开始清空书签');
    // chrome.bookmarks.removeTree("1",function(result){
    //     console.log('书签清空完毕',JSON.stringify(result));
    // })
    chrome.bookmarks.getTree((re) => {
        removeall(re)
        console.log('书签清空完毕');
        chrome.notifications.create(null,{
            type: 'basic',
            iconUrl: 'img/icon.png',
            title: '书签',
            message: '清空完毕'
        })
    })
}

// 递归全量清空
// todo remove v.id in [0,1,2,3]
function removeall(data) {
    data.forEach((v) => {
        if (v.url === undefined) {
            chrome.bookmarks.removeTree(v.id,function(rs) {
            // chrome.bookmarks.remove(v.id,function(rs) {
                console.log('remove tree success',v.id,JSON.stringify(rs))
            })
            removeall(v.children)
        }
        chrome.bookmarks.remove(v.id,function(rr) {
            console.log('remove single',v.id,JSON.stringify(rr))
        })
    })
}

// 递归全量导入
// bookmark ( object )
// parentId ( optional string )
// Defaults to the Other Bookmarks folder.
// index ( optional integer )
// title ( optional string )
// url ( optional string )
function addAll(data,parentname) {
    console.log('addAll',data)
    // debugger
    data.forEach((v) => {
        if (parentname === '') {
            if (v.children !== undefined) {
                addAll(v.children,v.id)
            } else {
                var tmp = {
                    parentId: v.id,
                    title: v.title,
                    url: v.url
                }
                chrome.bookmarks.create(tmp,function(rrs) {
                    console.log('add url ',v.id,v.title,v.url,parentname,JSON.stringify(rrs)) 
                })
            }
        } else {
            if (v.children !== undefined) {
                var tmp = {
                    parentId: parentname,
                    title: v.title
                }
                // Unchecked runtime.lastError: Can't find parent bookmark for id.
                chrome.bookmarks.create(tmp,function(rs) {
                    console.log('add mulu ',v.id,v.title,parentname,JSON.stringify(rs))
                    addAll(v.children,rs.id)
                })
            } else {
                var tmp = {
                    parentId: parentname,
                    title: v.title,
                    url: v.url
                }
                chrome.bookmarks.create(tmp,function(rrs) {
                    console.log('add url ',v.id,v.title,v.url,parentname,JSON.stringify(rrs)) 
                })
            }
        }
    })
}

// 全量bookmarks tree
function getTree() {
    chrome.bookmarks.getTree((re) => {
        console.log('全量递归bookmarks tree',JSON.stringify(re))
    })
}

// getChildren
function getChildrens() {
    chrome.bookmarks.getChildren("1",function(result) {
        console.log('get children 1',JSON.stringify(result));
    })
}

// get 1
function gets() {
    chrome.bookmarks.get("0",function(result) {
        console.log('get bookmarks 0',JSON.stringify(result))
    })
    chrome.bookmarks.get("1",function(result) {
        console.log('get bookmarks 1',JSON.stringify(result))
    })
    chrome.bookmarks.get("2",function(result) {
        console.log('get bookmarks 2',JSON.stringify(result))
    })
    chrome.bookmarks.get("3",function(result) {
        console.log('get bookmarks 3',JSON.stringify(result))
    })
    chrome.bookmarks.get("4",function(result) {
        console.log('get bookmarks 4',JSON.stringify(result))
    })
    chrome.bookmarks.get("5",function(result) {
        console.log('get bookmarks 5',JSON.stringify(result))
    })
}

// 创建标签
function createbookmarks() {
    var tmp = {
        parentId: "1",
        title: '新建测试目录',
        url: 'http://www.lflxp.cn'
    }
    chrome.bookmarks.create(tmp,function(rs) {
        console.log('创建书签成功',JSON.stringify(rs))
    })
}

// 创建目录
function createbookmarksfolder() {
    var tmp = {
        parentId: "1",
        title: '新建测试目录'
    }
    chrome.bookmarks.create(tmp,function(rs) {
        console.log('创建目录成功',JSON.stringify(rs))
        var bookmark = {
            parentId: rs.id,
            title: '测试标签',
            url: 'http://www.lflxp.cn'
        }
        chrome.bookmarks.create(bookmark,function(result) {
            console.log('创建书签',rs.id,JSON.stringify(result))
        })
    })
}