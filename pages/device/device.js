const app = getApp()
const md5 = require('../../assets/js/md5.js')
const SECRETKEY = 'fyJygAw3nUN4JwU'
Page({
  data: {
    inputText: '',
    receiveText: '',
    connectedDeviceId: '',
    services: {},
    characteristics: {},
    name:'',
    advertisData:'',
    connected: true,
    setInter:'',
    salt:''
  },
  bindInput: function (e) {
    this.setData({
      inputText: e.detail.value
    })
    console.log(e.detail.value)
  },
  Send40_goon: function()
  {
    //1800 second
    //  this.setData({ inputText: 
    //   "{\"c\":1,\"d\":{\"cid\":\"9d6a5a648227fe29\",\"time\":\"2020-09-08 16:47:19\",\"chgt\":1800,\"bid\": \"B20200805010005\",\"checkBid\":0,\"timePause\":0}}"
    // })

    //20 second
    this.setData({ inputText: 
      "{\"c\":1,\"d\":{\"cid\":\"9d6a5a648227fe29\",\"time\":\"2020-09-08 16:47:19\",\"chgt\":7200,\"bid\": \"5221120110100143\",\"checkBid\":0,\"timePause\":0}}"
      // {"c":1,"d":{"cid":"79f5d9467970d3b2","time":"2020-10-14 14:47:43","chgt":180,"bid": "018156610007060007","checkBid":0,"timePause":0}}
    })
    
    this.Send()
  },

  
  Send40: function()
  {
    //1800 second
    //  this.setData({ inputText: 
    //   "{\"c\":1,\"d\":{\"cid\":\"9d6a5a648227fe29\",\"time\":\"2020-09-08 16:47:19\",\"chgt\":1800,\"bid\": \"B20200805010005\",\"checkBid\":0,\"timePause\":0}}"
    // })

    //20 second
    this.setData({ inputText: 
      "{\"c\":1,\"d\":{\"cid\":\"9d6a5a648227fe29\",\"time\":\"2020-09-08 16:47:19\",\"chgt\":7200,\"bid\": \"5221120110100143\",\"checkBid\":0,\"timePause\":1}}"
    })
    
    this.Send()
  },
  wxauth: function()
  {
    //f1Rg7zF8Hwrvx9Gpx9Gf7wFgzHvr18pR  O6Ms6ZusO8R7u7usR6BQ6tgQRG7OgOgQ   GvFz8z9rFwgG99RrprFwgw8vFHfp88Gv
    this.setData({ inputText: "{\"c\":6,\"d\":{\"key\":\"GvFz8z9rFwgG99RrprFwgw8vFHfp88Gv\"}}"})
    this.Send()
  },
  getrecord: function()
  {
    this.setData({ inputText: "{\"c\":2,\"d\":{\"cid\":\"000001C000000001\"}}"})
    this.Send()
  },

  getcurstatus: function()
  {
    var _this = this
    this.setData({inputText: "{\"c\":3}"})
    this.Send()

    if(_this.data.setInter==''){
      _this.data.setInter = setInterval(function () {
        if(_this.data.connected){
        _this.setData({inputText: "{\"c\":3}"})
        _this.Send()
        console.log('c:3')
        }
        else{
          clearInterval(_this.data.setInter)
        }
      }, 8000);  // 10秒call一次
  }
  else{
      //清除计时器  即清除setInter
      clearInterval(_this.data.setInter)
  }
    // this.setData({inputText: "{\"c\":3}"})
    // this.Send()
  },

  onHide: function () {
    //清除计时器  即清除setInter
    // clearInterval(this.data.setInter)
  },

  chargeover: function()
  {
    this.setData({inputText: "{\"c\":4}"})
    this.Send()
  },
  getver: function()
  {
    this.setData({inputText: "{\"c\":5}"})
    this.Send()
  },

  clear_receive: function () {
    this.setData({
      receiveText: ''
    })
  
  },
  //发送指令
  Send: function () {
    var that = this
    var len = that.data.inputText.length;
    var idx=0;
    if (that.data.connected) {
      while(1){
      if(len>20){
        var buffer = new ArrayBuffer(20);
      var dataView = new Uint8Array(buffer)
      //添加签名
 
      for (var i = 0; i < 20; i++) {
          dataView[i] = that.data.inputText.charCodeAt(idx+i)
        }
      
      console.log("send:",dataView);
      wx.writeBLECharacteristicValue({
        deviceId: that.data.connectedDeviceId,
        serviceId: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
        characteristicId: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
        value: buffer,
        success: function (res) {
          console.log('发送成功')
        }
      })
      len = len -20;
      idx = idx+20;

      }
      else{
        var buffer = new ArrayBuffer(len);
        var dataView = new Uint8Array(buffer)
        //添加签名
   
        for (var i = 0; i < len; i++) {
            dataView[i] = that.data.inputText.charCodeAt(idx+i)
          }
        
        console.log("send:",dataView);
        wx.writeBLECharacteristicValue({
          deviceId: that.data.connectedDeviceId,
          serviceId: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
          characteristicId: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
          value: buffer,
          success: function (res) {
            console.log('发送成功')
          }
        })
        break;
      }
    }
      
    }
    else {
      wx.showModal({
        title: '提示',
        content: '蓝牙已断开',
        showCancel: false,
        success: function (res) {
          that.setData({
            searching: false
          })
        }
      })
    }
  },
  onLoad: function (options) {
    var that = this
    console.log(options)
    that.setData({
      connectedDeviceId: options.connectedDeviceId,
      name:options.name,
      advertisData:options.advertisData
    })
    wx.getBLEDeviceServices({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        console.log(res.services)
        that.setData({
          services: res.services
        })
        wx.getBLEDeviceCharacteristics({
          deviceId: options.connectedDeviceId,
          serviceId: res.services[0].uuid,
          success: function (res) {
            console.log(res.characteristics)
            that.setData({
              characteristics: res.characteristics
            })
            wx.notifyBLECharacteristicValueChange({
              state: true,
              deviceId: options.connectedDeviceId,
              serviceId: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
              characteristicId: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
              success: function (res) {
                console.log('启用notify成功')
              }
            })
          }
        })
      }
    })
    wx.onBLEConnectionStateChange(function (res) {
      console.log(res.connected)
      that.setData({
        connected: res.connected
      })
    })
    //注册消息之后的回调函数
    //蓝牙设备发送的消息
    wx.onBLECharacteristicValueChange(function (res) {
      
      var receiveText ;
      if (that.data.receiveText.length <600){
        receiveText = that.data.receiveText;
        receiveText = receiveText + app.buf2string(res.value)
      }
      else{
        receiveText =  app.buf2string(res.value)
      }
     
    //   var idx = receiveText.indexOf('{');
    //  if(idx != -1){

    //  }
      // if(receiveText.indexOf('salt:')==0)
      // {
      //   that.setData({
      //     salt: receiveText.substr(5)
      //   })
      // }
      // console.log('{ = ' + receiveText.indexOf('{'));
      console.log('接收到数据：' + receiveText)

      that.setData({
        receiveText: receiveText
      })
    })
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {
    console.log('hide')
  }
})