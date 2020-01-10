# Flutter Error connecting to the service protocol: HttpException ...
Flutter再次出发
困扰我的第一个Flutter难题
Error connecting to the service protocol: HttpException ...
使用VSCode在iPhone模拟器上调试没问题
在Android模拟机上就报这个错误。
虽然报错后依然能够在模拟器行运行，就是没法热重载，也没法调试
于是我怀疑是VSCode的问题，于是我换了到AndroidStudio，结果问题依旧存在，说明这并非IDE的问题。
看错误提示：是无法连接到本地的一个websocket
google一搜发现很多人遇到同样的问题，说是电脑设置了 Proxy 引起的，确实我们公司电脑联网有Proxy
解决方法：

修改 .bash_profile 设置 NO_PROXY=localhost,127.0.0.1
终端运行 source .bash_profile
然后跟着这解决方案走，发现不能解决问题，问题依旧
又接着全网搜索各种类似问题，最后发现是安卓9+的模拟器系统问题。。。
再次贴出解决方案：

使用 Android 9 以外的模拟器调试，就不会报这个错误，并且能热重载
或者调整 AndoidManifest.xml ，在应用程序中添加使用 CleartextTraffic =“true”
导致此错误的原因之一是Android 9.在此版本中，所有Unity3D http请求都停止工作。
在Android 9中默认禁用Http请求。

我的问题起因是后者，现已解决。