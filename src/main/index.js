import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import fs from 'node:fs'
import path from 'node:path'
import extract from 'extract-zip'

import speakeasy from 'speakeasy'
import { exec, spawn } from 'child_process'

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }
      if (stderr) {
        reject(new Error(stderr))
        return
      }
      resolve(stdout)
    })
  })
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1080,
    height: 1920,
    show: false,
    fullscreen: !is.dev,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (!is.dev) {
    // 完全移除菜单（更彻底）
    mainWindow.setMenu(null)
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.codeasier.vm')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('is-fullscreen', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return win ? win.isFullScreen() : false
  })

  ipcMain.handle('toggle-fullscreen', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      const isFullScreen = win.isFullScreen()
      win.setFullScreen(!isFullScreen)
      return true
    }
    return false
  })

  const vmDataPath = path.normalize(path.join(app.getPath('appData'), 'Vending Machine'))
  fs.mkdirSync(vmDataPath, { recursive: true })

  ipcMain.handle('import-config', async () => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) {
        throw new Error('请先打开主窗口再进行导入操作')
      }

      // 选择配置压缩包
      const { filePaths, canceled } = await dialog.showOpenDialog(win, {
        title: '选择配置压缩包',
        filters: [{ name: '配置压缩包', extensions: ['zip'] }],
        properties: ['openFile']
      })

      if (canceled) {
        return { success: false, message: '已取消导入操作' }
      }

      if (filePaths.length === 0) {
        return { success: false, message: '请选择一个配置压缩包' }
      }

      const zipPath = filePaths[0]

      // 验证格式
      if (!zipPath.toLowerCase().endsWith('.zip')) {
        return { success: false, message: '请选择zip格式的配置压缩包' }
      }

      // 验证文件是否存在且可读
      if (!fs.existsSync(zipPath)) {
        return { success: false, message: '选择的文件不存在或无法访问' }
      }

      const importsPath = path.normalize(path.join(vmDataPath, 'imports'))
      if (fs.existsSync(importsPath)) {
        fs.rmSync(importsPath, { recursive: true })
      }
      fs.mkdirSync(importsPath, { recursive: true })

      // 解压文件
      try {
        await extract(zipPath, {
          dir: importsPath,
          onEntry: (entry) => {
            const destPath = path.normalize(path.join(importsPath, entry.fileName))
            // 安全验证：防止路径遍历攻击
            if (!path.resolve(destPath).startsWith(path.resolve(importsPath))) {
              throw new Error('配置压缩包包含非法文件路径，可能存在安全风险')
            }
          }
        })
      } catch (error) {
        return {
          success: false,
          message: `解压文件失败：${error.message || '请重试或联系技术支持'}`
        }
      }

      // 验证数据完整性
      const cfgPath = path.normalize(path.join(importsPath, 'cfg.json'))
      if (!fs.existsSync(cfgPath)) {
        return {
          success: false,
          message: '配置压缩包不完整：缺少配置文件(cfg.json)'
        }
      }

      const staticPath = path.normalize(path.join(importsPath, 'static'))
      if (!fs.existsSync(staticPath)) {
        return {
          success: false,
          message: '配置压缩包不完整：缺少资源目录(static)'
        }
      }

      // 验证配置文件
      try {
        const cfgContent = fs.readFileSync(cfgPath, 'utf-8')
        JSON.parse(cfgContent) // 简单验证JSON格式
      } catch (error) {
        return { success: false, message: '配置文件JSON格式错误' }
      }

      // 应用配置文件
      const cfgDest = path.normalize(path.join(vmDataPath, 'cfg.json'))
      fs.renameSync(cfgPath, cfgDest)

      const staticDest = path.normalize(path.join(vmDataPath, 'static'))
      if (fs.existsSync(staticDest)) {
        fs.rmSync(staticDest, { recursive: true })
      }
      fs.renameSync(staticPath, staticDest, { recursive: true })

      fs.rmSync(importsPath, { recursive: true })

      return { success: true, message: '数据导入成功！' }
    } catch (error) {
      return {
        success: false,
        message: `导入过程中发生意外错误：${error.message || '请重试或联系技术支持'}`
      }
    }
  })

  ipcMain.handle('remove-config', async () => {
    try {
      const cfgPath = path.normalize(path.join(vmDataPath, 'cfg.json'))
      if (fs.existsSync(cfgPath)) {
        fs.rmSync(cfgPath)
      }

      const slotsPath = path.normalize(path.join(vmDataPath, 'slots.json'))
      if (fs.existsSync(slotsPath)) {
        fs.rmSync(slotsPath)
      }

      const staticPath = path.normalize(path.join(vmDataPath, 'static'))
      if (fs.existsSync(staticPath)) {
        fs.rmSync(staticPath, { recursive: true })
      }

      return { success: true, message: '清理成功！' }
    } catch (error) {
      return {
        success: false,
        message: `清理过程中发生意外错误：${error.message || '请重试或联系技术支持'}`
      }
    }
  })

  ipcMain.handle('get-config', async () => {
    const cfgPath = path.normalize(path.join(vmDataPath, 'cfg.json'))
    if (fs.existsSync(cfgPath)) {
      const cfgContent = fs.readFileSync(cfgPath, 'utf-8')
      return JSON.parse(cfgContent)
    } else {
      return {}
    }
  })

  ipcMain.handle('get-file', (event, filename) => {
    const staticPath = path.normalize(path.join(vmDataPath, 'static'))
    const filePath = path.normalize(path.join(staticPath, filename))
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath)
    }
  })

  ipcMain.handle('update-slot', async (event, layer, column, data) => {
    const slotsPath = path.normalize(path.join(vmDataPath, 'slots.json'))
    let slots = {}
    if (fs.existsSync(slotsPath)) {
      const slotsContent = fs.readFileSync(slotsPath, 'utf-8')
      slots = JSON.parse(slotsContent)
    }

    if (column === null) {
      delete slots[layer]
    } else if (data === null) {
      delete slots[layer][column]
    } else {
      slots[layer] = slots[layer] || {}
      slots[layer][column] = data
    }

    fs.writeFileSync(slotsPath, JSON.stringify(slots, null, 2), 'utf-8')
    return slots
  })

  ipcMain.handle('get-slots', async () => {
    const slotsPath = path.normalize(path.join(vmDataPath, 'slots.json'))
    if (fs.existsSync(slotsPath)) {
      const slotsContent = fs.readFileSync(slotsPath, 'utf-8')
      return JSON.parse(slotsContent)
    } else {
      return {}
    }
  })

  ipcMain.handle('add-order', async (event, order) => {
    const ordersPath = path.normalize(path.join(vmDataPath, 'orders'))
    fs.mkdirSync(ordersPath, { recursive: true })

    const date = new Date()
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const ordersFileName = `${y}${m}${d}.json`
    const ordersFilePath = path.normalize(path.join(ordersPath, ordersFileName))

    let orders = []
    if (fs.existsSync(ordersFilePath)) {
      const ordersContent = fs.readFileSync(ordersFilePath, 'utf-8')
      orders = JSON.parse(ordersContent)
    }

    orders.unshift(order)

    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8')
    return orders
  })

  ipcMain.handle('update-order', async (event, order) => {
    const ordersPath = path.normalize(path.join(vmDataPath, 'orders'))
    fs.mkdirSync(ordersPath, { recursive: true })

    const date = new Date()
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const ordersFileName = `${y}${m}${d}.json`
    const ordersFilePath = path.normalize(path.join(ordersPath, ordersFileName))

    let orders = []
    if (fs.existsSync(ordersFilePath)) {
      const ordersContent = fs.readFileSync(ordersFilePath, 'utf-8')
      orders = JSON.parse(ordersContent)
    }

    const idx = orders.findIndex((tx) => tx.id === order.id)

    if (idx !== -1) {
      // replace the item in the array so the change is persisted when writing the file
      orders[idx] = { ...orders[idx], ...order }
      fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8')
    }

    return orders
  })

  ipcMain.handle('get-orders', async () => {
    const ordersPath = path.normalize(path.join(vmDataPath, 'orders'))
    fs.mkdirSync(ordersPath, { recursive: true })

    const date = new Date()
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const ordersFileName = `${y}${m}${d}.json`
    const ordersFilePath = path.normalize(path.join(ordersPath, ordersFileName))

    if (fs.existsSync(ordersFilePath)) {
      const ordersContent = fs.readFileSync(ordersFilePath, 'utf-8')
      return JSON.parse(ordersContent)
    } else {
      return []
    }
  })

  ipcMain.handle('verify-totp', async (event, options) => {
    const valid = speakeasy.totp.verify(options)
    return valid
  })

  ipcMain.handle('dispense-slot', async (event, slot) => {
    try {
      if (is.dev) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true, message: '0,20,20,20,20,20' })
          }, 5000)
        })
      }
      const vendor = app.isPackaged
        ? path.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'mq', 'vendor.exe')
        : path.join(__dirname, '..', '..', 'resources', 'mq', 'vendor.exe')
      const result = await executeCommand(vendor + ' ' + slot)
      const message = result
        .split(',\r\n')
        .filter((item) => item.trim() !== '')
        .map((item) => {
          const parts = item.split('.')
          return parseInt(parts[1])
        })
      return { success: message.length > 5, message: message.join(',') }
    } catch (error) {
      return {
        success: false,
        message: `出货过程中发生意外错误：${error.message || '请联系售后'}`
      }
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
