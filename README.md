# 图提取 / ImageGrab

一个 Chrome 浏览器扩展：一键提取淘宝、京东、拼多多商家版商品详情页的所有图片，集中预览、自由勾选，批量下载为 PNG 格式。

## 功能

- 在电商详情页右下角悬浮「获取图片」按钮
- 自动扫描 `<img>`、`srcset`、`data-src`、`data-lazy-src`、背景图等懒加载图片
- 过滤图标 / logo / 占位图 / 小尺寸图片
- 新标签页画廊集中预览，支持全选 / 反选 / 勾选下载
- 统一转换为 PNG，文件名自动编号（`商品图_001.png`）

## 安装（开发者模式）

1. 下载本仓库并解压到本地文件夹。
2. 打开 Chrome，地址栏输入 `chrome://extensions` 回车。
3. 打开右上角「开发者模式」开关。
4. 点击「加载已解压的扩展程序」，选择解压后的文件夹（包含 `manifest.json` 的目录）。
5. 打开淘宝 / 京东 / 拼多多商家版的商品详情页，右下角即可看到「获取图片」按钮。

## 目录结构

```
.
├── manifest.json      # 扩展配置（Manifest V3）
├── content.js         # 注入按钮 + 提取图片
├── content.css        # 按钮样式
├── background.js      # service worker，消息转发
├── gallery.html       # 画廊页面
├── gallery.js         # 画廊交互 + 批量下载
├── gallery.css        # 画廊样式
└── docs/              # 插件官网（静态网站，可部署到 GitHub Pages）
    ├── index.html
    ├── css/style.css
    └── js/main.js
```

## 官网

`docs/` 目录是插件的官方宣传网站，纯静态实现，双击 `docs/index.html` 即可本地预览；推送到 GitHub 后可通过 GitHub Pages 部署访问。
