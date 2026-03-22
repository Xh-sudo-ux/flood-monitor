/**
 * 洪水监测系统 API 服务层
 * 提供与后端API的通信接口
 */

// API配置
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  WS_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3000/ws',
  TIMEOUT: 30000, // 30秒超时
  RETRY_COUNT: 3, // 重试次数
}

// 错误类型定义
export class APIError extends Error {
  constructor(
    public code: number,
    public message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// 请求配置接口
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  params?: Record<string, any>
  timeout?: number
  retry?: number
}

/**
 * 洪水监测系统API服务类
 */
export class FloodMonitorAPI {
  private token: string | null = null
  private wsConnection: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000 // 1秒

  constructor(private baseURL: string = API_CONFIG.BASE_URL) {
    this.loadToken()
  }

  // ==================== 工具方法 ====================

  /**
   * 从本地存储加载token
   */
  private loadToken(): void {
    this.token = localStorage.getItem('flood_monitor_token')
  }

  /**
   * 保存token到本地存储
   */
  setToken(token: string): void {
    this.token = token
    localStorage.setItem('flood_monitor_token', token)
  }

  /**
   * 清除token
   */
  clearToken(): void {
    this.token = null
    localStorage.removeItem('flood_monitor_token')
  }

  /**
   * 获取认证头
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    
    return headers
  }

  /**
   * 发送HTTP请求
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout = API_CONFIG.TIMEOUT,
      retry = API_CONFIG.RETRY_COUNT,
    } = config

    // 构建URL
    let url = `${this.baseURL}${endpoint}`
    if (params) {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
      url += `?${queryParams.toString()}`
    }

    // 合并headers
    const requestHeaders = {
      ...this.getAuthHeaders(),
      ...headers,
    }

    // 请求配置
    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include',
    }

    if (body) {
      requestConfig.body = JSON.stringify(body)
    }

    // 超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    requestConfig.signal = controller.signal

    try {
      const response = await fetch(url, requestConfig)
      clearTimeout(timeoutId)

      // 处理响应
      const data = await response.json()

      if (!response.ok) {
        throw new APIError(
          data.code || response.status,
          data.message || `HTTP ${response.status}`,
          data.error || data.details
        )
      }

      return data.data || data
    } catch (error) {
      clearTimeout(timeoutId)

      // 如果是网络错误或超时，尝试重试
      if (
        (error instanceof TypeError || error.name === 'AbortError') &&
        retry > 0
      ) {
        console.warn(`请求失败，正在重试 (剩余 ${retry} 次):`, error)
        await new Promise(resolve => setTimeout(resolve, 1000)) // 等待1秒
        return this.request<T>(endpoint, { ...config, retry: retry - 1 })
      }

      // 如果是认证错误，清除token
      if (error instanceof APIError && error.code === 401) {
        this.clearToken()
        // 可以在这里触发重新登录
        window.dispatchEvent(new CustomEvent('auth-required'))
      }

      throw error
    }
  }

  // ==================== 实时内涝区域面积统计接口 ====================

  /**
   * 获取实时内涝区域面积统计数据
   */
  async getInundationAreas(params?: {
    region?: string
    status?: 'active' | 'warning' | 'subsided'
    limit?: number
    offset?: number
  }): Promise<{
    timestamp: string
    total_count: number
    areas: Array<{
      id: string
      name: string
      area_km2: number
      depth_m: number
      affected_population: number
      coordinates: any
      status: string
      severity: string
      detected_time: string
      updated_time: string
      data_source: string
      confidence: number
    }>
    summary: {
      total_area: number
      total_population: number
      average_depth: number
      active_count: number
      warning_count: number
      subsided_count: number
    }
  }> {
    return this.request('/inundation/areas/statistics', { params })
  }

  /**
   * 获取内涝区域历史数据
   */
  async getInundationAreaHistory(params: {
    area_id: string
    start_time: string
    end_time: string
    interval?: '1h' | '6h' | '12h' | '1d'
  }): Promise<{
    area_id: string
    area_name: string
    history: Array<{
      timestamp: string
      area_km2: number
      depth_m: number
      affected_population: number
    }>
    statistics: {
      max_area: number
      min_area: number
      avg_area: number
      growth_rate: string
    }
  }> {
    return this.request('/inundation/areas/history', { params })
  }

  // ==================== 降雨量数据接口 ====================

  /**
   * 获取实时降雨量数据
   */
  async getRainfallRealtime(params?: {
    region?: string
    station_ids?: string[]
  }): Promise<{
    timestamp: string
    stations: Array<{
      station_id: string
      name: string
      location: {
        latitude: number
        longitude: number
      }
      rainfall_1h: number
      rainfall_3h: number
      rainfall_6h: number
      rainfall_12h: number
      rainfall_24h: number
      rainfall_today: number
      warning_level: string
      update_time: string
    }>
    summary: {
      total_stations: number
      warning_stations: number
      danger_stations: number
      max_rainfall: number
      avg_rainfall: number
    }
  }> {
    return this.request('/rainfall/realtime', { params })
  }

  /**
   * 获取降雨量历史数据
   */
  async getRainfallHistory(params: {
    station_id: string
    start_time: string
    end_time: string
    interval?: '5m' | '15m' | '1h' | '6h'
  }): Promise<any> {
    return this.request('/rainfall/history', { params })
  }

  // ==================== 水库水位数据接口 ====================

  /**
   * 获取实时水库水位数据
   */
  async getReservoirRealtime(params?: {
    reservoir_ids?: string[]
  }): Promise<{
    timestamp: string
    reservoirs: Array<{
      reservoir_id: string
      name: string
      current_level: number
      warning_level: number
      danger_level: number
      flood_level: number
      exceed_limit: number
      inflow: number
      outflow: number
      storage_capacity: number
      status: string
      update_time: string
    }>
  }> {
    return this.request('/reservoir/realtime', { params })
  }

  // ==================== 系统管理接口 ====================

  /**
   * 用户登录
   */
  async login(credentials: {
    username: string
    password: string
  }): Promise<{
    token: string
    user: {
      id: number
      username: string
      role: string
      permissions: string[]
    }
  }> {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    })
    
    this.setToken(result.token)
    return result
  }

  /**
   * 获取系统状态
   */
  async getSystemStatus(): Promise<{
    status: string
    version: string
    uptime: string
    last_update: string
    components: Record<string, string>
    metrics: Record<string, any>
  }> {
    return this.request('/system/status')
  }

  // ==================== WebSocket 实时推送 ====================

  /**
   * 建立WebSocket连接
   */
  connectWebSocket(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
    onClose?: (event: CloseEvent) => void
  ): WebSocket {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      return this.wsConnection
    }

    const wsUrl = `${API_CONFIG.WS_URL}/inundation/updates?token=${this.token}`
    this.wsConnection = new WebSocket(wsUrl)

    this.wsConnection.onopen = () => {
      console.log('WebSocket连接已建立')
      this.reconnectAttempts = 0
    }

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error('解析WebSocket消息失败:', error)
      }
    }

    this.wsConnection.onerror = (error) => {
      console.error('WebSocket错误:', error)
      if (onError) onError(error)
    }

    this.wsConnection.onclose = (event) => {
      console.log('WebSocket连接关闭:', event.code, event.reason)
      
      // 尝试重新连接
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
        
        setTimeout(() => {
          this.connectWebSocket(onMessage, onError, onClose)
        }, this.reconnectDelay * this.reconnectAttempts)
      }
      
      if (onClose) onClose(event)
    }

    return this.wsConnection
  }

  /**
   * 关闭WebSocket连接
   */
  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close()
      this.wsConnection = null
    }
  }

  /**
   * 发送WebSocket消息
   */
  sendWebSocketMessage(message: any): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket连接未就绪，无法发送消息')
    }
  }

  // ==================== 数据订阅管理 ====================

  private subscriptions = new Map<string, {
    callback: (data: any) => void
    interval?: number
    lastUpdate?: number
  }>()

  /**
   * 订阅数据更新
   */
  subscribe(
    key: string,
    fetchFunction: () => Promise<any>,
    callback: (data: any) => void,
    interval: number = 30000 // 默认30秒
  ): void {
    // 停止现有的订阅
    this.unsubscribe(key)

    // 立即获取一次数据
    fetchFunction().then(callback).catch(console.error)

    // 设置定时器
    const timerId = setInterval(() => {
      fetchFunction().then(callback).catch(console.error)
    }, interval)

    this.subscriptions.set(key, {
      callback,
      interval: timerId as any,
      lastUpdate: Date.now(),
    })
  }

  /**
   * 取消订阅
   */
  unsubscribe(key: string): void {
    const subscription = this.subscriptions.get(key)
    if (subscription && subscription.interval) {
      clearInterval(subscription.interval)
    }
    this.subscriptions.delete(key)
  }

  /**
   * 取消所有订阅
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription, key) => {
      if (subscription.interval) {
        clearInterval(subscription.interval)
      }
    })
    this.subscriptions.clear()
  }
}

// 创建全局API实例
export const floodMonitorAPI = new FloodMonitorAPI()

// Vue composable for using the API
export function useFloodMonitorAPI() {
  return floodMonitorAPI
}

// 类型导出
export type {
  // 内涝区域类型
  InundationArea,
  // 降雨量站点类型
  RainfallStation,
  // 水库类型
  Reservoir,
} from './types'

// 工具函数
export function formatArea(area: number): string {
  return `${area.toFixed(2)} km²`
}

export function formatDepth(depth: number): string {
  return `${depth.toFixed(2)} m`
}

export function formatPopulation(population: number): string {
  return population.toLocaleString('zh-CN') + ' 人'
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: '#52c41a', // 绿色
    medium: '#fa8c16', // 橙色
    high: '#f5222d', // 红色
    critical: '#722ed1', // 紫色
  }
  return colors[severity] || '#8c8c8c'
}

export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    active: '活跃中',
    warning: '预警中',
    subsided: '已消退',
  }
  return texts[status] || status
}