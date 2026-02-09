# 英语单词随机展示 
使用了bing-wallpaper和dict仓库  
https://github.com/niumoo/bing-wallpaper  
https://github.com/kajweb/dict  
文件说明： 
- index.html：网页文件（已实现自动加载 `词表.CSV`，或通过“导入 CSV”上传）
- 词表.CSV：词表文件（已存在于本目录）

本地运行建议：
1. 进入目录（包含 `index.html`）：
2. 启动一个简单 HTTP 服务器（推荐，浏览器允许 fetch 本地 CSV）：

```bash
python -m http.server 8000
```

3. 在浏览器打开：

http://localhost:8000/index.html


如果你直接用文件管理器打开 `index.html`（file://），浏览器可能会阻止自动加载本地 CSV，这种情况下请用页面上的“导入 CSV”按钮，选择本目录的 `词表.CSV` 即可。


