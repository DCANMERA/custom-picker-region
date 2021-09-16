Page({
  data: {
    label: ''
  },
  bindMultiPickerChange(data) {
    this.setData({
      label: `${
        data.detail[0]?.label || ''
      }/${
        data.detail[1]?.label || ''
      }/${
        data.detail[2]?.label || ''
      }`
    })
  }
})
