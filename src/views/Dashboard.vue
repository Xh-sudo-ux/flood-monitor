<template>
  <div class="dashboard-page">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon blue">
            <el-icon size="24"><Pouring /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.totalRainfall.toFixed(1) }}</div>
            <div class="stat-label">累计降雨量 (mm)</div>
            <div class="stat-change up">↑ 12.5%</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon cyan">
            <el-icon size="24"><Watermelon /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.avgWaterLevel.toFixed(2) }}</div>
            <div class="stat-label">平均水位 (m)</div>
            <div class="stat-change down">↓ 3.2%</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon orange">
            <el-icon size="24"><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.warningStations + statistics.dangerStations }}</div>
            <div class="stat-label">预警站点数</div>
            <div class="stat-change up">↑ 8.1%</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon purple">
            <el-icon size="24"><MapLocation /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.totalInundationArea.toFixed(2) }}</div>
            <div class="stat-label">淹没面积 (km²)</div>
            <div class="stat-change down">↓ 5.4%</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 中间区域：地图 + 两侧图表 -->
    <el-row :gutter="16" class="main-row">
      <!-- 左侧图表 -->
      <el-col :xs="24" :lg="6">
        <div class="left-panel">
          <!-- 实时降雨情况 -->
          <div class="panel-card">
            <div class="panel-header">
              <span class="panel-title">实时降雨情况</span>
            </div>
            <div class="rainfall-content">
              <div class="rainfall-stats">
                <div class="stat-item">
                  <span class="label">当日累计降雨量</span>
                  <span class="value">124 mm</span>
                </div>
                <div class="stat-item">
                  <span class="label">近3日累计降雨量</span>
                  <span class="value">124 mm</span>
                </div>
              </div>
              <v-chart class="chart" :option="rainfallBarOption" autoresize />
            </div>
          </div>
        </div>
      </el-col>

      <!-- 中间地图 -->
      <el-col :xs="24" :lg="12">
        <div class="map-panel">
          <div class="map-container">
            <div class="map-title">洪涝检测系统</div>
            <!-- 地图切换按钮 -->
            <div class="map-switcher">
              <el-button 
                size="small" 
                :type="currentMapType === '街道地图' ? 'primary' : 'default'"
                @click="switchMapType('街道地图')"
              >
                街道地图
              </el-button>
              <el-button 
                size="small" 
                :type="currentMapType === '卫星地图' ? 'primary' : 'default'"
                @click="switchMapType('卫星地图')"
              >
                卫星地图
              </el-button>
            </div>
            <div class="map-content">
              <!-- 真实在线地图区域 -->
              <div id="real-map" style="width:100%;height:100%"></div>
            </div>
            <!-- 底部功能按钮 -->
            <div class="map-actions">
              <div class="action-btn">
                <el-icon><Setting /></el-icon>
                <span>防汛调度</span>
              </div>
              <div class="action-btn active">
                <el-icon><Watermelon /></el-icon>
                <span>水雨情</span>
              </div>
              <div class="action-btn">
                <el-icon><OfficeBuilding /></el-icon>
                <span>工程管理</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧图表 -->
      <el-col :xs="24" :lg="6">
        <div class="right-panel">
          <!-- 河道实时水情 -->
          <div class="panel-card">
            <div class="panel-header">
              <span class="panel-title">河道实时水情</span>
            </div>
            <div class="river-table">
              <el-table
                :data="riverTableData"
                size="small"
                :header-cell-style="{ background: 'transparent', color: '#a8b5c8', border: 'none' }"
                :cell-style="{ background: 'transparent', color: '#fff', border: 'none' }"
              >
                <el-table-column prop="name" label="站点" width="80" />
                <el-table-column prop="level" label="水位" width="60" />
                <el-table-column prop="flow" label="流量" width="60" />
                <el-table-column prop="status" label="状态" width="60">
                  <template #default="{ row }">
                    <span :class="'status-' + row.status">{{ row.statusText }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 水位实时变化趋势 -->
          <div class="panel-card">
            <div class="panel-header">
              <span class="panel-title">水位实时变化趋势</span>
              <el-select v-model="selectedRiver" size="small" style="width: 100px">
                <el-option label="青狮潭" value="qst" />
                <el-option label="斧子口" value="fzk" />
              </el-select>
            </div>
            <div class="trend-chart">
              <v-chart class="chart" :option="waterLevelTrendOption" autoresize />
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 预警信息弹窗 -->
    <div class="alert-panel">
      <div class="alert-header">
        <el-icon color="#f5222d"><Warning /></el-icon>
        <span>暴雨预警</span>
      </div>
      <div class="alert-content">
        <div class="alert-item" v-for="alert in alerts.slice(0, 3)" :key="alert.id">
          <div class="alert-title">{{ alert.title }}</div>
          <div class="alert-desc">{{ alert.content }}</div>
          <div class="alert-time">{{ alert.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import {
  Pouring,
  Watermelon,
  Warning,
  MapLocation,
  Sunny,
  Setting,
  OfficeBuilding
} from '@element-plus/icons-vue'
import { useMonitorStore } from '@/stores/monitor'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

const monitorStore = useMonitorStore()
const statistics = computed(() => {
  return {
    totalRainfall: 124.0, // 保留原有降雨数据
    avgWaterLevel: 228.5, // 青狮潭/斧子口/小溶江/川江的水位平均值
    warningStations: 1,   // 仅斧子口为预警站点
    dangerStations: 0,
    totalInundationArea: 26.50
  }
})
const alerts = computed(() => monitorStore.alerts)

const selectedRiver = ref('wei')

// 河道水情表格数据
const riverTableData = ref([
  { name: "青狮潭", level: "222.0m", flow: "26m", status: "normal", statusText: "正常" },
  { name: "斧子口", level: "242.0m", flow: "28m", status: "warning", statusText: "预警" },
  { name: "小溶江", level: "256.0m", flow: "28m", status: "normal", statusText: "正常" },
  { name: "川江", level: "250.0m", flow: "28m", status: "normal", statusText: "正常" }
])

// 降雨量柱状图配置
const rainfallBarOption = computed(() => ({
  backgroundColor: 'transparent',
  grid: { left: '15%', right: '5%', top: '10%', bottom: '25%' },
  xAxis: {
    type: 'category',
    data: ['3日', '4日', '5日', '6日', '7日', '8日', '9日', '10日'],
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8', fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisLabel: { color: '#a8b5c8', fontSize: 10 },
    splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
  },
  series: [{
    type: 'bar',
    data: [120, 200, 150, 80, 70, 110, 130, 100],
    itemStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: '#00d9ff' },
          { offset: 1, color: '#0d7377' }
        ]
      },
      borderRadius: [4, 4, 0, 0]
    }
  }]
}))

// 水位变化趋势图配置
const waterLevelTrendOption = computed(() => ({
  backgroundColor: 'transparent',
  grid: { left: '15%', right: '5%', top: '10%', bottom: '20%' },
  xAxis: {
    type: 'category',
    data: ["0时", "4时", "8时", "12时", "16时", "20时", "24时"],
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8', fontSize: 9, rotate: 30 }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisLabel: { color: '#a8b5c8', fontSize: 10 },
    splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
  },
  series: [{
    type: 'line',
    data: [221.5, 221.8, 222.0, 222.1, 222.0, 221.9, 222.0],
    smooth: true,
    lineStyle: { color: '#00d9ff', width: 2 },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(0, 217, 255, 0.3)' },
          { offset: 1, color: 'rgba(0, 217, 255, 0)' }
        ]
      }
    },
    symbol: 'none'
  }]
}))

// 声明AMap全局变量
declare global {
  interface Window {
    AMap: any
  }
}

// 声明Leaflet全局变量
declare global {
  interface Window {
    L: any
  }
}

// 缓存地图实例
let mapInstance: any = null
// 存储地图图层
let mapLayers: any = {}
// 当前地图类型
const currentMapType = ref('街道地图')

// 初始化地图
onMounted(() => {
  // 检查地图容器是否存在
  const mapContainer = document.getElementById('real-map')
  if (!mapContainer) {
    console.error('地图容器不存在')
    return
  }

  console.log('地图容器尺寸:', mapContainer.offsetWidth, 'x', mapContainer.offsetHeight)

  // 动态加载Leaflet CSS
  const leafletCSS = document.createElement('link')
  leafletCSS.rel = 'stylesheet'
  leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
  leafletCSS.crossOrigin = ''
  document.head.appendChild(leafletCSS)

  // 动态加载Leaflet JS
  const leafletScript = document.createElement('script')
  leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
  leafletScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
  leafletScript.crossOrigin = ''
  
  leafletScript.onload = function() {
    if (window.L) {
      console.log('Leaflet地图库加载成功')
      // 确保DOM完全渲染后再初始化地图
      setTimeout(() => {
        initMap()
      }, 100)
    } else {
      console.error('Leaflet地图库加载失败')
      showFallbackMap()
    }
  }
  
  leafletScript.onerror = function() {
    console.error('Leaflet地图库脚本加载失败')
    showFallbackMap()
  }
  
  document.head.appendChild(leafletScript)
})


function initMap() {
  try { 
    const mapContainer = document.getElementById('real-map')
    if (!mapContainer) {
      console.error('地图容器不存在')
      return
    }

    console.log('初始化时地图容器尺寸:', mapContainer.offsetWidth, 'x', mapContainer.offsetHeight)

    // 创建Leaflet地图实例
    mapInstance = window.L.map('real-map').setView([25.77, 110.12], 11)

    // 定义多个地图图层
    mapLayers = {
      // 街道地图 - 使用多个备选服务
      "街道地图": window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }),
      // 卫星地图
      "卫星地图": window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; <a href="https://www.arcgis.com/">Esri</a>',
        maxZoom: 19
      })
    }

    // 尝试添加街道地图的备选方案（多种类型）
    const streetMapAlternatives = [
      // 1. 高德地图瓦片（可能不需要API密钥）
      window.L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        subdomains: ['1', '2', '3', '4'],
        attribution: '&copy; <a href="https://ditu.amap.com/">高德地图</a>',
        maxZoom: 19
      }),
      // 2. 腾讯地图瓦片
      window.L.tileLayer('https://rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={y}&styleid=1&version=117', {
        subdomains: ['0', '1', '2'],
        attribution: '&copy; <a href="https://map.qq.com/">腾讯地图</a>',
        maxZoom: 18
      }),
      // 3. 百度地图瓦片
      window.L.tileLayer('https://api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&customid=light', {
        attribution: '&copy; <a href="https://map.baidu.com/">百度地图</a>',
        maxZoom: 18
      }),
      // 4. OpenStreetMap标准瓦片
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }),
      // 5. OpenStreetMap备用瓦片
      window.L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 20
      })
    ]

    // 尝试添加默认图层（街道地图），使用备选方案
    let defaultLayerAdded = false
    let actualStreetLayer = null
    
    if (currentMapType.value === '街道地图') {
      // 尝试多个街道地图服务
      for (let i = 0; i < streetMapAlternatives.length; i++) {
        try {
          streetMapAlternatives[i].addTo(mapInstance)
          actualStreetLayer = streetMapAlternatives[i]
          console.log(`街道地图备选方案 ${i + 1} 添加成功`)
          defaultLayerAdded = true
          // 更新mapLayers中的街道地图引用
          mapLayers['街道地图'] = actualStreetLayer
          break
        } catch (error) {
          console.log(`街道地图备选方案 ${i + 1} 添加失败:`, error)
        }
      }
    } else {
      // 添加卫星地图
      try {
        mapLayers[currentMapType.value].addTo(mapInstance)
        console.log(`添加${currentMapType.value}图层成功`)
        defaultLayerAdded = true
      } catch (error) {
        console.log(`${currentMapType.value}图层添加失败:`, error)
      }
    }

    if (!defaultLayerAdded) {
      console.error('默认地图图层添加失败，显示备用地图')
      showFallbackMap()
      return
    }

    // 添加图层控制
    window.L.control.layers(mapLayers).addTo(mapInstance)
    console.log('图层控制添加成功')

    console.log('Leaflet地图初始化成功')

    // 水库数据
    const reservoirs = [
      { name: "青狮潭水库", lng: 110.12, lat: 25.77, status: "normal" },
      { name: "斧子口水库", lng: 110.25, lat: 25.82, status: "warning" },
      { name: "小溶江水库", lng: 110.32, lat: 25.85, status: "normal" },
      { name: "川江水库", lng: 110.38, lat: 25.88, status: "normal" }
    ]

    // 添加标记点
    reservoirs.forEach(reservoir => {
      try {
        // 创建自定义图标
        const icon = window.L.divIcon({
          html: `<div style="width: 12px; height: 12px; background: ${reservoir.status === 'normal' ? '#52c41a' : '#faad14'}; border-radius: 50%; border: 1px solid white;"></div>`,
          className: 'custom-marker',
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        })

        // 创建标记点
        const marker = window.L.marker([reservoir.lat, reservoir.lng], {
          title: reservoir.name,
          icon: icon
        }).addTo(mapInstance)

        // 添加弹出窗口（替代标签）
        marker.bindPopup(`<div style="font-size: 12px; color: #333;">${reservoir.name}</div>`)
        
        console.log(`添加${reservoir.name}标记点成功`)
      } catch (error) {
        console.error(`添加${reservoir.name}标记点失败:`, error)
      }
    })

    // 添加地图控件
    mapInstance.addControl(window.L.control.scale())
    console.log('地图控件添加成功')

    // 地图加载完成事件
    mapInstance.whenReady(function() {
      console.log('地图加载完成')
    })

  } catch (error) {
    console.error('地图初始化失败:', error)
    // 如果地图初始化失败，显示备用地图
    showFallbackMap()
  }
}

// 切换地图类型
function switchMapType(type: string) {
  if (!mapInstance) {
    console.error('地图实例不存在')
    return
  }

  try {
    // 移除当前所有瓦片图层
    mapInstance.eachLayer((layer: any) => {
      if (layer instanceof window.L.TileLayer) {
        mapInstance.removeLayer(layer)
      }
    })

    if (type === '街道地图') {
      // 尝试多个街道地图服务（多种类型）
      let streetLayerAdded = false
      const streetMapAlternatives = [
        // 1. 高德地图瓦片（可能不需要API密钥）
        window.L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
          subdomains: ['1', '2', '3', '4'],
          attribution: '&copy; <a href="https://ditu.amap.com/">高德地图</a>',
          maxZoom: 19
        }),
        // 2. 腾讯地图瓦片
        window.L.tileLayer('https://rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={y}&styleid=1&version=117', {
          subdomains: ['0', '1', '2'],
          attribution: '&copy; <a href="https://map.qq.com/">腾讯地图</a>',
          maxZoom: 18
        }),
        // 3. 百度地图瓦片
        window.L.tileLayer('https://api.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&customid=light', {
          attribution: '&copy; <a href="https://map.baidu.com/">百度地图</a>',
          maxZoom: 18
        }),
        // 4. OpenStreetMap标准瓦片
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }),
        // 5. OpenStreetMap备用瓦片
        window.L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 20
        })
      ]

      for (let i = 0; i < streetMapAlternatives.length; i++) {
        try {
          streetMapAlternatives[i].addTo(mapInstance)
          mapLayers['街道地图'] = streetMapAlternatives[i]
          console.log(`街道地图备选方案 ${i + 1} 添加成功`)
          streetLayerAdded = true
          break
        } catch (error) {
          console.log(`街道地图备选方案 ${i + 1} 添加失败:`, error)
        }
      }

      if (!streetLayerAdded) {
        console.error('所有街道地图服务都失败')
        return
      }
    } else {
      // 添加卫星地图
      if (!mapLayers[type]) {
        console.error(`地图图层 ${type} 不存在`)
        return
      }
      mapLayers[type].addTo(mapInstance)
      console.log(`切换到${type}成功`)
    }

    currentMapType.value = type
  } catch (error) {
    console.error(`切换到${type}失败:`, error)
  }
}

// 备用地图函数
function showFallbackMap() {
  const mapContainer = document.getElementById('real-map')
  if (!mapContainer) return
  
  // 显示静态地图图片作为备用
  mapContainer.innerHTML = `
    <div style="width: 100%; height: 100%; background: #1a2b3c; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; border-radius: 8px;">
      <div style="font-size: 16px; margin-bottom: 10px;">地图加载中...</div>
      <div style="font-size: 12px; color: #aaa;">如果地图长时间无法加载，请检查网络连接</div>
      <div style="margin-top: 20px; display: flex; flex-wrap: wrap; justify-content: center; gap: 15px;">
        <div style="text-align: center;">
          <div style="width: 12px; height: 12px; background: #52c41a; border-radius: 50%; margin: 0 auto 5px;"></div>
          <div style="font-size: 12px;">青狮潭水库</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 12px; height: 12px; background: #faad14; border-radius: 50%; margin: 0 auto 5px;"></div>
          <div style="font-size: 12px;">斧子口水库</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 12px; height: 12px; background: #52c41a; border-radius: 50%; margin: 0 auto 5px;"></div>
          <div style="font-size: 12px;">小溶江水库</div>
        </div>
        <div style="text-align: center;">
          <div style="width: 12px; height: 12px; background: #52c41a; border-radius: 50%; margin: 0 auto 5px;"></div>
          <div style="font-size: 12px;">川江水库</div>
        </div>
      </div>
    </div>
  `
  console.log('显示备用地图')
}
</script>

<style scoped lang="scss">
.dashboard-page {
  height: 100%;
  overflow: auto;
}

// 顶部统计卡片
.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  background: rgba(22, 32, 53, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
    border-color: rgba(0, 217, 255, 0.3);
  }
  
  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.blue {
      background: rgba(0, 217, 255, 0.2);
      color: #00d9ff;
    }
    
    &.cyan {
      background: rgba(0, 255, 157, 0.2);
      color: #00ff9d;
    }
    
    &.orange {
      background: rgba(250, 173, 20, 0.2);
      color: #faad14;
    }
    
    &.purple {
      background: rgba(168, 85, 247, 0.2);
      color: #a855f7;
    }
  }
  
  .stat-info {
    flex: 1;
    
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
    }
    
    .stat-label {
      font-size: 12px;
      color: #a8b5c8;
      margin-top: 4px;
    }
    
    .stat-change {
      font-size: 11px;
      margin-top: 4px;
      
      &.up {
        color: #f5222d;
      }
      
      &.down {
        color: #52c41a;
      }
    }
  }
}

// 主区域布局
.main-row {
  margin-bottom: 16px;
}

// 左侧面板
.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.left-panel {
  .panel-card {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .rainfall-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .rainfall-stats {
    flex-shrink: 0;
  }
  
  .chart {
    flex: 1;
    min-height: 200px;
  }
}

.right-panel {
  .panel-card {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .river-table,
  .trend-chart {
    flex: 1;
  }
  
  .trend-chart {
    min-height: 150px;
  }
  
  .chart {
    width: 100%;
    height: 100%;
  }
}

.panel-card {
  background: rgba(22, 32, 53, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    
    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
      
      &::before {
        content: '';
        width: 3px;
        height: 14px;
        background: linear-gradient(180deg, #00d9ff, #0d7377);
        border-radius: 2px;
      }
    }
  }
}

// 降雨情况
.rainfall-content {
  .rainfall-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      
      .label {
        font-size: 11px;
        color: #a8b5c8;
      }
      
      .value {
        font-size: 16px;
        font-weight: 600;
        color: #00d9ff;
      }
    }
  }
  
  .chart {
    width: 100%;
  }
}

// 表格样式
.river-table {
  :deep(.el-table) {
    background: transparent;
    
    &::before {
      display: none;
    }
    
    .el-table__body-wrapper {
      background: transparent;
    }
    
    tr {
      background: transparent;
    }
    
    th {
      background: transparent !important;
      border: none !important;
      padding: 8px 0;
    }
    
    td {
      border: none !important;
      padding: 6px 0;
    }
  }
}

.status-normal {
  color: #52c41a;
}

.status-warning {
  color: #faad14;
}

.change-up {
  color: #f5222d;
}

.change-down {
  color: #52c41a;
}

// 中间地图
.map-panel {
  height: 100%;
  min-height: 600px;
}

.map-container {
  background: rgba(22, 32, 53, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  
  .map-title {
    text-align: center;
    font-size: 24px;
    font-weight: 700;
    color: #00d9ff;
    margin-bottom: 20px;
    text-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
  }
  
  .map-switcher {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    justify-content: center;
    
    .el-button {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
      }
      
      &.el-button--primary {
        background: #1890ff;
        border-color: #1890ff;
      }
    }
  }
  
  .map-content {
    flex: 1;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    min-height: 500px; /* 确保地图容器有最小高度 */
  }

  #real-map {
    width: 100% !important;
    height: 100% !important;
  }
  
  .map-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
    
    .action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      
      .el-icon {
        font-size: 24px;
        color: #a8b5c8;
      }
      
      span {
        font-size: 12px;
        color: #a8b5c8;
      }
      
      &:hover,
      &.active {
        background: rgba(0, 217, 255, 0.2);
        border-color: #00d9ff;
        
        .el-icon,
        span {
          color: #00d9ff;
        }
      }
    }
  }
}

// 预警面板
.alert-panel {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(22, 32, 53, 0.95);
  border: 1px solid rgba(245, 34, 45, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  min-width: 400px;
  box-shadow: 0 8px 32px rgba(245, 34, 45, 0.2);
  
  .alert-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
    color: #f5222d;
  }
  
  .alert-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    
    .alert-item {
      padding: 8px 12px;
      background: rgba(245, 34, 45, 0.1);
      border-radius: 6px;
      border-left: 3px solid #f5222d;
      
      .alert-title {
        font-size: 13px;
        font-weight: 600;
        color: #f5222d;
        margin-bottom: 4px;
      }
      
      .alert-desc {
        font-size: 12px;
        color: #a8b5c8;
        margin-bottom: 4px;
      }
      
      .alert-time {
        font-size: 11px;
        color: #6b7280;
      }
    }
  }
}

// 趋势图
.trend-chart {
  height: 150px;
  
  .chart {
    width: 100%;
    height: 100%;
  }
}
</style>
