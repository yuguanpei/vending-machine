import React, { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Plus, Minus, Trash2, Package, Layers, Bug } from 'lucide-react'
import useAppStore from '@/stores/appStore'
import useConfig from '@/hooks/useConfig'

const SlotManagement = () => {
  const { products, slots } = useAppStore()
  const { updateSlot, testSlot } = useConfig()
  const [currentLayer, setCurrentLayer] = useState(null)
  const [currentColumn, setCurrentColumn] = useState(null)

  // 获取所有层并排序
  const layers = Object.keys(slots).sort()

  // 获取当前选中货道
  const currentSlot = slots[currentLayer]?.[currentColumn] || { productId: null, quantity: 0 }

  const layerLetters = ['A', 'B', 'C', 'D', 'E', 'F']

  // 添加新层（只能添加到F层）
  const addLayer = async () => {
    const existingLayers = Object.keys(slots)
    // 找到下一个可用的层字母
    const nextLayer = layerLetters.find((letter) => !existingLayers.includes(letter))
    // 新层默认一个01货道
    const newColumn = '01'
    await updateSlot(nextLayer, newColumn, currentSlot)
    setCurrentLayer(nextLayer)
    setCurrentColumn(newColumn)
  }

  // 删除层（只能从下往上删）
  const removeLayer = async (layerToRemove) => {
    const existingLayers = Object.keys(slots)
    // 找到下一个可用的层字母
    const prevLayer = layerLetters[existingLayers.length - 2]
    await updateSlot(layerToRemove, null)
    // 如果删除的是当前选中的层，清空当前所选
    if (layerToRemove === currentLayer) {
      setCurrentLayer(prevLayer)
      setCurrentColumn('01')
    }
  }

  // 添加货道列（最大到10列）
  const addColumn = async (layer) => {
    const layerColumns = Object.keys(slots[layer])
    const nextColumnNumber = layerColumns.length + 1
    const nextColumn = nextColumnNumber.toString().padStart(2, '0')
    await updateSlot(layer, nextColumn, currentSlot)
    setCurrentColumn(nextColumn)
  }

  // 删除货道列（只能从后往前删）
  const removeColumn = async (layer, columnToRemove) => {
    const layerColumns = Object.keys(slots[layer])
    const prevColumnNumber = layerColumns.length - 1
    const prevColumn = prevColumnNumber.toString().padStart(2, '0')
    await updateSlot(layer, columnToRemove, null)
    // 如果删除的是当前选中的列，切换到前一列
    if (layer === currentLayer && columnToRemove === currentColumn) {
      setCurrentColumn(prevColumn)
    }
  }

  // 更新货道商品
  const handleProductChange = async (productId) => {
    const slot = slots[currentLayer][currentColumn]
    slot.productId = productId
    await updateSlot(currentLayer, currentColumn, slot)
  }

  // 更新货道数量
  const handleQuantityChange = async (quantity) => {
    const slot = slots[currentLayer][currentColumn]
    slot.quantity = quantity
    await updateSlot(currentLayer, currentColumn, slot)
  }

  // 测试出货
  const handleTestDispense = async () => {
    const result = await testSlot(currentLayer + currentColumn)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.info(result.message)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            货道管理
          </CardTitle>
          <CardDescription>管理自动售货机的货道及其商品和库存</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧2/3 - 货道结构 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">货道结构</h3>
              {Object.keys(slots).length < 6 && (
                <Button variant="outline" size="sm" onClick={addLayer}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加层
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Accordion
              type="single"
              collapsible
              value={currentLayer}
              onValueChange={(v) => {
                setCurrentLayer(v)
                setCurrentColumn('01')
              }}
              className="w-full"
            >
              {layers.map((layer, index) => (
                <AccordionItem key={layer} value={layer}>
                  <div className="w-full pr-4">
                    <AccordionTrigger className="hover:no-underline flex-1">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">层 {layer}</span>
                        {index === layers.length - 1 && ( // 只在最后一个显示
                          <Trash2
                            className="h-4 w-4 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeLayer(layer)
                            }}
                          />
                        )}
                      </div>
                    </AccordionTrigger>
                  </div>
                  <AccordionContent>
                    <div className="space-y-3">
                      {/* 横向排列的货道 */}
                      <div className="flex flex-wrap gap-2">
                        {slots[layer] &&
                          Object.keys(slots[layer])
                            .sort()
                            .map((column) => (
                              <div
                                key={column}
                                className={`p-3 rounded-lg bg-accent border cursor-pointer transition-colors w-[50px] h-[50px] ${
                                  layer === currentLayer && column === currentColumn
                                    ? 'border-primary bg-primary/10'
                                    : 'border-muted hover:bg-muted/50'
                                }`}
                                onClick={() => {
                                  setCurrentLayer(layer)
                                  setCurrentColumn(column)
                                }}
                              >
                                <div className="text-center">
                                  <span className="font-medium block">
                                    {layer}
                                    {column}
                                  </span>
                                </div>
                              </div>
                            ))}
                        {/* 添加货道按钮 */}
                        {Object.keys(slots[layer]).length < 10 && (
                          <button
                            onClick={() => addColumn(layer)}
                            className="p-3 rounded-lg border border-dashed border-muted hover:border-primary hover:bg-primary/5 transition-colors w-[50px] h-[50px] flex items-center justify-center"
                          >
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* 右侧1/3 - 货道详情和操作 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">货道详情</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentLayer && currentColumn && slots[currentLayer]?.[currentColumn] ? (
              <>
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-lg">
                    货道 {currentLayer}
                    {currentColumn}
                  </h4>

                  {currentLayer &&
                    currentColumn &&
                    Object.keys(slots[currentLayer]).length > 1 &&
                    Object.keys(slots[currentLayer])[
                      Object.keys(slots[currentLayer]).length - 1
                    ] === currentColumn && (
                      <Trash2
                        className="h-4 w-4 cursor-pointer"
                        onClick={() => removeColumn(currentLayer, currentColumn)}
                      />
                    )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">选择商品</label>
                    <Select value={currentSlot.productId} onValueChange={handleProductChange}>
                      <SelectTrigger className="w-full mt-4">
                        <SelectValue placeholder="请选择商品" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={0}>未选择</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex items-center gap-2">
                              {product.src && (
                                <img
                                  src={product.src}
                                  alt={product.name}
                                  className="w-6 h-6 object-cover rounded"
                                />
                              )}
                              <span>{product.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">调整数量</label>
                    <div className="flex items-center mt-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(currentSlot.quantity - 1)}
                        disabled={currentSlot.productId === 0 || currentSlot.quantity <= 0}
                        className="h-10 w-10 rounded-r-none"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={currentSlot.quantity}
                        className="h-10  w-full rounded-none text-center border-x-0"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(currentSlot.quantity + 1)}
                        disabled={currentSlot.productId === 0 || currentSlot.quantity >= 10}
                        className="h-10 w-10 rounded-l-none"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button className="w-full" variant="outline" onClick={handleTestDispense}>
                    <Bug className="h-4 w-4" />
                    测试出货
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Package className="h-12 w-12 mb-2" />
                <p>请选择一个货道进行配置</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SlotManagement
