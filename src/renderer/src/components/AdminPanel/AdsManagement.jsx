import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Monitor, Image, Video, ArrowUp, ArrowDown } from 'lucide-react'
import useAppStore from '@/stores/appStore'

const AdsManagement = ({ ads }) => {
  const { setConfig } = useAppStore()
  const [currentAd, setCurrentAd] = useState(null)

  const moveUp = (index) => {
    if (index === 0) return
    const newAds = [...ads]
    ;[newAds[index], newAds[index - 1]] = [newAds[index - 1], newAds[index]]
    setConfig({ ads: newAds })
  }

  const moveDown = (index) => {
    if (index === ads.length - 1) return
    const newAds = [...ads]
    ;[newAds[index], newAds[index + 1]] = [newAds[index + 1], newAds[index]]
    setConfig({ ads: newAds })
  }

  if (!ads || ads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            广告管理
          </CardTitle>
          <CardDescription>管理自动售货机中的广告内容</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
            <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无广告数据</h3>
            <p className="text-muted-foreground text-center mb-4">
              当前没有可管理的广告，请先导入配置
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
            <Monitor className="h-5 w-5" />
            广告管理
          </CardTitle>
          <CardDescription>管理自动售货机中显示的广告</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 广告列表 */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">广告列表</h3>
              <Badge variant="secondary">{ads.length} 个广告</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="space-y-1 p-2">
                {ads.map((ad, index) => (
                  <div
                    key={ad.id}
                    className={`p-3 cursor-pointer rounded-lg transition-colors ${
                      currentAd && currentAd.id === ad.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                    onClick={() => setCurrentAd(ad)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {ad.type === 'image' ? (
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                            <Image className="h-6 w-6 text-muted-foreground" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                            <Video className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{ad.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {ad.type === 'image' ? '图片' : '视频'}
                          </Badge>
                        </div>
                      </div>
                      {/* {currentAd && currentAd.id === ad.id && (
                        <>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="size-8 cursor-pointer"
                            disabled={index === 0}
                            onClick={() => moveUp(index)}
                          >
                            <ArrowUp />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="size-8 cursor-pointer"
                            disabled={index === ads.length - 1}
                            onClick={() => moveDown(index)}
                          >
                            <ArrowDown />
                          </Button>
                        </>
                      )} */}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 广告预览和详情 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">广告详情</h3>
            </div>
          </CardHeader>
          <CardContent>
            {currentAd ? (
              <div className="space-y-6">
                {/* 广告预览 */}
                <div className="space-y-3">
                  {/* <h4 className="font-medium">广告预览</h4> */}
                  <div className="border rounded-lg p-4 bg-muted/20">
                    {currentAd.type === 'image' ? (
                      <div className="flex items-center justify-center rounded-lg overflow-hidden">
                        <img src={currentAd.src} alt="广告预览" className="object-contain" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center rounded-lg overflow-hidden">
                        <video src={currentAd.src} autoPlay loop className="object-contain" />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* 广告信息 */}
                <div className="space-y-4">
                  {/* <h4 className="font-medium">广告信息</h4> */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">名称</label>
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <span className="pl-2">{currentAd.title}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">类型</label>
                      <div className="flex items-center gap-2 p-2 pl-4 bg-muted/50 rounded-md">
                        {currentAd.type === 'image' ? (
                          <>
                            <Image className="h-4 w-4" />
                            <span>图片</span>
                          </>
                        ) : (
                          <>
                            <Video className="h-4 w-4" />
                            <span>视频</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">播放时长 (毫秒)</label>
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                        <span className="pl-2">{currentAd.duration || '-'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">状态</label>
                      <div className="flex items-center gap-2 p-2 pl-4 bg-muted/50 rounded-md">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        <span>正常</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg">
                <Monitor className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">选择广告</h3>
                <p className="text-muted-foreground text-center">
                  从广告列表中选择一个广告查看详细信息
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdsManagement
