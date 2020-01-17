#!/bin/sh

# 生成静态文件public
echo 'Starting 生成public静态文件'
hugo

# 更新www.lflxp.cn
refresh() {
    cd ../lflxp.github.com && git pull origin master && cd -
    rm -rf ../lflxp.github.com/*
    cp -r public/* ../lflxp.github.com/
    cd ../lflxp.github.com && git add . && git commit -m "`date`" && git push origin master && cd -
}

# 提交本项目文件
update() {
    git add . && git commit -m "`date`" && git push origin master
}

# 判断lflxp.github.com文件夹是否存在
echo '开始同步数据中，检查目标目录是否已存在？'
if [ ! -d "../lflxp.github.com" ]; then
        echo '未发现../lflxp.github.com目录, Cloning...'
        cd .. && git clone https://github.com/lflxp/lflxp.github.com && cd -
        
        refresh
    else
        echo '发现目标目录，开始进行更新'
        refresh
fi

update
