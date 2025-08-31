import { useEffect, useState } from 'react'
import useAppStore from '@/stores/appStore'
import useConfig from '@/hooks/useConfig'
import useCart from '@/hooks/useCart'
import { toast } from 'sonner'
const { ipcRenderer } = window.electron

const useOrder = () => {
  // const [orders, setOrders] = useState([])
  const { vid, secret, openPaymentModal, products, slots, cart, setCart, currentOrder } =
    useAppStore()
  const { updateSlot, getProductStock } = useConfig()
  const { clearCart } = useCart()
  const [isDispensing, setIsDispensing] = useState(false)
  const [dispenseInfo, setDispenseInfo] = useState(null)

  const getOrders = async () => {
    const orders = await ipcRenderer.invoke('get-orders')
    return orders
  }

  const addOrder = async (order) => {
    try {
      await ipcRenderer.invoke('add-order', order)
      // const orders = await ipcRenderer.invoke('add-order', order)
      // setOrders(orders)
    } catch (err) {
      console.error(err.message)
    }
  }

  const updateOrder = async (order) => {
    try {
      await ipcRenderer.invoke('update-order', order)
      // const orders = await ipcRenderer.invoke('update-order', order)
      // setOrders(orders)
    } catch (err) {
      console.error(err.message)
    }
  }

  // useEffect(() => {
  //   const loadOrders = async () => {
  //     const orders = await getOrders()
  //     setOrders(orders)
  //   }
  //   loadOrders()
  // }, [getOrders])

  // helper: SHA-256 -> hex
  const sha256Hex = async (input) => {
    const enc = new TextEncoder()
    const data = enc.encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  const encryptOrder = async (order, secret) => {
    if (!secret) return null
    const plain = typeof order === 'string' ? order : JSON.stringify(order)

    const enc = new TextEncoder()
    const data = enc.encode(plain)

    // derive 32-byte key = SHA-256(secret)
    const secretBuf = enc.encode(String(secret))
    const hashBuf = await crypto.subtle.digest('SHA-256', secretBuf) // ArrayBuffer (32 bytes)
    const key = await crypto.subtle.importKey('raw', hashBuf, { name: 'AES-GCM' }, false, [
      'encrypt'
    ])

    // AES-GCM with 12-byte IV, WebCrypto appends 16-byte auth tag to ciphertext
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)

    // combine iv + ciphertext+tag and base64 encode
    const combined = new Uint8Array(iv.byteLength + cipherBuffer.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(cipherBuffer), iv.byteLength)

    let binary = ''
    for (let i = 0; i < combined.length; i++) binary += String.fromCharCode(combined[i])
    return btoa(binary)
  }

  const createOrder = async (products, type) => {
    const createdAt = Date.now()

    // normalize items and total
    const items = products.map((p) => ({
      productId: p.id,
      name: p.name,
      price: Number(p.price) || 0,
      quantity: Number(p.quantity) || 1
    }))
    const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0)

    // generate id based on products, vid and timestamp
    const payloadForId = JSON.stringify({
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      vid,
      ts: createdAt
    })
    // 生成基础ID
    const baseId = (await sha256Hex(payloadForId)).slice(0, 10)
    // 添加时间戳的最后6位数字作为保证
    const timestampDigits = createdAt.toString().slice(-6)
    const id = baseId + timestampDigits

    const order = {
      id, // 订单id
      items, // [{ productId, name, price, quantity }] — 商品列表
      total, // 总金额
      status: 'pending', // 当前状态（"pending" | "cancel" | "timeout" | "paid" | "dispensed"）
      metadata: { vid }, // 自定义键值
      createdAt, // 时间戳
      type
    }

    order.token = await encryptOrder(
      {
        id: order.id,
        items: order.items.map((item) => ({
          id: item.productId,
          price: item.price,
          count: item.quantity
        })),
        total: order.total
      },
      secret
    )

    // persist/update and open payment modal with order
    await addOrder(order)
    openPaymentModal(order)
  }

  const verifyTotpCode = async (totpCode) => {
    const valid = await ipcRenderer.invoke('verify-totp', {
      secret: secret + '-' + currentOrder.id,
      encoding: 'base32',
      token: totpCode,
      window: 0
    })

    if (valid) {
      updateOrder({ ...currentOrder, status: 'paid' })

      // compute slot codes to dispense, e.g. "A01"
      // make a deep copy of slots and consume quantities
      const slotsCopy = JSON.parse(JSON.stringify(slots))
      const dispenseSlots = []

      // helper to try fulfill a single item (by productId and quantity)
      const fulfillItem = (productId, quantity) => {
        let need = quantity
        const layers = Object.keys(slotsCopy).sort()
        for (const layer of layers) {
          const columns = Object.keys(slotsCopy[layer]).sort()
          for (const column of columns) {
            const slot = slotsCopy[layer][column]
            if (slot.productId != productId) continue
            while (need > 0 && slot.quantity > 0) {
              slot.quantity -= 1
              need -= 1
              dispenseSlots.push(`${layer}${column}`)
            }
            if (need === 0) break
          }
          if (need === 0) break
        }
        return need === 0
      }

      // try fulfill all items
      let ok = true
      for (const item of currentOrder.items) {
        const success = fulfillItem(item.productId, item.quantity)
        if (!success) {
          ok = false
          break
        }
      }

      if (!ok) {
        return { success: false, message: '库存不足' }
      }

      dispense(dispenseSlots)

      return { success: true }
    } else {
      return {
        success: false,
        message: '验证码错误'
      }
    }
  }

  const dispense = async (dispenseSlots) => {
    const dispenses = []
    if (dispenseSlots.length) {
      setIsDispensing(true)
    }
    for (let index = 0; index < dispenseSlots.length; index++) {
      const dispenseSlot = dispenseSlots[index]
      const layer = dispenseSlot[0]
      const column = dispenseSlot.slice(1)
      setDispenseInfo({
        slot: dispenseSlot,
        product: products.find((product) => product.id === slots[layer][column].productId),
        ...(dispenseSlots.length > 1 ? { index: index + 1 } : {})
      })
      const result = await ipcRenderer.invoke('dispense-slot', dispenseSlot)
      if (result.success) {
        slots[layer][column].quantity -= 1
        await updateSlot(layer, column, slots[layer][column])
        if (currentOrder.type === 'product') {
          const { productId } = slots[layer][column]
          const stock = getProductStock(productId)
          const existingItem = cart.find((item) => item.id === productId)
          if (existingItem && existingItem.quantity > stock) {
            if (stock === 0) {
              setCart(cart.filter((item) => item.id !== productId))
            } else {
              setCart(
                cart.map((item) => (item.id === productId ? { ...item, quantity: stock } : item))
              )
            }
          }
        }
      } else {
        toast.error(result.message)
      }
      dispenses.push({
        slot: dispenseSlot,
        ...result
      })
    }
    setIsDispensing(false)
    setTimeout(() => {
      setDispenseInfo(null)
    }, 1000)
    updateOrder({ ...currentOrder, status: 'dispensed', dispenses })
    toast.success('交易完成，请取走您的商品')

    if (currentOrder.type === 'cart') {
      clearCart()
    }
  }

  return {
    // orders,
    getOrders,
    createOrder,
    updateOrder,
    verifyTotpCode,
    isDispensing,
    dispenseInfo
  }
}

export default useOrder
