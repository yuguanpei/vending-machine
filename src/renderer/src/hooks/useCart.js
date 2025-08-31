import useAppStore from '@/stores/appStore'

const useCart = () => {
  const { cart, setCart } = useAppStore()

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        return { success: false, message: '库存不足' }
      }
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      )
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
    return { success: true }
  }

  const removeFromCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
        )
      )
    } else {
      setCart(cart.filter((item) => item.id !== product.id))
    }
    return { success: true }
  }

  const clearCart = () => setCart([])
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return {
    addToCart,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice
  }
}

export default useCart
