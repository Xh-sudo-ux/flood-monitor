/**
 * 洪水提取 API 服务层
 * 提供洪水提取相关的API接口
 */

import { FloodMonitorAPI } from './FloodMonitorAPI'

// 洪水提取参数接口
export interface FloodExtractionParams {
  method: 'threshold' | 'randomForest' | 'deepLearning'
  parameters: {
    threshold_value?: number
    band_combination?: string[]
    water_index?: string
    morphology_operations?: {
      opening: boolean
      closing: boolean
      kernel_size: number
    }
    n_estimators?: number
    max_depth?: number
    feature_bands?: string[]
    training_samples?: number
  }
  output_format?: 'geojson' | 'shapefile' | 'tiff'
}

// 影像上传响应接口
export interface ImageUploadResponse {
  image_id: string
  filename: string
  file_size: number
  image_type: string
  dimensions: {
    width: number
    height: number
    bands: number
  }
  upload_time: string
  preview_url: string
  metadata: {
    region: string
    acquisition_date: string
    coordinate_system: string
    resolution: string
  }
}

// 提取任务响应接口
export interface ExtractionTaskResponse {
  task_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  start_time: string
  end_time?: string
  result?: {
    extracted_area_km2: number
    water_pixels: number
    confidence: number
    statistics: {
      total_area_km2: number
      largest_patch_km2: number
      average_confidence: number
      pixel_count: number
      water_ratio: number
    }
  }
  result_url?: string
  visualization_url?: string
  download_url?: string
}

// 提取结果接口
export interface ExtractionResult {
  task_id: string
  format: string
  result: any // GeoJSON 或统计数据
  statistics: {
    total_area_km2: number
    largest_patch_km2: number
    average_confidence: number
    pixel_count: number
    water_ratio: number
  }
}

// 历史记录接口
export interface ExtractionHistory {
  task_id: string
  image_name: string
  region: string
  method: string
  extracted_area_km2: number
  processing_time: number
  status: string
  create_time: string
  result_url: string
}

/**
 * 洪水提取API服务类
 */
export class FloodExtractionAPI {
  private api: FloodMonitorAPI

  constructor(baseURL?: string) {
    this.api = new FloodMonitorAPI(baseURL)
  }

  /**
   * 上传遥感影像
   */
  async uploadImage(
    file: File,
    options?: {
      image_type?: string
      region?: string
      acquisition_date?: string
    }
  ): Promise<ImageUploadResponse> {
    const formData = new FormData()
    formData.append('image', file)
    
    if (options?.image_type) {
      formData.append('image_type', options.image_type)
    }
    if (options?.region) {
      formData.append('region', options.region)
    }
    if (options?.acquisition_date) {
      formData.append('acquisition_date', options.acquisition_date)
    }

    return this.api.request<ImageUploadResponse>('/flood-extraction/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // FormData会自动设置Content-Type
      }
    })
  }

  /**
   * 执行洪水提取
   */
  async processExtraction(
    imageId: string,
    params: FloodExtractionParams
  ): Promise<{
    task_id: string
    status: string
    estimated_time: number
    progress_url: string
  }> {
    return this.api.request('/flood-extraction/process', {
      method: 'POST',
      body: {
        image_id: imageId,
        ...params
      }
    })
  }

  /**
   * 查询提取任务状态
   */
  async getTaskStatus(taskId: string): Promise<ExtractionTaskResponse> {
    return this.api.request<ExtractionTaskResponse>(`/flood-extraction/tasks/${taskId}/status`)
  }

  /**
   * 获取提取结果
   */
  async getExtractionResult(
    taskId: string,
    format: 'geojson' | 'statistics' = 'geojson'
  ): Promise<ExtractionResult> {
    return this.api.request<ExtractionResult>(`/flood-extraction/results/${taskId}`, {
      params: { format }
    })
  }

  /**
   * 查询历史记录
   */
  async getExtractionHistory(params?: {
    start_date?: string
    end_date?: string
    region?: string
    method?: string
    limit?: number
    offset?: number
  }): Promise<{
    total_count: number
    history: ExtractionHistory[]
  }> {
    return this.api.request('/flood-extraction/history', {
      params
    })
  }

  /**
   * 轮询任务状态直到完成
   */
  async pollTaskStatus(
    taskId: string,
    interval: number = 2000,
    timeout: number = 300000 // 5分钟超时
  ): Promise<ExtractionTaskResponse> {
    const startTime = Date.now()
    
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const status = await this.getTaskStatus(taskId)
          
          if (status.status === 'completed') {
            resolve(status)
          } else if (status.status === 'failed') {
            reject(new Error('提取任务失败'))
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('任务超时'))
          } else {
            // 继续轮询
            setTimeout(checkStatus, interval)
          }
        } catch (error) {
          reject(error)
        }
      }
      
      checkStatus()
    })
  }

  /**
   * 取消提取任务（模拟）
   */
  async cancelTask(taskId: string): Promise<void> {
    // 注意：Mock API不支持取消，这里只是模拟
    console.log(`模拟取消任务: ${taskId}`)
    return Promise.resolve()
  }

  /**
   * 下载提取结果
   */
  async downloadResult(taskId: string, format: string = 'geojson'): Promise<Blob> {
    const response = await fetch(`${this.api['baseURL']}/flood-extraction/results/${taskId}/download?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${this.api['token']}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`)
    }
    
    return response.blob()
  }
}