import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RainfallStation, WaterLevelStation, RiverFlow, InundationArea, Reservoir, AlertInfo, Statistics } from '@/types'

export const useMonitorStore = defineStore('monitor', () => {
  // 加载状态
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 雨量监测站点数据
  const rainfallStations = ref<RainfallStation[]>([
    { id: 1, name: '南宁', lat: 22.82, lng: 108.32, hourlyRainfall: 12.5, dailyRainfall: 45.2, status: 'normal', updateTime: new Date() },
    { id: 2, name: '柳州', lat: 24.33, lng: 109.40, hourlyRainfall: 8.3, dailyRainfall: 32.1, status: 'normal', updateTime: new Date() },
    { id: 3, name: '桂林', lat: 25.27, lng: 110.29, hourlyRainfall: 15.7, dailyRainfall: 58.4, status: 'warning', updateTime: new Date() },
    { id: 4, name: '梧州', lat: 23.48, lng: 111.28, hourlyRainfall: 5.2, dailyRainfall: 28.9, status: 'normal', updateTime: new Date() },
    { id: 5, name: '北海', lat: 21.48, lng: 109.12, hourlyRainfall: 22.1, dailyRainfall: 78.3, status: 'danger', updateTime: new Date() },
    { id: 6, name: '防城港', lat: 21.61, lng: 108.35, hourlyRainfall: 10.8, dailyRainfall: 41.2, status: 'normal', updateTime: new Date() },
    { id: 7, name: '钦州', lat: 21.97, lng: 108.62, hourlyRainfall: 18.4, dailyRainfall: 62.7, status: 'warning', updateTime: new Date() },
    { id: 8, name: '玉林', lat: 22.64, lng: 110.17, hourlyRainfall: 7.6, dailyRainfall: 29.5, status: 'normal', updateTime: new Date() }
  ])

  // 水位监测站点数据
  const waterLevelStations = ref<WaterLevelStation[]>([
    { id: 1, name: '邕江', currentLevel: 48.00, warningLevel: 28.00, guaranteeLevel: 28.00, dangerLevel: 28.00, floodLevel: 28.00, status: 'normal' },
    { id: 2, name: '柳江', currentLevel: 52.30, warningLevel: 28.00, guaranteeLevel: 28.00, dangerLevel: 28.00, floodLevel: 28.00, status: 'warning' },
    { id: 3, name: '漓江', currentLevel: 45.80, warningLevel: 28.00, guaranteeLevel: 28.00, dangerLevel: 28.00, floodLevel: 28.00, status: 'normal' },
    { id: 4, name: '西江', currentLevel: 38.50, warningLevel: 28.00, guaranteeLevel: 28.00, dangerLevel: 28.00, floodLevel: 28.00, status: 'normal' }
  ])

  // 河流流量数据
  const riverFlows = ref<RiverFlow[]>([
    { id: 1, name: '邕江', flow: 1200, velocity: 2.5, waterLevel: 15.8 },
    { id: 2, name: '西江', flow: 850, velocity: 1.8, waterLevel: 12.3 },
    { id: 3, name: '柳江', flow: 420, velocity: 1.2, waterLevel: 8.5 },
    { id: 4, name: '漓江', flow: 380, velocity: 1.0, waterLevel: 7.2 }
  ])

  // 淹没区域数据
  const inundationAreas = ref<InundationArea[]>([
    { id: 1, name: '南宁市南部', area: 12.5, depth: 1.2, affectedPopulation: 3500, startTime: '2024-03-14 08:30', status: 'active' },
    { id: 2, name: '柳州市东部', area: 8.3, depth: 0.8, affectedPopulation: 2100, startTime: '2024-03-14 10:15', status: 'active' },
    { id: 3, name: '桂林市北部', area: 5.7, depth: 0.5, affectedPopulation: 1200, startTime: '2024-03-14 12:00', status: 'warning' }
  ])

  // 水库数据
  const reservoirs = ref<Reservoir[]>([
    { id: 1, name: '青狮潭水库', currentLevel: 145.2, capacity: 78.5, status: 'normal', warningLevel: '正常' },
    { id: 2, name: '澄碧河水库', currentLevel: 128.7, capacity: 65.3, status: 'warning', warningLevel: '警戒' },
    { id: 3, name: '龟石水库', currentLevel: 132.4, capacity: 71.2, status: 'normal', warningLevel: '正常' },
    { id: 4, name: '达开水库', currentLevel: 118.9, capacity: 58.6, status: 'normal', warningLevel: '正常' }
  ])

  // 预警信息
  const alerts = ref<AlertInfo[]>([
    { id: 1, type: 'water', title: '超警戒水位预警', content: '水位站003当前水位15.2m，超过警戒水位3.2m', level: 'high', time: '10分钟前' },
    { id: 2, type: 'rain', title: '强降雨预警', content: '监测站点007小时雨量达到45mm，请注意防范', level: 'medium', time: '25分钟前' },
    { id: 3, type: 'flow', title: '河流水位上涨', content: '河流003水位持续上涨，涨幅0.5m/h', level: 'medium', time: '1小时前' },
    { id: 4, type: 'inundation', title: '淹没区域扩大', content: '区域002淹没面积增加15%，请疏散群众', level: 'high', time: '1.5小时前' },
    { id: 5, type: 'flow', title: '流量异常', content: '河流005流量超过正常值10%', level: 'low', time: '2小时前' }
  ])

  // 桂林天气数据
  const guilinWeatherData = ref<any[]>([])

  // 统计数据
  const statistics = computed<Statistics>(() => ({
    totalStations: rainfallStations.value.length,
    warningStations: rainfallStations.value.filter(s => s.status === 'warning').length,
    dangerStations: rainfallStations.value.filter(s => s.status === 'danger').length,
    totalRainfall: rainfallStations.value.reduce((sum, s) => sum + s.dailyRainfall, 0),
    avgWaterLevel: waterLevelStations.value.reduce((sum, s) => sum + s.currentLevel, 0) / waterLevelStations.value.length,
    totalInundationArea: inundationAreas.value.reduce((sum, a) => sum + a.area, 0),
    affectedPopulation: inundationAreas.value.reduce((sum, a) => sum + a.affectedPopulation, 0)
  }))

  // 初始化数据
  function initData() {
    console.log('初始化监测数据...')
  }

  // 加载CSV文件
  async function loadCsvFromUrl(url: string): Promise<string> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const buffer = await response.arrayBuffer()
      
      // 根据文件名判断编码：中文文件名的CSV文件几乎肯定是GBK编码
      // 特别是"2024年5月桂林市临桂区和灵川县天气数据.CSV"这样的文件名
      
      // 对于中文文件名的CSV，强制使用GBK编码
      if (url.includes('桂林市') || url.includes('天气数据') || url.includes('水库水位')) {
        console.log(`检测到中文文件名，强制使用GBK编码: ${url}`)
        try {
          const text = new TextDecoder('gbk').decode(buffer)
          console.log(`中文CSV文件使用GBK编码解码成功: ${url}`)
          return text
        } catch (err) {
          console.log(`中文CSV文件GBK编码解码失败，尝试其他编码:`, err)
        }
      }
      
      let text = ''
      // 对于其他文件，先尝试GBK
      try {
        text = new TextDecoder('gbk').decode(buffer)
        if (/[\u4e00-\u9fa5]/.test(text)) {
          console.log(`CSV文件使用GBK编码解码成功: ${url}`)
          return text
        }
      } catch (err) {
        console.log(`CSV文件GBK编码解码失败:`, err)
      }
      
      // 如果GBK失败，尝试UTF-8
      try {
        text = new TextDecoder('utf-8').decode(buffer)
        if (/[\u4e00-\u9fa5]/.test(text)) {
          console.log(`CSV文件使用UTF-8编码解码成功: ${url}`)
          return text
        }
      } catch (err) {
        console.log(`CSV文件UTF-8编码解码失败:`, err)
      }
      
      // 最后尝试GB2312
      try {
        text = new TextDecoder('gb2312').decode(buffer)
        console.log(`CSV文件使用GB2312编码解码: ${url}`)
        return text
      } catch (err) {
        console.log(`CSV文件GB2312编码解码失败:`, err)
        // 如果所有编码都失败，尝试默认UTF-8（忽略错误）
        text = new TextDecoder('utf-8', { fatal: false }).decode(buffer)
        console.log('使用默认UTF-8解码（忽略错误）')
        return text
      }
    } catch (err) {
      console.error(`加载CSV文件失败: ${url}`, err)
      throw err
    }
  }

  // 解析CSV数据
  function parseCsv(csvText: string): any[] {
    try {
      const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '')
      if (lines.length === 0) {
        console.warn('CSV文件为空')
        return []
      }
      
      // 查找有效的表头行（包含中文字符）
      let headerIndex = 0
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        if (lines[i].includes(',') && /[\u4e00-\u9fa5]/.test(lines[i])) {
          headerIndex = i
          break
        }
      }
      
      const headerLine = lines[headerIndex]
      // 更健壮的CSV解析，处理带引号和逗号的情况
      const headers = parseCsvLine(headerLine)
      
      const data: any[] = []
      
      for (let i = headerIndex + 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line === '' || line.startsWith('//') || line.startsWith('#')) {
          continue
        }
        
        const values = parseCsvLine(line)
        const row: any = {}
        
        headers.forEach((header, index) => {
          if (header && header.trim() !== '') {
            const key = header.trim()
            const value = values[index]?.trim() || ''
            row[key] = value
          }
        })
        
        // 只添加有数据的行
        if (Object.keys(row).length > 0) {
          data.push(row)
        }
      }
      
      console.log(`解析CSV数据成功: ${data.length}行`)
      return data
    } catch (err) {
      console.error('解析CSV数据失败:', err)
      return []
    }
  }

  // 解析CSV单行
  function parseCsvLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if ((char === ',' || char === '，') && !inQuotes) {
        // 支持英文逗号和中文逗号
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current)
    return result
  }

  // 加载桂林天气数据和水库数据
  async function loadGuilinWeatherData() {
    loading.value = true
    error.value = null

    try {
      console.log('开始加载数据...')
      
      // 加载5月和6月的CSV文件（使用真实的中文文件名）
      console.log('加载5月CSV文件...')
      const mayCsvText = await loadCsvFromUrl('/2024年5月桂林市临桂区和灵川县天气数据.CSV')
      console.log('5月CSV文件加载成功，文本长度:', mayCsvText.length)
      
      console.log('加载6月CSV文件...')
      const juneCsvText = await loadCsvFromUrl('/2024年6月桂林市临桂区灵川县天气数据.CSV')
      console.log('6月CSV文件加载成功，文本长度:', juneCsvText.length)
      
      console.log('加载水库CSV文件...')
      const reservoirCsvText = await loadCsvFromUrl('/漓江上游水库水位信息.CSV')
      console.log('水库CSV文件加载成功，文本长度:', reservoirCsvText.length)

      console.log('CSV文件加载成功')
      
      // 解析CSV数据
      const mayData = parseCsv(mayCsvText)
      const juneData = parseCsv(juneCsvText)
      const reservoirData = parseCsv(reservoirCsvText)
      const allData = [...mayData, ...juneData]

      console.log('CSV数据解析成功')
      console.log('5月数据条数:', mayData.length)
      console.log('6月数据条数:', juneData.length)
      console.log('水库数据条数:', reservoirData.length)
      
      // 详细显示前3条数据的结构和字段名
      console.log('=== 雨量数据详细结构 ===')
      if (mayData.length > 0) {
        console.log('5月数据第一条:', mayData[0])
        console.log('5月数据字段名:', Object.keys(mayData[0]))
      }
      if (juneData.length > 0) {
        console.log('6月数据第一条:', juneData[0])
        console.log('6月数据字段名:', Object.keys(juneData[0]))
      }
      
      console.log('雨量数据示例（前3条）:', allData.slice(0, 3))
      console.log('水库数据示例（前3条）:', reservoirData.slice(0, 3))

      // 处理雨量数据
      console.log('=== 开始处理雨量数据 ===')
      console.log('总数据条数:', allData.length)
      console.log('前3条数据示例:', allData.slice(0, 3))
      
      // 按地区分组
      const groupedData: any = {
        '临桂区': [],
        '灵川县': []
      }

      let processedCount = 0
      allData.forEach((row, index) => {
        // 精确匹配字段名（根据CSV文件的实际字段名）
        const area = row['地区'] || ''
        if (area && groupedData[area]) {
          groupedData[area].push(row)
          processedCount++
        } else {
          console.log(`第${index}行数据未匹配到地区，行数据:`, row)
          console.log(`第${index}行所有字段名:`, Object.keys(row))
        }
      })

      console.log('成功处理数据条数:', processedCount)
      console.log('临桂区数据条数:', groupedData['临桂区'].length)
      console.log('灵川县数据条数:', groupedData['灵川县'].length)
      
      if (allData.length > 0) {
        console.log('所有数据字段名示例:', Object.keys(allData[0]))
        console.log('第一条数据完整内容:', allData[0])
      }

      // 处理每个地区的雨量数据
      const processedStations: RainfallStation[] = []

      // 临桂区
      if (groupedData['临桂区'].length > 0) {
        console.log('=== 处理临桂区数据 ===')
        // 按日期降序排序，获取最新数据
        const sortedLinguiData = groupedData['临桂区'].sort((a: any, b: any) => {
          const dateA = a['日期'] || ''
          const dateB = b['日期'] || ''
          console.log(`比较日期: ${dateA} vs ${dateB}`)
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })
        
        console.log('临桂区排序后数据条数:', sortedLinguiData.length)
        const linguiData = sortedLinguiData[0]

        // 精确匹配降雨量字段名
        const linguiRainfall = Number(linguiData['降雨量(mm)'] || 0)
        
        console.log('临桂区最新数据:', linguiData)
        console.log('临桂区降雨量字段值:', linguiData['降雨量(mm)'])
        console.log('临桂区降雨量(转换后):', linguiRainfall, 'mm')

        processedStations.push({
          id: 1, // GL001
          name: '临桂区',
          lat: 25.2741,
          lng: 110.2704,
          dailyRainfall: linguiRainfall,
          hourlyRainfall: Number((linguiRainfall / 24).toFixed(1)),
          status: linguiRainfall >= 50 ? 'warning' : 'normal',
          updateTime: new Date(linguiData['日期'] || new Date())
        })
      } else {
        console.log('警告: 未找到临桂区数据')
      }

      // 灵川县
      if (groupedData['灵川县'].length > 0) {
        console.log('=== 处理灵川县数据 ===')
        // 按日期降序排序，获取最新数据
        const sortedLingchuanData = groupedData['灵川县'].sort((a: any, b: any) => {
          const dateA = a['日期'] || ''
          const dateB = b['日期'] || ''
          console.log(`比较日期: ${dateA} vs ${dateB}`)
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })
        
        console.log('灵川县排序后数据条数:', sortedLingchuanData.length)
        const lingchuanData = sortedLingchuanData[0]

        // 精确匹配降雨量字段名
        const lingchuanRainfall = Number(lingchuanData['降雨量(mm)'] || 0)
        
        console.log('灵川县最新数据:', lingchuanData)
        console.log('灵川县降雨量字段值:', lingchuanData['降雨量(mm)'])
        console.log('灵川县降雨量(转换后):', lingchuanRainfall, 'mm')

        processedStations.push({
          id: 2, // GL002
          name: '灵川县',
          lat: 25.4306,
          lng: 110.4308,
          dailyRainfall: lingchuanRainfall,
          hourlyRainfall: Number((lingchuanRainfall / 24).toFixed(1)),
          status: lingchuanRainfall >= 50 ? 'warning' : 'normal',
          updateTime: new Date(lingchuanData['日期'] || new Date())
        })
      } else {
        console.log('警告: 未找到灵川县数据')
      }

      // 更新雨量站点数据
      rainfallStations.value = processedStations
      console.log('=== 雨量站点数据更新完成 ===')
      console.log('处理后的站点数:', processedStations.length)
      console.log('详细数据:', processedStations)
      
      // 计算总降雨量用于验证
      const totalRainfall = processedStations.reduce((sum, station) => sum + station.dailyRainfall, 0)
      console.log('计算出的总降雨量:', totalRainfall, 'mm')

      // 处理水库数据
      const processedReservoirs: WaterLevelStation[] = []
      const processedRiverFlows: RiverFlow[] = []

      const reservoirNames = ['青狮潭', '斧子口', '小溶江', '川江']
      let id = 1

      console.log('开始处理水库数据，数据条数:', reservoirData.length)
      
      reservoirNames.forEach(name => {
        // 查找包含水库名称的行
        const reservoir = reservoirData.find((r: any) => {
          const rowStr = JSON.stringify(r)
          return rowStr.includes(name)
        })
        
        if (reservoir) {
          console.log(`找到${name}水库数据:`, reservoir)
          
          // 尝试多种可能的字段名
          const findFieldValue = (patterns: string[], defaultValue: number = 0): number => {
            for (const pattern of patterns) {
              for (const key in reservoir) {
                if (key.includes(pattern)) {
                  const value = reservoir[key]
                  const num = Number(value)
                  if (!isNaN(num)) {
                    return num
                  }
                }
              }
            }
            return defaultValue
          }

          const currentLevel = findFieldValue(['水位', '当前水位', '水', 'level', 'Level'], 0)
          const warningLevel = findFieldValue(['汛限', '限制', '限', 'warning', 'Warning'], 0)
          const exceedLimit = findFieldValue(['超', '超过', 'exceed', 'Exceed'], 0)
          const flow = findFieldValue(['流量', '出库流量', 'flow', 'Flow'], 0)
          const velocity = findFieldValue(['流速', '速度', 'velocity', 'Velocity'], 0)
          const outflowLevel = findFieldValue(['出库水位', '出口水位', 'outflow', 'Outflow'], 0)

          console.log(`${name}水库解析结果:`, {
            currentLevel,
            warningLevel,
            exceedLimit,
            flow,
            velocity,
            outflowLevel
          })

          // 确定状态
          let status: 'normal' | 'warning' | 'danger' = 'normal'
          if (exceedLimit > 1) {
            status = 'danger'
          } else if (exceedLimit > 0) {
            status = 'warning'
          }

          // 更新水库水位数据
          processedReservoirs.push({
            id: id,
            name: name + '水库',
            currentLevel: currentLevel || (222 + id * 10), // 备用值
            warningLevel: warningLevel || (220 + id * 10),
            guaranteeLevel: (warningLevel || (220 + id * 10)) + 0.5,
            dangerLevel: (warningLevel || (220 + id * 10)) + 1.0,
            floodLevel: (warningLevel || (220 + id * 10)) + 1.5,
            status: status
          })

          // 更新出库流量数据
          processedRiverFlows.push({
            id: id,
            name: name + '水库',
            flow: flow || (25 + id),
            velocity: velocity || 0.5,
            waterLevel: outflowLevel || (warningLevel || (220 + id * 10))
          })

          id++
        } else {
          console.log(`未找到${name}水库数据，使用备用数据`)
        }
      })

      // 如果没有解析到水库数据，使用备用数据
      if (processedReservoirs.length === 0) {
        console.warn('未解析到水库数据，使用备用数据')
        processedReservoirs.push(
          { id: 1, name: '青狮潭水库', currentLevel: 222.0, warningLevel: 220.0, guaranteeLevel: 220.5, dangerLevel: 221.0, floodLevel: 221.5, status: 'normal' },
          { id: 2, name: '斧子口水库', currentLevel: 242.0, warningLevel: 240.0, guaranteeLevel: 240.5, dangerLevel: 241.0, floodLevel: 241.5, status: 'warning' },
          { id: 3, name: '小溶江水库', currentLevel: 256.0, warningLevel: 255.0, guaranteeLevel: 255.5, dangerLevel: 256.0, floodLevel: 256.5, status: 'normal' },
          { id: 4, name: '川江水库', currentLevel: 250.0, warningLevel: 249.0, guaranteeLevel: 249.5, dangerLevel: 250.0, floodLevel: 250.5, status: 'normal' }
        )
        processedRiverFlows.push(
          { id: 1, name: '青狮潭水库', flow: 26, velocity: 0.5, waterLevel: 220.0 },
          { id: 2, name: '斧子口水库', flow: 28, velocity: 0.6, waterLevel: 240.0 },
          { id: 3, name: '小溶江水库', flow: 28, velocity: 0.6, waterLevel: 255.0 },
          { id: 4, name: '川江水库', flow: 28, velocity: 0.6, waterLevel: 249.0 }
        )
      }

      // 更新水库水位数据
      waterLevelStations.value = processedReservoirs
      console.log('水库水位数据更新完成:', processedReservoirs)

      // 更新出库流量数据
      riverFlows.value = processedRiverFlows
      console.log('出库流量数据更新完成:', processedRiverFlows)

      // 保存桂林天气数据
      guilinWeatherData.value = allData
      console.log('数据加载完成')

    } catch (err) {
      error.value = '加载数据失败'
      console.error('加载数据失败:', err)
      
      // 使用备用数据
      console.log('使用备用数据...')
      rainfallStations.value = [
        { id: 1, name: '临桂区', lat: 25.2741, lng: 110.2704, hourlyRainfall: 2.1, dailyRainfall: 50.0, status: 'warning', updateTime: new Date() },
        { id: 2, name: '灵川县', lat: 25.4306, lng: 110.4308, hourlyRainfall: 1.5, dailyRainfall: 36.0, status: 'normal', updateTime: new Date() }
      ]
      waterLevelStations.value = [
        { id: 1, name: '青狮潭水库', currentLevel: 222.0, warningLevel: 220.0, guaranteeLevel: 220.5, dangerLevel: 221.0, floodLevel: 221.5, status: 'normal' },
        { id: 2, name: '斧子口水库', currentLevel: 242.0, warningLevel: 240.0, guaranteeLevel: 240.5, dangerLevel: 241.0, floodLevel: 241.5, status: 'warning' },
        { id: 3, name: '小溶江水库', currentLevel: 256.0, warningLevel: 255.0, guaranteeLevel: 255.5, dangerLevel: 256.0, floodLevel: 256.5, status: 'normal' },
        { id: 4, name: '川江水库', currentLevel: 250.0, warningLevel: 249.0, guaranteeLevel: 249.5, dangerLevel: 250.0, floodLevel: 250.5, status: 'normal' }
      ]
      riverFlows.value = [
        { id: 1, name: '青狮潭水库', flow: 26, velocity: 0.5, waterLevel: 220.0 },
        { id: 2, name: '斧子口水库', flow: 28, velocity: 0.6, waterLevel: 240.0 },
        { id: 3, name: '小溶江水库', flow: 28, velocity: 0.6, waterLevel: 255.0 },
        { id: 4, name: '川江水库', flow: 28, velocity: 0.6, waterLevel: 249.0 }
      ]
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    rainfallStations,
    waterLevelStations,
    riverFlows,
    inundationAreas,
    reservoirs,
    alerts,
    statistics,
    guilinWeatherData,
    initData,
    loadGuilinWeatherData
  }
})
