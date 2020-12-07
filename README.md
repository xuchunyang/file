# 文件存储

## 使用方法

上传一个文件：

    $ curl --form file=@1.txt https://file.cadr.xyz
    https://file.cadr.xyz/0-1.txt

    $ curl https://file.cadr.xyz/0-1.txt
    2020-12-07

一次性上传多个文件：

    $ curl --form file=@2.txt --form file=@emacs.png -L file.cadr.xyz
    https://file.cadr.xyz/1-2.txt
    https://file.cadr.xyz/2-emacs.png

## 使用限制

1. 单个文件最大 5 * 1024 * 1024 bytes （5 MiB）
2. 一次请求最多上传 10 个文件
3. 一分钟内最多发送 10 次上传请求

## Links

1. 网址 https://file.cadr.xyz/
2. 源码 https://github.com/xuchunyang/file
3. 备案 [苏ICP备2020065056号](http://beian.miit.gov.cn/)
