import { useEffect, useState } from 'react'
import useAppStore from '@/stores/appStore'
const { ipcRenderer } = window.electron

// 处理广告数据
const processAdsData = async (ads) => {
  if (!ads || !Array.isArray(ads)) return []
  const processedAds = await Promise.all(
    ads.map(async (ad) => {
      try {
        ad.src = await ipcRenderer.invoke('get-file-path', ad.filename)
        return ad
      } catch (err) {
        console.error('处理广告数据错误:', err.message)
        return ad
      }
    })
  )
  return processedAds
}

// 处理商品数据
const processProductsData = async (products) => {
  if (!products || !Array.isArray(products)) return []
  const processedProducts = await Promise.all(
    products.map(async (product) => {
      try {
        product.src = await ipcRenderer.invoke('get-file-path', product.filename)
        return product
      } catch (err) {
        console.error('处理商品数据错误:', err.message)
        return product
      }
    })
  )
  return processedProducts
}

const useConfig = () => {
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { slots, setSlots, setConfig } = useAppStore()

  const getFullscreenStatus = async () => {
    const isFullscreen = await ipcRenderer.invoke('is-fullscreen')
    setIsFullscreen(isFullscreen)
    return isFullscreen
  }

  const toggleFullscreen = async () => {
    await ipcRenderer.invoke('toggle-fullscreen')
    return getFullscreenStatus()
  }

  const getSlots = async () => {
    const slots = await ipcRenderer.invoke('get-slots')
    return slots
  }

  const getConfig = async () => {
    const config = await ipcRenderer.invoke('get-config')
    if (config.password) config.password = config.password.toString()
    config.ads = await processAdsData(config.ads)
    config.products = await processProductsData(config.products)
    return config
  }

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true)
      getFullscreenStatus()
      const [slots, config] = await Promise.all([getSlots(), getConfig()])
      setSlots(slots)
      setConfig(config)
      setLoading(false)
    }
    loadConfig()
  }, [setConfig])

  const importConfig = async () => {
    try {
      const result = await ipcRenderer.invoke('import-config')
      if (result && result.success) {
        // 重新加载数据
        const config = await getConfig()
        setConfig(config)
        return { success: true, message: result.message }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const removeConfig = async () => {
    try {
      const result = await ipcRenderer.invoke('remove-config')
      if (result && result.success) {
        // 重新加载数据
        const config = await getConfig()
        setConfig(config)
        return { success: true, message: result.message }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  const updateSlot = async (layer, column, data) => {
    try {
      const slots = await ipcRenderer.invoke('update-slot', layer, column, data)
      setSlots(slots)
    } catch (err) {
      console.error(err.message)
    }
  }

  const getProductStock = (productId) => {
    let total = 0
    for (const layer in slots) {
      // 遍历区域中的所有槽位
      for (const column in slots[layer]) {
        const slot = slots[layer][column]
        if (slot.productId === productId) {
          total += slot.quantity
        }
      }
    }
    return total
  }

  const testSlot = async (slot) => {
    const result = await ipcRenderer.invoke('dispense-slot', slot)
    return result
  }

  return {
    loading,
    isFullscreen,
    toggleFullscreen,
    importConfig,
    removeConfig,
    updateSlot,
    getProductStock,
    testSlot
  }
}

export default useConfig
