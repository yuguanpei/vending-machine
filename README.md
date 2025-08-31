# Vending Machine Electron App

基于 Electron + React + Vite 的自助售货机终端应用。

## ✨ 特性

- 多平台支持（Windows/macOS/Linux）
- 现代化前端界面，响应式布局
- 支持扫码支付、TOTP 验证、购物车、订单管理等功能
- 管理后台：商品、货道、广告等配置
- 设备串口/扫码器/出货等硬件对接

## 📂 目录结构

```
├── build/                # 打包相关资源
├── resources/            # 设备驱动、扫码器等外部资源
├── src/
│   ├── main/             # Electron 主进程
│   ├── preload/          # 预加载脚本
│   └── renderer/         # 前端页面（React）
│       ├── src/
│       │   ├── components/  # 组件
│       │   ├── hooks/       # 自定义 hooks
│       │   ├── lib/         # 工具库
│       │   └── stores/      # 状态管理
├── package.json
├── electron-builder.yml  # 打包配置
└── ...
```

## 🚀 快速开始

### 环境要求

- Node.js 16+
- 推荐使用 [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

### 打包发布

```bash
# Windows
npm run build:win
# macOS
npm run build:mac
# Linux
npm run build:linux
```

## 🛠️ 技术栈

- Electron
- React 18
- Vite
- Zustand（状态管理）
- Tailwind CSS（UI 样式）
- Lucide React（图标）

## 🤝 贡献

欢迎提交 issue 和 PR，完善功能和体验！

## 📄 License

MIT
