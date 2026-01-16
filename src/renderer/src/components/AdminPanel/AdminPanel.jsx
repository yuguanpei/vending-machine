import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  Fullscreen,
  Minimize,
  Trash2,
  Download,
  Home,
  Package,
  Monitor,
  Container,
  Shield
} from 'lucide-react'
import useAppStore from '@/stores/appStore'
import useConfig from '@/hooks/useConfig'
import useCountdown from '@/hooks/useCountdown'
import AdsManagement from './AdsManagement'
import ProductManagement from './ProductManagement'
import SlotManagement from './SlotManagement'

const AdminPanel = () => {
  const { vid, closeAdminPanel, isAdminPanelOpen, products, ads } = useAppStore()
  const { isFullscreen, toggleFullscreen, importConfig, removeConfig } = useConfig()
  const [activeTab, setActiveTab] = useState('products')
  const [now, setNow] = useState(new Date())

  const TIMEOUT_SECONDS = 60
  const { remaining, resetTimer } = useCountdown(TIMEOUT_SECONDS, closeAdminPanel, isAdminPanelOpen)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const handleImportConfig = async () => {
    const { success, message } = await importConfig()
    toast[success ? 'success' : 'error'](message)
  }

  const handleRemoveConfig = async () => {
    const { success, message } = await removeConfig()
    toast[success ? 'success' : 'error'](message)
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto" onClick={() => resetTimer()}>
      <Card className="rounded-none border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">管理面板</CardTitle>
              <CardDescription>商品广告及货道管理</CardDescription>
            </div>
            {/* current time */}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleImportConfig} variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" />
              导入配置
            </Button>
            <Button onClick={handleRemoveConfig} variant="outline" size="sm" className="gap-1">
              <Trash2 className="h-4 w-4" />
              清理数据
            </Button>
            <Button onClick={toggleFullscreen} variant="outline" size="sm" className="gap-1">
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Fullscreen className="h-4 w-4" />}
              {isFullscreen ? '退出全屏' : '进入全屏'}
            </Button>
            <Button onClick={closeAdminPanel} variant="outline" size="sm" className="gap-1">
              <Home className="h-4 w-4" />
              返回主页
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* 选项卡导航 */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              商品管理
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              广告管理
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center gap-2">
              <Container className="h-4 w-4" />
              货道管理
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-4">
            <ProductManagement products={products || []} />
          </TabsContent>

          <TabsContent value="ads" className="mt-4">
            <AdsManagement ads={ads || []} />
          </TabsContent>

          <TabsContent value="channels" className="mt-4">
            <SlotManagement products={products || []} />
          </TabsContent>
        </Tabs>
      </div>

      {/* 操作提示 */}
      <div className="p-4">
        <Alert variant="default" className="bg-muted">
          <AlertTitle>管理员提示</AlertTitle>
          <AlertDescription>
            您正在修改配置，请谨慎操作。所有更改将直接应用并生效。
          </AlertDescription>
        </Alert>
      </div>

      {/* 底部区域 */}
      <div className="fixed bottom-2 w-full flex justify-between px-4">
        {/* 版权信息 */}
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-auto p-1">
          © {new Date().getFullYear()} Vending Machine v1.0
        </Button>
        {/* 系统时间 */}
        <span className="text-xs font-bold text-primary h-auto p-1">
          {vid}@{now.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default AdminPanel
