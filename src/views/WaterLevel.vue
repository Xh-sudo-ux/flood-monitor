<template>
  <div class="waterlevel-page">
    <!-- 顶部统计 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon blue">
            <el-icon size="24"><Watermelon /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ totalReservoirs }}</div>
            <div class="stat-label">监测水库数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon red">
            <el-icon size="24"><Warning /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ overWarningCount }}</div>
            <div class="stat-label">预警水库数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon cyan">
            <el-icon size="24"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ dangerCount }}</div>
            <div class="stat-label">危险水库数</div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card">
          <div class="stat-icon green">
            <el-icon size="24"><OfficeBuilding /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ avgWaterLevel.toFixed(2) }}</div>
            <div class="stat-label">平均水位 (m)</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="card-header">
            <span class="card-title">水库水位监测</span>
          </div>
          <div class="chart-body">
            <v-chart class="chart" :option="waterLevelChartOption" autoresize />
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :lg="12">
        <div class="chart-card">
          <div class="card-header">
            <span class="card-title">超汛限分布</span>
          </div>
          <div class="chart-body">
            <v-chart class="chart" :option="exceedLimitOption" autoresize />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-row class="table-row">
      <el-col :span="24">
        <div class="table-card">
          <div class="card-header">
            <span class="card-title">水库水位监测数据明细</span>
          </div>
          <el-table
            :data="monitorStore.waterLevelStations"
            height="320"
            style="width: 100%"
            :header-cell-style="{ background: 'transparent', color: '#a8b5c8' }"
            :cell-style="{ background: 'transparent', color: '#fff' }"
          >
            <el-table-column prop="id" label="编号" width="80" />
            <el-table-column prop="name" label="水库名称" width="150" />
            <el-table-column prop="currentLevel" label="当前水位(m)" width="120">
              <template #default="{ row }">
                <span :class="getWaterLevelClass(row.currentLevel, row.warningLevel)">
                  {{ row.currentLevel.toFixed(2) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="warningLevel" label="汛限水位(m)" width="120" />
            <el-table-column prop="dangerLevel" label="危险水位(m)" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { Watermelon, Warning, TrendCharts, OfficeBuilding } from '@element-plus/icons-vue'
import { useMonitorStore } from '@/stores/monitor'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

const monitorStore = useMonitorStore()

// 组件挂载时加载数据
onMounted(async () => {
  await monitorStore.loadGuilinWeatherData()
})

// 统计数据
const avgWaterLevel = computed(() => {
  if (monitorStore.waterLevelStations.length === 0) return 0
  return monitorStore.waterLevelStations.reduce((sum, s) => sum + s.currentLevel, 0) / monitorStore.waterLevelStations.length
})

const overWarningCount = computed(() => {
  return monitorStore.waterLevelStations.filter(s => s.status === 'warning').length
})

const dangerCount = computed(() => {
  return monitorStore.waterLevelStations.filter(s => s.status === 'danger').length
})

const totalReservoirs = computed(() => {
  return monitorStore.waterLevelStations.length
})

// 获取水位等级样式
const getWaterLevelClass = (current: number, warning: number) => {
  if (current >= warning + 1.0) return 'danger'
  if (current >= warning) return 'warning'
  return 'normal'
}

// 获取水库状态样式
const getReservoirStatusClass = (status: string) => {
  if (status === 'danger') return 'danger'
  if (status === 'warning') return 'warning'
  return 'normal'
}

// 获取状态类型
const getStatusType = (status: string) => {
  if (status === 'danger') return 'danger'
  if (status === 'warning') return 'warning'
  return 'success'
}

// 获取状态文本
const getStatusText = (status: string) => {
  if (status === 'danger') return '危险'
  if (status === 'warning') return '预警'
  return '正常'
}

// 水位柱状图配置
const waterLevelChartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(22, 32, 53, 0.9)',
    borderColor: '#1e3a5f',
    textStyle: { color: '#fff' },
    axisPointer: { type: 'shadow' },
    formatter: (params: any[]) => {
      const data = params[0]
      const station = monitorStore.waterLevelStations[data.dataIndex]
      return `${data.name}<br/>当前水位: ${data.value}m<br/>汛限水位: ${station.warningLevel}m`
    }
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
    data: monitorStore.waterLevelStations.map(s => s.name),
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8', rotate: 30 }
  },
  yAxis: {
    type: 'value',
    name: '水位(m)',
    nameTextStyle: { color: '#a8b5c8' },
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisLabel: { color: '#a8b5c8' },
    splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
  },
  series: [{
    name: '当前水位',
    type: 'bar',
    data: monitorStore.waterLevelStations.map(s => s.currentLevel),
    itemStyle: {
      color: (params: any) => {
        const station = monitorStore.waterLevelStations[params.dataIndex]
        if (station.status === 'danger') return '#f5222d'
        if (station.status === 'warning') return '#faad14'
        return '#00d9ff'
      },
      borderRadius: [4, 4, 0, 0]
    },
    markLine: {
      silent: true,
      lineStyle: { color: '#faad14', type: 'dashed' },
      data: monitorStore.waterLevelStations.map((s, index) => ({
        xAxis: index,
        yAxis: s.warningLevel,
        label: { formatter: '汛限', color: '#faad14' }
      }))
    }
  }]
}))

// 超汛限分布饼图配置
const exceedLimitOption = computed(() => {
  const dangerCount = monitorStore.waterLevelStations.filter(s => s.status === 'danger').length
  const warningCount = monitorStore.waterLevelStations.filter(s => s.status === 'warning').length
  const normalCount = monitorStore.waterLevelStations.filter(s => s.status === 'normal').length
  
  const data = [
    { value: dangerCount, name: '危险' },
    { value: warningCount, name: '预警' },
    { value: normalCount, name: '正常' }
  ]
  
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(22, 32, 53, 0.9)',
      borderColor: '#1e3a5f',
      textStyle: { color: '#fff' },
      formatter: '{b}: {c}座 ({d}%)'
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
      color: ['#f5222d', '#faad14', '#00d9ff']
    }]
  }
})
</script>

<style scoped lang="scss">
.waterlevel-page {
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

      &.red {
        background: rgba(245, 34, 45, 0.2);
        color: #f5222d;
      }

      &.cyan {
        background: rgba(0, 255, 157, 0.2);
        color: #00ff9d;
      }

      &.green {
        background: rgba(82, 196, 26, 0.2);
        color: #52c41a;
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
    }
  }
}
</style>