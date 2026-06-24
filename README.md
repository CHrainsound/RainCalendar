# RainCalendar - 节日日历

一款运行在 Zepp OS 智能手表上的节日日历应用，支持显示公历日期、农历、传统节日、节气等信息。

## 功能特性

- **日历显示**：按月展示公历日期，支持月份切换
- **农历显示**：每天显示对应的农历日期
- **节日提醒**：标注各类节日，包括：
  - 法定节假日（元旦、劳动节、国庆节）
  - 传统节日（春节、元宵、端午、中秋、重阳、除夕）
  - 国际节日（情人节、妇女节、儿童节、圣诞节等）
  - 节气（立春、雨水、惊蛰等24节气）
  - 特殊节日（母亲节、父亲节）
- **今日高亮**：当前日期特殊显示
- **下一个节日**：显示距离下一个节日的天数
- **表冠操作**：支持旋转表冠切换月份
- **动画效果**：月份切换时的淡入淡出动画

## 支持设备

| 平台 | 屏幕类型 | 设计宽度 |
|------|---------|---------|
| gt | r (圆形) | 480px |
| gt | s (方形) | 480px |*手边没有方表，没有特别优化*

**系统要求**：Zepp OS 4.0+

## 安装使用

### 方式一：从 Zepp 应用商店安装
1. 打开 Zepp 应用
2. 搜索 "Rain日历" 或 "RainCalendar"
3. 点击安装

### 方式二：本地开发安装*请确保有node.js*
1. 安装 Zepp CLI
   ```bash
   npm install -g @zeppos/cli
   ```

2. 克隆项目
   ```bash
   git clone https://github.com/CHrainsound/RainCalendar
   cd RainCalendar
   ```

3. 登录zepp账号
   ```bash
   zeus login
   ```

4. 生成小程序QR码*确保当前路径为项目目录*
   ```bash
   zeus preview
   ```

5. 上传到设备
   开发者模式扫码

## 项目结构

```
RainCalendar/
├── app.js                          # 应用入口
├── app.json                        # 应用配置
├── package.json                    # 项目依赖
├── jsconfig.json                   # JavaScript 配置
├── global.d.ts                     # TypeScript 类型定义
├── AGENTS.md                       # AI 代理说明
├── README.md                       # 项目说明
├── assets/
│   └── gt.s/
│       ├── icon.png                # 应用图标
│       └── image/
│           └── logo.png            # Logo 图片
├── page/
│   ├── gt/
│   │   ├── home/
│   │   │   ├── index.page.js       # 首页逻辑
│   │   │   ├── index.page.r.layout.js  # 圆形屏幕布局
│   │   │   └── index.page.s.layout.js  # 方形屏幕布局
│   │   └── holiday/
│   │       ├── index.page.js       # 日历页面逻辑
│   │       ├── index.page.r.layout.js  # 圆形屏幕布局
│   │       ├── index.page.s.layout.js  # 方形屏幕布局
│   │       └── shared-styles.js    # 共享样式模块
│   └── i18n/
│       ├── zh-CN.po               # 中文翻译
│       └── en-US.po               # 英文翻译
└── utils/
    └── index.js                    # 工具函数
```

## 开发指南

### 主要文件说明

| 文件 | 说明 |
|------|------|
| `app.json` | 应用配置，包括应用ID、版本、权限、目标平台等 |
| `page/gt/holiday/index.page.js` | 核心日历逻辑，包含农历计算、节日数据、UI交互 |
| `page/gt/holiday/shared-styles.js` | 共享样式，提取公共配置减少重复代码 |
| `page/i18n/*.po` | 国际化翻译文件 |

### 农历算法

应用内置了完整的农历算法，支持 1900-2100 年的农历日期转换。主要函数：

- `solarToLunar(year, month, day)` - 公历转农历
- `lunarToSolar(lunarYear, lunarMonth, lunarDay)` - 农历转公历
- `getHolidaysForYear(year)` - 获取指定年份的所有节日

### 缓存机制

应用使用 LRU 缓存策略优化性能：
- 农历计算结果缓存（最多12个月）
- 节日数据缓存（预计算相邻年份）

### 添加新节日

在 `page/gt/holiday/index.page.js` 中修改对应的节日数组：

```javascript
// 公历节日
const SOLAR_HOLIDAYS = [
  { month: 1, day: 1, name: "元旦" },
  // 添加新节日...
];

// 农历节日
const LUNAR_HOLIDAYS = [
  { month: 1, day: 1, name: "春节" },
  // 添加新节日...
];

// 国际节日
const INTERNATIONAL_HOLIDAYS = [
  { month: 2, day: 14, name: "情人节" },
  // 添加新节日...
];
```

### 国际化

翻译文件位于 `page/i18n/` 目录，使用 `.po` 格式：

```po
msgid "appName"
msgstr "雨声日历"
```

在代码中使用：
```javascript
import { getText } from "@zos/i18n";
const text = getText("appName");
```

## 权限说明

| 权限 | 用途 |
|------|------|
| `data:os.device.info` | 获取设备信息（屏幕尺寸等） |
| `device:os.local_storage` | 本地存储（缓存数据） |
| `data:os.network` | 网络访问（预留） |

## 技术栈

- **框架**：Zepp OS 4.x
- **语言**：JavaScript
- **构建工具**：@zeppos/cli
- **类型支持**：@zeppos/device-types

## 版本历史
**Todo：添加调休工作日和节假日显示**

### v1.1.0 (2026-06-25)
- 新增快捷卡片
- 优化代码结构，提高复用率

### v1.0.3 (2026-06-24)
- 适配英语
- 再次修复除夕日期异常问题 

### v1.0.2 (2026-06-20)
- 修复除夕日期异常的问题
- 修复utc时间与本地时间混用计算导致的下一个节日倒计时异常

### v1.0.1 (2026-06-17)
- 优化代码结构，提取共享样式模块
- 实现 LRU 缓存机制，提升性能
- 添加有意义的常量，提高代码可读性
- 删除未使用的代码

### v1.0.0 (2026-06-17)
- 初始版本发布
- 支持公历、农历、节日显示
- 支持月份切换和表冠操作


