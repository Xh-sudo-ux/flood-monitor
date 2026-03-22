<template>
  <div class="rainfall-page">
    <!-- 顶部统计 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon blue">
            <el-icon size="24"><Pouring /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ maxHourlyRainfall.toFixed(1) }}</div>
            <div class="stat-label">最大小时雨量 (mm)</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon cyan">
            <el-icon size="24"><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ maxDailyRainfall.toFixed(1) }}</div>
            <div class="stat-label">最大日雨量 (mm)</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon green">
            <el-icon size="24"><OfficeBuilding /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ monitorStore.rainfallStations.length }}</div>
            <div class="stat-label">监测站点数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon orange">
            <el-icon size="24"><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ warningStations }}</div>
            <div class="stat-label">预警站点数</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="14">
        <div class="chart-card">
          <div class="card-header">
            <span class="card-title">站点雨量监测</span>
            <el-radio-group v-model="timeRange" size="small">
              <el-radio-button label="hour">小时</el-radio-button>
              <el-radio-button label="day">日</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-body">
            <v-chart class="chart" :option="rainfallChartOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="10">
        <div class="chart-card">
          <div class="card-header">
            <span class="card-title">雨量等级分布</span>
          </div>
          <div class="chart-body">
            <v-chart class="chart" :option="rainfallPieOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 河流流量监测 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="card-header">
            <span class="card-title">河流流量监测</span>
          </div>
          <div class="chart-body">
            <v-chart class="chart" :option="flowChartOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="card-header">
            <span class="card-title">流速与水位关系</span>
          </div>
          <div class="chart-body">
            <v-chart class="chart" :option="velocityChartOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-row class="table-row">
      <el-col :span="24">
        <div class="table-card">
          <div class="card-header">
            <span class="card-title">站点监测数据明细</span>
          </div>
          <el-table
            :data="monitorStore.rainfallStations"
            height="320"
            style="width: 100%"
            :header-cell-style="{ background: 'transparent', color: '#a8b5c8' }"
            :cell-style="{ background: 'transparent', color: '#fff' }"
          >
            <el-table-column prop="id" label="站点编号" width="100" />
            <el-table-column prop="name" label="站点名称" width="120" />
            <el-table-column prop="lat" label="纬度" width="100">
              <template #default="{ row }">
                {{ row.lat.toFixed(4) }}
              </template>
            </el-table-column>
            <el-table-column prop="lng" label="经度" width="100">
              <template #default="{ row }">
                {{ row.lng.toFixed(4) }}
              </template>
            </el-table-column>
            <el-table-column prop="hourlyRainfall" label="小时雨量(mm)" width="120">
              <template #default="{ row }">
                <span :class="getRainfallClass(row.hourlyRainfall)">
                  {{ row.hourlyRainfall.toFixed(1) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="dailyRainfall" label="日雨量(mm)" width="120">
              <template #default="{ row }">
                {{ row.dailyRainfall.toFixed(1) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'normal' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'normal' ? '正常' : '预警' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="更新时间">
              <template #default="{ row }">
                {{ new Date(row.updateTime).toLocaleString() }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart, ScatterChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { Pouring, Calendar, OfficeBuilding, Warning } from '@element-plus/icons-vue'
import { useMonitorStore } from '@/stores/monitor'

use([
  CanvasRenderer,
  BarChart,
  PieChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent
])

const monitorStore = useMonitorStore()
const timeRange = ref('hour')
let refreshTimer: number | null = null

// 组件挂载时加载数据
onMounted(async () => {
  await monitorStore.loadGuilinWeatherData()
  
  // 设置定时刷新，每60分钟执行一次
  refreshTimer = window.setInterval(async () => {
    await monitorStore.loadGuilinWeatherData()
  }, 60 * 60 * 1000)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

// 统计数据
const maxHourlyRainfall = computed(() => {
  if (monitorStore.rainfallStations.length === 0) return 0
  return Math.max(...monitorStore.rainfallStations.map(s => s.hourlyRainfall))
})

const maxDailyRainfall = computed(() => {
  if (monitorStore.rainfallStations.length === 0) return 0
  return Math.max(...monitorStore.rainfallStations.map(s => s.dailyRainfall))
})

const warningStations = computed(() => {
  return monitorStore.rainfallStations.filter(s => s.dailyRainfall > 50).length
})

// 雨量等级分类 - 针对桂林市雨量数据调整
const getRainfallClass = (value: number) => {
  if (value >= 50) return 'danger'      // 暴雨
  if (value >= 25) return 'warning'     // 大雨
  if (value >= 10) return 'normal'      // 中雨
  if (value >= 2.5) return 'light'      // 小雨
  return 'low'                          // 微量或无雨
}

// 雨量柱状图配置
  const rainfallChartOption = computed(() => {
    const stations = monitorStore.rainfallStations
    const isHourly = timeRange.value === 'hour'
    
    // 调试日志
    console.log('雨量站点数据:', stations)
    console.log('当前类型:', isHourly ? '小时' : '日')
    console.log('雨量数据:', stations.map(s => isHourly ? s.hourlyRainfall : s.dailyRainfall))
    
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(22, 32, 53, 0.9)',
        borderColor: '#1e3a5f',
        textStyle: { color: '#fff' },
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const param = params[0]
          const station = stations[param.dataIndex]
          const value = param.value
          return `${station.name}<br/>${isHourly ? '小时' : '日'}雨量: ${value.toFixed(2)}mm`
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      dataZoom: [{
        type: 'inside',
        start: 0,
        end: 50
      }, {
        type: 'slider',
        start: 0,
        end: 50,
        height: 20,
        bottom: 0,
        borderColor: '#1e3a5f',
        fillerColor: 'rgba(13, 115, 119, 0.3)',
        handleStyle: { color: '#00d9ff' },
        textStyle: { color: '#a8b5c8' }
      }],
      xAxis: {
        type: 'category',
        data: stations.map(s => s.name),
        axisLine: { lineStyle: { color: '#1e3a5f' } },
        axisLabel: { color: '#a8b5c8', rotate: 45, fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        name: '雨量(mm)',
        nameTextStyle: { color: '#a8b5c8' },
        axisLine: { lineStyle: { color: '#1e3a5f' } },
        axisLabel: { color: '#a8b5c8' },
        splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } },
        min: 0,
        max: function(value: any) {
          // 动态设置Y轴最大值，确保所有数据都能显示
          const maxValue = Math.max(...stations.map(s => isHourly ? s.hourlyRainfall : s.dailyRainfall))
          return Math.max(maxValue * 1.2, 5) // 至少显示5mm
        }
      },
      series: [{
        name: isHourly ? '小时雨量' : '日雨量',
        type: 'bar',
        data: stations.map(s => isHourly ? s.hourlyRainfall : s.dailyRainfall),
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            return params.value.toFixed(2) + 'mm'
          }
        },
        itemStyle: {
          color: (params: any) => {
            const value = params.value
            if (value >= 50) return '#f5222d'    // 暴雨 - 红色
            if (value >= 25) return '#faad14'    // 大雨 - 橙色
            if (value >= 10) return '#00d9ff'    // 中雨 - 青色
            if (value >= 2.5) return '#a0d911'   // 小雨 - 浅绿色
            return '#52c41a'                     // 微量或无雨 - 绿色
          },
          borderRadius: [4, 4, 0, 0]
        }
      }]
    }
  })

// 雨量饼图配置
const rainfallPieOption = computed(() => {
  const data = [
    { value: monitorStore.rainfallStations.filter(s => s.dailyRainfall >= 50).length, name: '暴雨(≥50mm)' },
    { value: monitorStore.rainfallStations.filter(s => s.dailyRainfall >= 25 && s.dailyRainfall < 50).length, name: '大雨(25-50mm)' },
    { value: monitorStore.rainfallStations.filter(s => s.dailyRainfall >= 10 && s.dailyRainfall < 25).length, name: '中雨(10-25mm)' },
    { value: monitorStore.rainfallStations.filter(s => s.dailyRainfall < 10).length, name: '小雨(<10mm)' }
  ]
  
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(22, 32, 53, 0.9)',
      borderColor: '#1e3a5f',
      textStyle: { color: '#fff' },
      formatter: '{b}: {c}站 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#a8b5c8', fontSize: 11 }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#162035',
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold',
          color: '#fff'
        }
      },
      data: data,
      color: ['#f5222d', '#faad14', '#00d9ff', '#52c41a']
    }]
  }
})

// 河流流量图配置
const flowChartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(22, 32, 53, 0.9)',
    borderColor: '#1e3a5f',
    textStyle: { color: '#fff' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: monitorStore.riverFlows.map(r => r.name),
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8' }
  },
  yAxis: {
    type: 'value',
    name: '出库流量(m³/s)',
    nameTextStyle: { color: '#a8b5c8' },
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8' },
    splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
  },
  series: [{
    name: '出库流量',
    type: 'bar',
    data: monitorStore.riverFlows.map(r => r.flow),
    itemStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: '#00ff9d' },
          { offset: 1, color: '#0d7377' }
        ]
      },
      borderRadius: [4, 4, 0, 0]
    }
  }]
}))

// 流速散点图配置
const velocityChartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(22, 32, 53, 0.9)',
    borderColor: '#1e3a5f',
    textStyle: { color: '#fff' },
    formatter: (params: any) => {
      return `${params.name}<br/>流速: ${params.value[0]}m/s<br/>水位: ${params.value[1]}m`
    }
  },
  grid: {
    left: '10%',
    right: '10%',
    bottom: '10%',
    top: '10%'
  },
  xAxis: {
    type: 'value',
    name: '出库流速(m/s)',
    nameTextStyle: { color: '#a8b5c8' },
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8' },
    splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
  },
  yAxis: {
    type: 'value',
    name: '出库水位(m)',
    nameTextStyle: { color: '#a8b5c8' },
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8' },
    splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
  },
  series: [{
    type: 'scatter',
    symbolSize: (data: number[]) => Math.sqrt(data[2]) * 3,
    data: monitorStore.riverFlows.map(r => [r.velocity, r.waterLevel, r.flow, r.name]),
    itemStyle: {
      color: (params: any) => {
        const flow = params.data[2]
        if (flow > 800) return '#f5222d'
        if (flow > 500) return '#faad14'
        return '#a855f7'
      },
      shadowBlur: 10,
      shadowColor: 'rgba(168, 85, 247, 0.5)'
    }
  }]
}))
</script>

<style scoped lang="scss">
.rainfall-page {
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
      width: 48px;
      height: 48px;
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

      &.green {
        background: rgba(82, 196, 26, 0.2);
        color: #52c41a;
      }

      &.orange {
        background: rgba(250, 173, 20, 0.2);
        color: #faad14;
      }
    }

    .stat-info {
      .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #fff;
      }

      .stat-label {
        font-size: 12px;
        color: #a8b5c8;
        margin-top: 4px;
      }
    }
  }

  .chart-row {
    margin-bottom: 16px;
  }

  .chart-card {
    background: rgba(22, 32, 53, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    height: 400px;
    display: flex;
    flex-direction: column;
    
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 8px;
        
        &::before {
          content: '';
          width: 3px;
          height: 16px;
          background: linear-gradient(180deg, #00d9ff, #0d7377);
          border-radius: 2px;
        }
      }
    }
    
    .chart-body {
      flex: 1;
      
      .chart {
        width: 100%;
        height: 100%;
      }
    }
  }

  .table-row {
    .table-card {
      background: rgba(22, 32, 53, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px;
      
      .card-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        
        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
          
          &::before {
            content: '';
            width: 3px;
            height: 16px;
            background: linear-gradient(180deg, #00d9ff, #0d7377);
            border-radius: 2px;
          }
        }
      }
    }
    
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
        background: rgba(30, 58, 95, 0.3) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      td {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .danger {
        color: #f5222d;
        font-weight: 600;
      }

      .warning {
        color: #faad14;
        font-weight: 600;
      }

      .normal {
        color: #00d9ff;
      }

      .light {
        color: #a0d911;
      }

      .low {
        color: #52c41a;
      }
    }
  }
}
</style>