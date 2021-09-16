// 模拟数据
import { region } from './region'

// 默认picker value 值
const defaultTargetIndex = [0, 0, 0]

// 浅拷贝
const shallowCopy = item => {
  try {
    return JSON.parse(JSON.stringify(item))
  } catch (error) {
    return item
  }
}

Component({
  options: {
    multipleSlots: true
  },
  properties: {
    rangeKey: {
      // 小程序picker的 range-key 传值
      type: String,
      required: true,
      value: 'label'
    },
    codeKey: {
      // picker组件改变后需要的返回值键名
      type: String,
      required: true,
      value: 'value'
    },
    isResetPicker: {
      // 重置CustomPickerRegion组件数据
      type: Boolean,
      value: false,
      observer(nVal) {
        if (nVal) {
          this.setData(
            {
              confirmData: {},
              targetIndex: defaultTargetIndex.slice(0, this.data.columns)
            },
            () => {
              this.handlePickerRegionChange(this.data.pickerRegionList[0])
            }
          )
        }
      }
    },
    label: {
      // 初始地址文本展示
      type: String,
      value: '请选择'
    },
    columns: {
      // 小程序picker的列数
      type: Number,
      value: 3
    },
    value: {
      // 小程序picker的value传值
      type: Array,
      required: true,
      value: shallowCopy(defaultTargetIndex)
    }
  },
  data: {
    confirmData: {}, // 保留的每一次确定后的数据
    pickerRegionList: [], // 根据传入的列数，创建数据
    target: {}, // 传入初始化的数据
    targetIndex: [] // 传入初始化小程序picker的value传值
  },
  lifetimes: {
    attached() {
      this.data.targetIndex = !this.data.value.length
        ? defaultTargetIndex.slice(0, this.data.columns)
        : shallowCopy(this.data.value)
      this.setData({ targetIndex: this.data.targetIndex }, () => {
        this.getPickerRegionList()
      })
    }
  },
  methods: {
    getPickerRegionList() {
      return new Promise((resolve, reject) => {
        const list = wx.getStorageSync('region')
        if (list?.length) {
          this.handlePickerRegionChange(list)
          resolve(list)
          return
        }

        // 如果需要http/https请求可以换成自己所需要的业务
        const { data, code } = region
        if (code === 0) {
          this.handlePickerRegionChange(data.list)
          wx.setStorageSync('region', data.list)
          return resolve(data.list)
        }
        reject()
      })
    },
    // 地址发生改变后回调
    bindMultiPickerChange(e) {
      const confirmData = shallowCopy({
        ...this.data.target,
        targetIndex: this.data.targetIndex
      })
      this.setData({ confirmData }, () => {
        this.triggerEvent('changes', this.data.confirmData)
      })
    },

    // 地址发生取消后回调
    bindMultiPickerCancel(e) {
      this.triggerEvent('cancel', this.data.target)
    },

    // 地址列发生改变后回调
    bindMultiPickerColumnChange(e) {
      const { column, value } = e.detail
      const { targetIndex, pickerRegionList } = this.data
      targetIndex[column] = value
      column === 0 && (targetIndex[1] = 0)
      column === 0 && this.data.columns === 3 && (targetIndex[2] = 0)
      column === 1 && this.data.columns === 3 && (targetIndex[2] = 0)
      this.setData({ targetIndex }, () => {
        this.handlePickerRegionChange(pickerRegionList[0])
        this.triggerEvent('columnchange', this.data.target)
      })
    },
    // 处理地址数据改变回调
    handlePickerRegionChange(list) {
      let index = 0
      let column = this.data.columns
      const [firstIndex, secondIndex, thirdIndex] = this.data.targetIndex
      while (column > 0) {
        column--
        if (column === 0) {
          index = firstIndex
          this.data.pickerRegionList[0] = list
        }
        if (column === 1) {
          index = secondIndex
          this.data.pickerRegionList[1] = list[firstIndex].children
        }
        if (column === 2) {
          index = thirdIndex
          this.data.pickerRegionList[2] = list[firstIndex].children[secondIndex].children
        }
        const item = this.data.pickerRegionList[column][index] || ''
        this.data.target[column] = {
          index,
          [this.data.rangeKey]: item ? item[this.data.rangeKey] : '',
          [this.data.codeKey]: item ? item[this.data.codeKey] : ''
        }
      }
      this.setData({
        target: this.data.target,
        pickerRegionList: this.data.pickerRegionList
      })
    }
  }
})
