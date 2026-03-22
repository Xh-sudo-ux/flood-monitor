<template>
  <div class="flood-extraction-page">
    <el-row :gutter="16">
      <el-col :xs="24" :lg="8">
        <div class="control-panel">
          <div class="panel-header">
            <span class="panel-title">洪水提取参数</span>
          </div>
          <el-form :model="extractionParams" label-position="top">
            <el-form-item label="阈值方法">
              <el-select v-model="extractionParams.method" style="width: 100%">
                <el-option label="阈值法提取" value="threshold" />
                <el-option label="随机森林提取" value="randomForest" />
                <el-option label="模型训练" value="model" />
              </el-select>
            </el-form-item>
            <el-form-item label="阈值设置">
              <el-slider v-model="extractionParams.threshold" :max="100" show-input />
            </el-form-item>
            <el-form-item label="影像选择">
              <el-upload
                drag
                action="#"
                :auto-upload="false"
                :on-change="(file) => handleFileUpload(file.raw)"
                :show-file-list="false"
                class="upload-area"
                accept=".tif,.tiff,.geotiff,.jpg,.jpeg,.png"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  拖拽遥感影像文件到此处或 <em>点击上传</em>
                </div>
                <div class="el-upload__tip">
                  支持格式: TIFF, GeoTIFF, JPEG, PNG (建议使用TIFF格式)
                </div>
              </el-upload>
              
              <!-- 上传进度 -->
              <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
                <el-progress :percentage="uploadProgress" :show-text="false" />
                <span class="progress-text">上传中... {{ uploadProgress }}%</span>
              </div>
              
              <!-- 上传成功信息 -->
              <div v-if="uploadedImage" class="upload-success">
                <el-alert
                  title="影像上传成功"
                  type="success"
                  :closable="false"
                  show-icon
                >
                  <template #default>
                    <div class="image-info">
                      <p>文件名: {{ uploadedImage.filename }}</p>
                      <p>尺寸: {{ uploadedImage.dimensions.width }}×{{ uploadedImage.dimensions.height }}</p>
                      <p>大小: {{ (uploadedImage.file_size / 1024 / 1024).toFixed(2) }} MB</p>
                    </div>
                  </template>
                </el-alert>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="startExtraction" :loading="extracting">
                开始提取
              </el-button>
              <el-button @click="resetParams">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
      <el-col :xs="24" :lg="16">
        <div class="result-panel">
          <div class="panel-header">
            <span class="panel-title">提取结果</span>
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button label="original">原始影像</el-radio-button>
              <el-radio-button label="result">提取结果</el-radio-button>
              <el-radio-button label="compare">对比视图</el-radio-button>
            </el-radio-group>
          </div>
          <div class="result-content">
            <!-- 任务状态 -->
            <div v-if="taskStatus" class="task-status">
              <el-alert
                :title="`任务状态: ${taskStatus.status === 'processing' ? '处理中' : taskStatus.status === 'completed' ? '已完成' : '失败'}`"
                :type="taskStatus.status === 'completed' ? 'success' : taskStatus.status === 'processing' ? 'info' : 'error'"
                :closable="false"
                show-icon
              >
                <template #default>
                  <div class="status-details">
                    <p>任务ID: {{ taskStatus.task_id }}</p>
                    <p>进度: {{ taskStatus.progress }}%</p>
                    <p v-if="taskStatus.start_time">开始时间: {{ new Date(taskStatus.start_time).toLocaleString() }}</p>
                    <p v-if="taskStatus.end_time">结束时间: {{ new Date(taskStatus.end_time).toLocaleString() }}</p>
                    
                    <!-- 处理中显示进度条 -->
                    <div v-if="taskStatus.status === 'processing'" class="processing-progress">
                      <el-progress :percentage="taskStatus.progress" :stroke-width="8" />
                    </div>
                    
                    <!-- 完成显示结果 -->
                    <div v-if="taskStatus.status === 'completed' && taskStatus.result" class="result-summary">
                      <h4>提取结果摘要:</h4>
                      <p>提取面积: {{ taskStatus.result.extracted_area_km2.toFixed(2) }} km²</p>
                      <p>置信度: {{ (taskStatus.result.confidence * 100).toFixed(1) }}%</p>
                      <p>水体像素: {{ taskStatus.result.water_pixels.toLocaleString() }}</p>
                    </div>
                  </div>
                </template>
              </el-alert>
            </div>
            
            <!-- 详细结果 -->
            <div v-if="extractionResult" class="detailed-result">
              <div class="result-header">
                <h3>洪水提取详细结果</h3>
                <el-button type="primary" :icon="Download" @click="downloadResult" size="small">
                  下载结果
                </el-button>
              </div>
              
              <div class="result-statistics">
                <h4>统计信息</h4>
                <el-row :gutter="16">
                  <el-col :span="12">
                    <div class="stat-item">
                      <div class="stat-label">总面积</div>
                      <div class="stat-value">{{ extractionResult.statistics.total_area_km2.toFixed(2) }} km²</div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="stat-item">
                      <div class="stat-label">最大斑块</div>
                      <div class="stat-value">{{ extractionResult.statistics.largest_patch_km2.toFixed(2) }} km²</div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="stat-item">
                      <div class="stat-label">平均置信度</div>
                      <div class="stat-value">{{ (extractionResult.statistics.average_confidence * 100).toFixed(1) }}%</div>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="stat-item">
                      <div class="stat-label">水体比例</div>
                      <div class="stat-value">{{ (extractionResult.statistics.water_ratio * 100).toFixed(1) }}%</div>
                    </div>
                  </el-col>
                </el-row>
              </div>
              
              <!-- 结果预览 -->
              <div class="result-preview">
                <div class="preview-header">
                  <h4>结果预览</h4>
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="toggleVisualization"
                    :icon="showVisualization ? 'Hide' : 'View'"
                  >
                    {{ showVisualization ? '隐藏可视化' : '显示可视化' }}
                  </el-button>
                </div>
                
                <div v-if="showVisualization" class="visualization-container">
                  <!-- 地图可视化 -->
                  <div class="map-visualization">
                    <h5>洪水区域分布图</h5>
                    <v-chart
                      ref="mapChartRef"
                      class="chart"
                      :option="mapChartOption"
                      autoresize
                      style="height: 300px;"
                    />
                  </div>
                  
                  <!-- 统计图表 -->
                  <div class="stats-visualization">
                    <h5>提取结果统计</h5>
                    <v-chart
                      ref="barChartRef"
                      class="chart"
                      :option="barChartOption"
                      autoresize
                      style="height: 250px;"
                    />
                  </div>
                </div>
                
                <div v-else class="preview-placeholder">
                  <el-icon size="48" color="#1e3a5f"><Picture /></el-icon>
                  <p>洪水提取结果可视化预览</p>
                  <p class="preview-tip">点击"显示可视化"按钮查看洪水区域分布和统计图表</p>
                </div>
              </div>
            </div>
            
            <!-- 历史记录 -->
            <div v-if="extractionHistory.length > 0" class="history-section">
              <h4>最近提取记录</h4>
              <el-table :data="extractionHistory" size="small" class="history-table">
                <el-table-column prop="task_id" label="任务ID" width="120">
                  <template #default="{ row }">
                    <span class="task-id">{{ row.task_id.slice(0, 8) }}...</span>
                  </template>
                </el-table-column>
                <el-table-column prop="image_name" label="影像名称" width="150" show-overflow-tooltip />
                <el-table-column prop="region" label="区域" width="100" />
                <el-table-column prop="method" label="方法" width="100">
                  <template #default="{ row }">
                    <el-tag size="small" :type="row.method === 'threshold' ? 'primary' : row.method === 'randomForest' ? 'success' : 'warning'">
                      {{ row.method === 'threshold' ? '阈值法' : row.method === 'randomForest' ? '随机森林' : '深度学习' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="extracted_area_km2" label="提取面积" width="100">
                  <template #default="{ row }">
                    {{ row.extracted_area_km2.toFixed(2) }} km²
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="{ row }">
                    <el-tag size="small" :type="row.status === 'completed' ? 'success' : row.status === 'processing' ? 'info' : 'error'">
                      {{ row.status === 'completed' ? '完成' : row.status === 'processing' ? '处理中' : '失败' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80" fixed="right">
                  <template #default="{ row }">
                    <el-button type="primary" link size="small" @click="viewHistoryDetail(row.task_id)">
                      查看
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            
            <!-- 初始占位符 -->
            <div v-if="!taskStatus && !extractionResult && extractionHistory.length === 0" class="mock-result">
              <div class="result-placeholder">
                <el-icon size="64" color="#1e3a5f"><Picture /></el-icon>
                <p>请上传影像并点击"开始提取"查看结果</p>
                <p class="placeholder-tip">支持阈值法、随机森林和深度学习等多种提取方法</p>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { UploadFilled, Picture, Loading, Check, Close, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FloodExtractionAPI, type FloodExtractionParams } from '@/services/FloodExtractionAPI'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { MapChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

// 注册ECharts组件
use([
  CanvasRenderer,
  MapChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  GridComponent
])

const extracting = ref(false)
const viewMode = ref('original')
const uploadProgress = ref(0)
const currentTaskId = ref<string | null>(null)
const taskStatus = ref<any>(null)
const extractionResult = ref<any>(null)
const extractionHistory = ref<any[]>([])
const uploadedImage = ref<any>(null)

const extractionAPI = new FloodExtractionAPI()

const extractionParams = reactive<FloodExtractionParams>({
  method: 'threshold',
  parameters: {
    threshold_value: 0.5,
    band_combination: ['B8', 'B11', 'B12'],
    water_index: 'NDWI',
    morphology_operations: {
      opening: true,
      closing: true,
      kernel_size: 3
    }
  },
  output_format: 'geojson'
})

// 可视化相关
const showVisualization = ref(false)
const mapChartRef = ref()
const barChartRef = ref()

// 地图图表配置
const mapChartOption = computed(() => {
  if (!extractionResult.value || !extractionResult.value.result) {
    return {
      title: {
        text: '洪水提取结果可视化',
        left: 'center',
        textStyle: {
          color: '#333',
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} km²'
      },
      visualMap: {
        min: 0,
        max: 20,
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        calculable: true,
        inRange: {
          color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695']
        }
      },
      series: [
        {
          name: '洪水区域',
          type: 'map',
          map: '广西',
          roam: true,
          zoom: 1.2,
          center: [108.3, 23.8],
          label: {
            show: true
          },
          itemStyle: {
            areaColor: '#f8f9fa',
            borderColor: '#ddd'
          },
          emphasis: {
            itemStyle: {
              areaColor: '#e6f7ff'
            }
          },
          data: [
            { name: '南宁市', value: 12.5 },
            { name: '柳州市', value: 8.3 },
            { name: '桂林市', value: 5.7 }
          ]
        }
      ]
    }
  }

  // 如果有实际数据，使用实际数据
  const features = extractionResult.value.result.features || []
  const data = features.map((feature: any) => ({
    name: feature.properties?.region || '未知区域',
    value: feature.properties?.area_km2 || 0,
    coordinates: feature.geometry?.coordinates || []
  }))

  return {
    title: {
      text: '洪水提取结果可视化',
      left: 'center',
      textStyle: {
        color: '#333',
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        return `${params.name}<br/>面积: ${params.value} km²<br/>置信度: ${(params.data.confidence * 100).toFixed(1)}%`
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(...data.map((d: any) => d.value), 1),
      left: 'left',
      top: 'bottom',
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695']
      }
    },
    series: [
      {
        name: '洪水区域',
        type: 'map',
        map: '广西',
        roam: true,
        zoom: 1.2,
        center: [108.3, 23.8],
        label: {
          show: true
        },
        itemStyle: {
          areaColor: '#f8f9fa',
          borderColor: '#ddd'
        },
        emphasis: {
          itemStyle: {
            areaColor: '#e6f7ff'
          }
        },
        data: data
      }
    ]
  }
})

// 统计图表配置
const barChartOption = computed(() => {
  if (!extractionResult.value) {
    return {
      title: {
        text: '提取结果统计',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: ['总面积', '最大斑块', '平均置信度', '水体比例']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '统计值',
          type: 'bar',
          data: [0, 0, 0, 0],
          itemStyle: {
            color: '#1e3a5f'
          }
        }
      ]
    }
  }

  const stats = extractionResult.value.statistics
  
  return {
    title: {
      text: '提取结果统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        const param = params[0]
        let value = param.value
        let unit = ''
        
        switch(param.name) {
          case '总面积':
          case '最大斑块':
            unit = ' km²'
            value = value.toFixed(2)
            break
          case '平均置信度':
            unit = '%'
            value = (value * 100).toFixed(1)
            break
          case '水体比例':
            unit = '%'
            value = (value * 100).toFixed(1)
            break
        }
        
        return `${param.name}: ${value}${unit}`
      }
    },
    xAxis: {
      type: 'category',
      data: ['总面积', '最大斑块', '平均置信度', '水体比例']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '统计值',
        type: 'bar',
        data: [
          stats.total_area_km2,
          stats.largest_patch_km2,
          stats.average_confidence,
          stats.water_ratio
        ],
        itemStyle: {
          color: function(params: any) {
            const colors = ['#1e3a5f', '#2c5282', '#4299e1', '#63b3ed']
            return colors[params.dataIndex] || '#1e3a5f'
          }
        }
      }
    ]
  }
})

// 加载历史记录
const loadHistory = async () => {
  try {
    const response = await extractionAPI.getExtractionHistory({
      limit: 10,
      offset: 0
    })
    extractionHistory.value = response.history
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
}

// 文件上传处理
const handleFileUpload = async (file: File) => {
  try {
    uploadProgress.value = 0
    ElMessage.info('开始上传影像...')
    
    const response = await extractionAPI.uploadImage(file, {
      image_type: 'sentinel2',
      region: '南宁市',
      acquisition_date: new Date().toISOString().split('T')[0]
    })
    
    uploadedImage.value = response
    ElMessage.success('影像上传成功')
    
    // 更新参数中的影像ID
    extractionParams.parameters = {
      ...extractionParams.parameters,
      // 可以在这里根据影像信息调整参数
    }
    
  } catch (error: any) {
    ElMessage.error(`上传失败: ${error.message}`)
    console.error('上传失败:', error)
  } finally {
    uploadProgress.value = 100
  }
}

// 开始提取
const startExtraction = async () => {
  if (!uploadedImage.value) {
    ElMessage.warning('请先上传影像文件')
    return
  }
  
  try {
    extracting.value = true
    currentTaskId.value = null
    taskStatus.value = null
    extractionResult.value = null
    
    ElMessage.info('开始洪水提取处理...')
    
    // 执行提取
    const response = await extractionAPI.processExtraction(
      uploadedImage.value.image_id,
      extractionParams
    )
    
    currentTaskId.value = response.task_id
    ElMessage.success('提取任务已开始，正在处理中...')
    
    // 开始轮询任务状态
    pollTaskStatus()
    
  } catch (error: any) {
    extracting.value = false
    ElMessage.error(`提取失败: ${error.message}`)
    console.error('提取失败:', error)
  }
}

// 轮询任务状态
const pollTaskStatus = async () => {
  if (!currentTaskId.value) return
  
  try {
    const status = await extractionAPI.pollTaskStatus(currentTaskId.value, 2000, 180000) // 3分钟超时
    
    taskStatus.value = status
    extracting.value = false
    
    if (status.status === 'completed') {
      ElMessage.success('洪水提取完成！')
      
      // 获取详细结果
      const result = await extractionAPI.getExtractionResult(currentTaskId.value)
      extractionResult.value = result
      
      // 重新加载历史记录
      loadHistory()
    }
    
  } catch (error: any) {
    extracting.value = false
    ElMessage.error(`任务处理失败: ${error.message}`)
    console.error('任务处理失败:', error)
  }
}

// 重置参数
const resetParams = () => {
  extractionParams.method = 'threshold'
  extractionParams.parameters = {
    threshold_value: 0.5,
    band_combination: ['B8', 'B11', 'B12'],
    water_index: 'NDWI',
    morphology_operations: {
      opening: true,
      closing: true,
      kernel_size: 3
    }
  }
  extractionParams.output_format = 'geojson'
  uploadedImage.value = null
  currentTaskId.value = null
  taskStatus.value = null
  extractionResult.value = null
  uploadProgress.value = 0
}

// 下载结果
const downloadResult = async () => {
  if (!currentTaskId.value) return
  
  try {
    ElMessage.info('开始下载结果...')
    const blob = await extractionAPI.downloadResult(currentTaskId.value)
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flood_extraction_${currentTaskId.value}.geojson`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('下载完成')
  } catch (error: any) {
    ElMessage.error(`下载失败: ${error.message}`)
  }
}

// 查看历史记录详情
const viewHistoryDetail = async (taskId: string) => {
  try {
    const result = await extractionAPI.getExtractionResult(taskId, 'statistics')
    
    ElMessageBox.alert(
      `提取结果统计：
      总面积: ${result.statistics.total_area_km2.toFixed(2)} km²
      最大斑块: ${result.statistics.largest_patch_km2.toFixed(2)} km²
      平均置信度: ${(result.statistics.average_confidence * 100).toFixed(1)}%
      水体比例: ${(result.statistics.water_ratio * 100).toFixed(1)}%`,
      `任务 ${taskId} 的提取结果`
    )
  } catch (error) {
    ElMessage.error('获取历史记录详情失败')
  }
}

// 切换可视化显示
const toggleVisualization = () => {
  showVisualization.value = !showVisualization.value
}

// 重置图表大小
const resizeCharts = () => {
  if (mapChartRef.value) {
    mapChartRef.value.resize()
  }
  if (barChartRef.value) {
    barChartRef.value.resize()
  }
}

// 监听窗口大小变化
onMounted(() => {
  window.addEventListener('resize', resizeCharts)
})

// 组件卸载时移除监听器
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts)
})

// 组件挂载时加载历史记录
onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="scss">
.flood-extraction-page {
  .control-panel,
  .result-panel {
    background: rgba(22, 32, 53, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    height: calc(100vh - 140px);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .panel-title {
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

  :deep(.el-form-item__label) {
    color: #a8b5c8;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner) {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;

    &:hover,
    &:focus {
      border-color: #00d9ff;
    }
  }

  :deep(.el-input__inner) {
    color: #fff;

    &::placeholder {
      color: #6b7280;
    }
  }

  .upload-area {
    :deep(.el-upload-dragger) {
      background: rgba(255, 255, 255, 0.05);
      border: 2px dashed rgba(255, 255, 255, 0.2);

      &:hover {
        border-color: #00d9ff;
      }
    }

    :deep(.el-upload__text) {
      color: #a8b5c8;

      em {
        color: #00d9ff;
      }
    }
  }

  .result-content {
    height: calc(100% - 60px);

    .mock-result {
      width: 100%;
      height: 100%;
      background: rgba(30, 58, 95, 0.3);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      .result-placeholder {
        text-align: center;

        p {
          margin-top: 16px;
          color: #a8b5c8;
        }
        .placeholder-tip {
          font-size: 12px;
          color: #999;
          margin-top: 8px;
        }
      }
    }
    
    .upload-progress {
      margin-top: 16px;
      
      .progress-text {
        display: block;
        text-align: center;
        font-size: 12px;
        color: #666;
        margin-top: 4px;
      }
    }
    
    .upload-success {
      margin-top: 16px;
      
      .image-info {
        font-size: 12px;
        line-height: 1.5;
        
        p {
          margin: 4px 0;
        }
      }
    }
    
    .task-status {
      margin-bottom: 16px;
      
      .status-details {
        font-size: 13px;
        line-height: 1.6;
        
        p {
          margin: 4px 0;
        }
      }
      
      .processing-progress {
        margin: 12px 0;
      }
      
      .result-summary {
        margin-top: 12px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 4px;
        
        h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #333;
        }
        
        p {
          margin: 4px 0;
          font-size: 13px;
        }
      }
    }
    
    .detailed-result {
      .result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        
        h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }
      }
      
      .result-statistics {
        margin-bottom: 24px;
        
        h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #333;
        }
        
        .stat-item {
          margin-bottom: 12px;
          
          .stat-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          }
          
          .stat-value {
            font-size: 16px;
            font-weight: 600;
            color: #1e3a5f;
          }
        }
      }
      
      .result-preview {
      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        
        h4 {
          margin: 0;
          font-size: 14px;
          color: #333;
        }
      }
      
      .visualization-container {
        .map-visualization,
        .stats-visualization {
          margin-bottom: 24px;
          
          h5 {
            margin: 0 0 12px 0;
            font-size: 13px;
            color: #555;
            font-weight: 600;
          }
          
          .chart {
            border-radius: 4px;
            border: 1px solid #e8e8e8;
            background: white;
          }
        }
      }
      
      .preview-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        background: #f8f9fa;
        border-radius: 4px;
        border: 1px dashed #dcdfe6;
        
        p {
          margin: 8px 0 0 0;
          font-size: 14px;
          color: #666;
        }
        
        .preview-tip {
          font-size: 12px;
          color: #999;
        }
      }
    }
    }
    
    .history-section {
      margin-top: 24px;
      
      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        color: #333;
      }
      
      .history-table {
        margin-top: 8px;
        
        .task-id {
          font-family: monospace;
          font-size: 12px;
          color: #666;
        }
      }
    }
  }
}
</style>
