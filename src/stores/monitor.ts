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
    const response = await fetch(url)
    const text = await response.text()
    return text
  }

  // 解析CSV数据
  function parseCsv(csvText: string): any[] {
    const lines = csvText.split('\n')
    const headers = lines[0].split(',')
    const data: any[] = []

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue
      const values = lines[i].split(',')
      const row: any = {}
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim() || ''
      })
      data.push(row)
    }

    return data
  }

  // 加载桂林天气数据和水库数据
  async function loadGuilinWeatherData() {
    loading.value = true
    error.value = null

    try {
      console.log('开始加载数据...')
      
      // 加载5月和6月的CSV文件（使用真实的中文文件名）
      const mayCsv = await loadCsvFromUrl('/2024年5月桂林市临桂区和灵川县天气数据.CSV')
      const juneCsv = await loadCsvFromUrl('/2024年6月桂林市临桂区灵川县天气数据.CSV')
      const reservoirCsv = await loadCsvFromUrl('/漓江上游水库水位信息.CSV')

      console.log('CSV文件加载成功')
      
      // 解析CSV数据
      const mayData = parseCsv(mayCsv)
      const juneData = parseCsv(juneCsv)
      const reservoirData = parseCsv(reservoirCsv)
      const allData = [...mayData, ...juneData]

      console.log('CSV数据解析成功')
      console.log('雨量数据条数:', allData.length)
      console.log('水库数据条数:', reservoirData.length)

      // 处理雨量数据
      // 按地区分组
      const groupedData: any = {
        '临桂区': [],
        '灵川县': []
      }

      allData.forEach(row => {
        const area = row['地区']
        if (groupedData[area]) {
          groupedData[area].push(row)
        }
      })

      // 处理每个地区的雨量数据
      const processedStations: RainfallStation[] = []

      // 临桂区
      if (groupedData['临桂区'].length > 0) {
        const linguiData = groupedData['临桂区'].sort((a: any, b: any) => {
          return new Date(b['日期']).getTime() - new Date(a['日期']).getTime()
        })[0]

        const linguiRainfall = Number(linguiData['降雨量(mm)'] || 0)
        processedStations.push({
          id: 1, // GL001
          name: '临桂区',
          lat: 25.2741,
          lng: 110.2704,
          dailyRainfall: linguiRainfall,
          hourlyRainfall: Number((linguiRainfall / 24).toFixed(1)),
          status: linguiRainfall >= 50 ? 'warning' : 'normal',
          updateTime: new Date(linguiData['日期'])
        })
      }

      // 灵川县
      if (groupedData['灵川县'].length > 0) {
        const lingchuanData = groupedData['灵川县'].sort((a: any, b: any) => {
          return new Date(b['日期']).getTime() - new Date(a['日期']).getTime()
        })[0]

        const lingchuanRainfall = Number(lingchuanData['降雨量(mm)'] || 0)
        processedStations.push({
          id: 2, // GL002
          name: '灵川县',
          lat: 25.4306,
          lng: 110.4308,
          dailyRainfall: lingchuanRainfall,
          hourlyRainfall: Number((lingchuanRainfall / 24).toFixed(1)),
          status: lingchuanRainfall >= 50 ? 'warning' : 'normal',
          updateTime: new Date(lingchuanData['日期'])
        })
      }

      // 更新雨量站点数据
      rainfallStations.value = processedStations
      console.log('雨量站点数据更新完成:', processedStations)

      // 处理水库数据
      const processedReservoirs: WaterLevelStation[] = []
      const processedRiverFlows: RiverFlow[] = []

      const reservoirNames = ['青狮潭', '斧子口', '小溶江', '川江']
      let id = 1

      reservoirNames.forEach(name => {
        const reservoir = reservoirData.find((r: any) => r['水库']?.includes(name))
        if (reservoir) {
          const currentLevel = Number(reservoir['水位(m)'] || 0)
          const warningLevel = Number(reservoir['汛限水位(m)'] || 0)
          const exceedLimit = Number(reservoir['超汛限(m)'] || 0)
          const flow = Number(reservoir['出库流量(m³/s)'] || 0)
          const velocity = Number(reservoir['出库流速(m/s)'] || 0)
          const outflowLevel = Number(reservoir['出库水位(m)'] || 0)

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
            currentLevel: currentLevel,
            warningLevel: warningLevel,
            guaranteeLevel: warningLevel + 0.5,
            dangerLevel: warningLevel + 1.0,
            floodLevel: warningLevel + 1.5,
            status: status
          })

          // 更新出库流量数据
          processedRiverFlows.push({
            id: id,
            name: name + '水库',
            flow: flow,
            velocity: velocity,
            waterLevel: outflowLevel
          })

          id++
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
