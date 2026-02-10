# RandomWord - 英语单词动态壁纸

[![AGPL-3.0 License](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[![Lively Wallpaper](https://img.shields.io/badge/Lively-Compatible-green.svg)](https://github.com/rocksdanister/lively)
[![dict API](https://img.shields.io/badge/dict-API-blue.svg)](https://github.com/kajweb/dict)

在精美壁纸上学习英语单词的动态壁纸应用，支持 Lively Wallpaper。

[在线预览](https://majiangla.github.io/RandomWord/)

## ✨ 功能特色

- 📚 内置高中/四级词库，支持自定义 CSV 导入
- 🎨 智能主题色提取，从壁纸自动配色
- 📍 可调卡片位置（横纵百分比）
- 🔄 自动切换单词和壁纸
- 🌄 必应每日壁纸（国际版/中国版双源）

## 🚀 快速使用

**本地运行：**
```bash
git clone https://github.com/majiangla/RandomWord.git
cd RandomWord
python -m http.server 8000
```
访问 `http://localhost:8000`

**Lively 壁纸：**
1. [下载 Release](https://github.com/majiangla/RandomWord/releases/tag/pnblish)
2. 拖入 Lively Wallpaper 窗口

## ⚙️ 基本设置

1. **词书选择**：高中/四级或自定义 CSV
2. **位置调整**：水平/垂直滑块 (0-100%)
3. **显示控制**：单词/释义开关，动画开关
4. **自动模式**：设置切换间隔时间

## 📄 词书格式

```csv
单词,释义
apple,苹果
book,书
computer,计算机
```

## 🤝 致谢

- [bing-wallpaper](https://github.com/niumoo/bing-wallpaper) - 壁纸数据
- [dict](https://github.com/kajweb/dict) - 词典数据

## 📄 许可证

AGPL-3.0 © [MaJiang](https://github.com/majiangla)

---

⭐ **欢迎 Star 和 Fork！**
