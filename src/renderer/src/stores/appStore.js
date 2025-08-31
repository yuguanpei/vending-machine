import { create } from 'zustand'

const useAppStore = create((set, get) => ({
  // 设备信息
  vid: null,
  password: null,
  secret: null,
  products: [],
  ads: [],
  base: 'https://www.codeasier.com/vm/pay',
  setConfig: (data) => {
    if (data?.vid) set({ vid: data.vid })
    if (data?.password) set({ password: data.password })
    if (data?.secret) set({ secret: data.secret })
    if (data?.base) set({ base: data.base })
    if (data?.products) set({ products: data.products })
    if (data?.ads) set({ ads: data.ads })
  },
  // 货道配置
  slots: {},
  setSlots: (data) => {
    set({ slots: data })
  },

  // 管理面板认证模态框状态
  isAdminAuthModalOpen: false,
  openAdminAuthModal: () => set({ isAdminAuthModalOpen: true }),
  closeAdminAuthModal: () => set({ isAdminAuthModalOpen: false }),

  // 管理面板状态
  isAdminPanelOpen: false,
  openAdminPanel: () => set({ isAdminAuthModalOpen: false, isAdminPanelOpen: true }),
  closeAdminPanel: () => set({ isAdminPanelOpen: false }),

  // 商品详情模态框状态
  currentProduct: null,
  isProductModalOpen: false,
  openProductModal: (product) => set({ currentProduct: product, isProductModalOpen: true }),
  closeProductModal: () => set({ isProductModalOpen: false }), // currentProduct: null

  // 购物车模态框状态
  isCartModalOpen: false,
  openCartModal: () => set({ isCartModalOpen: true }),
  closeCartModal: () => set({ isCartModalOpen: false }),
  // 购物车操作
  cart: [],
  setCart: (data) => {
    set({ cart: data })
  },

  // 订单状态
  currentOrder: null,
  setCurrentOrder: (order) => set({ currentOrder: order }),

  // 支付模态框状态
  isPaymentModalOpen: false,
  openPaymentModal: (order) => set({ currentOrder: order, isPaymentModalOpen: true }),
  closePaymentModal: () => set({ isPaymentModalOpen: false, currentOrder: null }),

  // 订单查询模态框状态
  isOrderQueryModalOpen: false,
  openOrderQueryModal: () => set({ isOrderQueryModalOpen: true }),
  closeOrderQueryModal: () => set({ isOrderQueryModalOpen: false })
}))

export default useAppStore
