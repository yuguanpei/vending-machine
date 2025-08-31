import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Package, Image } from 'lucide-react'
import useConfig from '@/hooks/useConfig'
const ProductManagement = ({ products }) => {
  const [currentProduct, setCurrentProduct] = useState(null)
  const { getProductStock } = useConfig()

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            商品管理
          </CardTitle>
          <CardDescription>管理自动售货机中的商品信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无商品数据</h3>
            <p className="text-muted-foreground text-center mb-4">
              当前没有可管理的商品，请先导入配置
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            商品管理
          </CardTitle>
          <CardDescription>管理自动售货机中出售的商品</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 商品列表 */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">商品列表</h3>
              <Badge variant="secondary">{products.length} 个商品</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-1 p-2">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`p-3 cursor-pointer rounded-lg transition-colors ${
                      currentProduct && currentProduct.id === product.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                    onClick={() => setCurrentProduct(product)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 relative">
                        {product.src ? (
                          <img
                            src={product.src}
                            alt={product.name}
                            className="w-12 h-12 object-contain rounded-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                            <Image className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{product.name}</p>
                        <p className="text-sm text-muted-foreground">¥{product.price.toFixed(2)}</p>
                      </div>
                      {/* <Badge
                        variant={product.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {product.status === 'active' ? '上架' : '下架'}
                      </Badge> */}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 商品详情 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">商品详情</h3>
            </div>
          </CardHeader>
          <CardContent>
            {currentProduct ? (
              <div className="space-y-6">
                {/* 商品图片和基本信息 */}
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-shrink-0">
                    {currentProduct.src ? (
                      <img
                        src={currentProduct.src}
                        alt={currentProduct.name}
                        className="w-32 h-32 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                        <Image className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="text-2xl font-bold">{currentProduct.name}</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl text-red-500 font-bold">
                        ¥{currentProduct.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 商品详情表单 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">商品名称</label>
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <span className="pl-2">{currentProduct.name}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">价格 (¥)</label>
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <span className="pl-2">{currentProduct.price}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">库存数量</label>
                    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                      <span className="pl-2">{getProductStock(currentProduct.id)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">商品状态</label>
                    <div className="flex items-center gap-2 p-2 pl-4 bg-muted/50 rounded-md">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>正常</span>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">商品描述</label>
                    <div
                      className="mb-4 mt-4"
                      dangerouslySetInnerHTML={{
                        __html: currentProduct.description || '无'
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">选择商品</h3>
                <p className="text-muted-foreground text-center">
                  从商品列表中选择一个商品查看详细信息
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProductManagement
