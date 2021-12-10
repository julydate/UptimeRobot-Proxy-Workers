# UptimeRobot CloudFlare Workers Proxy

利用 CloudFlare Workers 反向代理 UptimeRobot 的 Status page 实现自定义域名

## 前言

UptimeRobot 从 2021 年 5 月开始只有付费版才能绑定自定义域名了：

> Dear UptimeRobot user,
>
> We’re seeing an unprecedented number of Status pages created each week and it’s starting to cause some problems. Therefore we have decided to support custom linked domain Status pages to PRO plan users only.
>
> The main reason is the huge load on our systems and the issuance and renewal of SSL certificates hitting several 3rd party service rate limits while slowing down the process of activating new Status pages significantly.
>
> We still want to offer a lot of useful free services to our community and users, but we need to focus on quality and reliability too.
>
> What does it mean for you?
> Please, consider upgrading to the PRO plan so you can continue using your linked domain Status page(s) while getting even more PRO plan benefits like 1-minute intervals and SSL monitoring.
>
> Otherwise, your linked Status page(s) will be stopped on May 5th, 2021. All your status pages will be still available on the unique UptimeRobot URL (e.g. stats.uptimerobot.com/xxx).

但是因为官网分配的域名有后缀，而且某些网络环境下打开非常缓慢，所以之前一直套着 CDN 绑定了自己的域名来加速访问，差不多就是一直挂在那里懒得折腾的东西。

但是现在自定义域名只面向付费用户使用了，又不想自己搭其它的状态监控（总觉得会增加维护成本，另外一个稳定性也要考虑，毕竟本来就是监控状态的，要是自己挂掉了怎么办）。

当然也有通过 UptimeRobot API 来搭建监控页面（托管在 GitHub）的项目，比如 [uptime-status](https://github.com/yb/uptime-status]) （[修改版](https://github.com/Ice-Hazymoon/status) 和 [教程](https://imiku.me/2021/09/22/create-a-status-page.html/)），其实还不错的，感兴趣可以去看看。

但是我懒得折腾了，反正都要用 CloudFlare Workers 反代，所以直接根据 [workersproxy](https://github.com/fajarFWD/workersproxy) 修改了一下，专门拿来反代 UptimeRobot 官方提供的状态页面。

## 使用

打开 CloudFlare 面板主页

![image-20211210184029978](https://cdn.jsdelivr.net/gh/SagiriSama/img@master/picgo/20211210184031image-2021121018402997884ac6.png)

![image-20211210184407475](https://cdn.jsdelivr.net/gh/SagiriSama/img@master/picgo/20211210184409image-202112101844074759534a.png)

![image-20211210184516390](https://cdn.jsdelivr.net/gh/SagiriSama/img@master/picgo/20211210184517image-2021121018451639054c80.png)

![image-20211210184621781](https://cdn.jsdelivr.net/gh/SagiriSama/img@master/picgo/20211210184622image-202112101846217812fca2.png)

把 index.js 里面的内容粘贴到 CloudFlare Workers 里面

记得把 upstream_path 的内容修改成 UptimeRobot 提供的官方状态页面的路径，如 `/JcIPbYjh`

然后点击保存并部署

![image-20211210184748597](https://cdn.jsdelivr.net/gh/SagiriSama/img@master/picgo/20211210184750image-20211210184748597da141.png)

就可以直接使用 CF Workers 提供的域名访问了

## 绑定域名

关于 CF Workers 绑定自己域名啊之类的我就懒得写保姆级教程了，大概就是 Workers 路由里面添加，如 `status.example.com/*` 

![image-20211210185147593](https://cdn.jsdelivr.net/gh/SagiriSama/img@master/picgo/20211210185149image-202112101851475937add8.png)

然后去域名解析那边添加 CNAME 记录解析到 CF Workers 项目提供的域名（Routes 里面默认的域名），这里的域名必须是托管在 CloudFlare 上面的，但是你也可以解析到其它的 IP 地址或 CDN

## 示例

我的服务监控： https://status.xhtml.love/
