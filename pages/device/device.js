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
    salt:'',
    qrcodeMac: "",
    searching: false,
    devicesList: [],
    searchcalled:false
  },


  
  ConnectByID: function(targetID){
    var that=this  
    console.log("ConnectByID:",targetID)
    that.setData({
      searching: true
      // devicesList: []
    })
    // var name,advertisData
    //获取当前的name和ad
    // for (var i = 0; i < that.data.devicesList.length; i++) {
    //   if (targetID == that.data.devicesList[i].deviceId) {
    //     name=that.data.devicesList[i].name
    //     advertisData=that.data.devicesList[i].advertisData
    //     break
    //   }
    // }

    // console.log("connect:"+targetID+"|"+name+"|"+advertisData)
    // wx.stopBluetoothDevicesDiscovery({
    //   success: function (res) {
    //     console.log(res)
    //   }
    // })
    wx.hideLoading()
    wx.showLoading({
      title: '连接蓝牙设备中...',
    })
    wx.createBLEConnection({
      deviceId: targetID,
      success: function (res) {
        console.log(res)
        wx.hideLoading()
        wx.showToast({
          title: '连接成功',
          icon: 'success',
          duration: 1000
        })
        console.log("getplatform")
        var platform = wx.getSystemInfoSync().platform
        console.log(platform)
        if(platform == "android"){  
            wx.getBLEDeviceServices({
                deviceId: that.data.connectedDeviceId,
                success: function (res) {
                  console.log(res.services)
                  that.setData({
                    services: res.services
                  })
                  wx.getBLEDeviceCharacteristics({
                    deviceId: that.data.connectedDeviceId,
                    serviceId: that.data.services[0].uuid,
                    success: function (res) {
                      console.log(res.characteristics)
                      that.setData({
                        characteristics: res.characteristics
                      })
                      wx.notifyBLECharacteristicValueChange({
                        state: true,
                        deviceId: that.data.connectedDeviceId,
                        serviceId: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
                        characteristicId: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
                        success: function (res) {
                          console.log('启用notify成功')
                          that.wxauth()
                        },
                        fail: function (res) {
                          console.log('启用notify fail')
                        }
          
                      })
                    },
                    fail: function (res) {
                      console.log('getBLEDeviceCharacteristics fail')
                    }
                  })
                },
                fail: function (res) {
                  console.log('getBLEDeviceServices fail')
                }
          })        
          // wx.navigateTo({
          //   url: '../device/device?connectedDeviceId=' + targetID +'&name='+name+'&advertisData='+advertisData
          // })
        }
        else{
          console.log('ios device')
          wx.getBLEDeviceServices({
            // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
            deviceId: targetID,
            success: function (res) {
              console.log("getBLEDeviceServices success")
              console.log(JSON.stringify(res))
              //获取设备特征对象
              wx.getBLEDeviceCharacteristics({
                deviceId: targetID,
                serviceId: '0783B03E-8535-B5A0-7140-A304D2495CB7',
                success: function(res) {

                  // console.log('../device/device?connectedDeviceId=' + targetID +'&name='+name+'&advertisData='+advertisData)
                  // wx.navigateTo({
                  //   url: '../device/device?connectedDeviceId=' + targetID +'&name='+name+'&advertisData='+advertisData
                  // })
                },
                fail:function(){
                  // wx.showModal({
                  //   title: '温馨提示',
                  //   content: '获取特征对象失败！',
                  //   showCancel: false
                  // });
                  wx.showLoading({
                    title: '获取特征对象失败,重新连接...',
                  })
                  quit(obj);
                  that.Search();
                }
              })
            },
            fail:function(){
              // wx.showModal({
              //   title: '温馨提示',
              //   content: '获取服务失败！',
              //   showCancel:false
              // });
              wx.showLoading({
                title: '获取服务失败,重新连接...',
              })
              quit(obj);
              that.Search();
            }
          })
        }   
      },
      fail: function (res) {
        console.log(res)
        wx.hideLoading()
        // wx.showModal({
        //   title: '提示',
        //   content: '连接失败',
        //   showCancel: false
        // })
        wx.showLoading({
          title: '连接失败,重新连接...',
        })
        that.Search();
      }
    })
  },


  Search: function () {
    var that = this
    
    console.log("search:",that.data.searching)
    if(false == that.data.searchcalled){     
    that.setData({
      searchcalled: true
    })
   
    if (!that.data.searching) {
      //关闭现有的蓝牙连接
      wx.closeBluetoothAdapter({
        complete: function (res) {
          console.log(res)
          //打开蓝牙适配
          wx.openBluetoothAdapter({
            success: function (res) {
              console.log(res)
              wx.getBluetoothAdapterState({
                success: function (res) {
                  console.log(res)
                }
              })
              //开始搜索蓝牙设备
              wx.startBluetoothDevicesDiscovery({
                allowDuplicatesKey: false,
                success: function (res) {              
                  
                  console.log(res)
                  that.setData({
                    searching: true,
                    devicesList: []
                  })
                }
              })
            },
            fail: function (res) {
              console.log(res)
              wx.showModal({
                title: '提示',
                content: '请检查手机蓝牙是否打开',
                showCancel: false,
                success: function (res) {
                  that.setData({
                    searching: false
                  })
                }
              })
            }
          })
        }
      })
    }
    else {
      that.setData({
        devicesList: []
      })

        wx.stopBluetoothDevicesDiscovery({
          success: function (res) {
            console.log(res)
            that.setData({
              searching: false
            })
            that.Search()
          }
        })

      }
      that.setData({
        searchcalled: false
      })
    }
    
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
      "{\"c\":1,\"d\":{\"cid\":\"98324f3910f2abb2\",\"time\":\"2020-09-08 16:47:19\",\"chgt\":7200,\"bid\": \"5223121010100033\",\"checkBid\":1,\"timePause\":1}}"
      // "{\"c\":1,\"d\":{\"cid\":\"98324f3910f2abb2\",\"time\":\"2020-09-08 16:47:19\",\"chgt\":7200,\"bid\": \"3221120110100027\",\"checkBid\":1,\"timePause\":1}}"
      // // {"c":1,"d":{"cid":"79f5d9467970d3b2","time":"2020-10-14 14:47:43","chgt":180,"bid": "018156610007060007","checkBid":0,"timePause":0}}
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
      "{\"c\":1,\"d\":{\"cid\":\"98324f3910f2abb2\",\"time\":\"2020-09-08 16:47:19\",\"chgt\":7200,\"bid\": \"3221120110100027\",\"checkBid\":1,\"timePause\":1}}"
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

    if(_this.data.setInter== 0xff){
      _this.data.setInter = setInterval(function () {
        if(_this.data.connected){
        _this.setData({inputText: "{\"c\":3}"})
        _this.Send()
        console.log('setup setInter to send c:3 ')
        }
        else{
          clearInterval(_this.data.setInter)
          _this.setData({setInter: 0xff})
          console.log('clear setInter to send c:3 ')
        }
      }, 3000);  // 10秒call一次
  }
  else{
      //清除计时器  即清除setInter
      clearInterval(_this.data.setInter)
      _this.setData({setInter:0xff})
      console.log('clear setInter to send c:3 ')
      
  }
    // this.setData({inputText: "{\"c\":3}"})
    // this.Send()
  },

  onHide: function () {
    //清除计时器  即清除setInter
    // clearInterval(this.data.setInter)
    var that = this
    that.setData({
      devicesList: []
    })
    // if (this.data.searching) 
    {
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log(res)
          that.setData({
            searching: false
          })
        }
      })
    }
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
          that.Search()
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
    wx.onBluetoothAdapterStateChange(function (res) {
      console.log(res)
      that.setData({
        searching: res.discovering
      })
      if (!res.available) {
        that.setData({
          searching: false
        })
      }
    })
    wx.onBluetoothDeviceFound(function (devices) {
      //剔除重复设备，兼容不同设备API的不同返回值
      // console.log('onBluetoothDeviceFound->connectedDeviceId:'+that.data.connectedDeviceId)
      var isnotexist = true
      if (devices.deviceId) {
        if (devices.advertisData)
        {         
          devices.advertisData = app.buf2hex(devices.advertisData)
        }
        else
        {
          devices.advertisData = ''
        }
        console.log('BLE:'+devices)
        for (var i = 0; i < that.data.devicesList.length; i++) {
          if (devices.deviceId == that.data.devicesList[i].deviceId) {
            isnotexist = false
          }
        }
        if (isnotexist) {
          that.data.devicesList.push(devices)
        }
      }
      else if (devices.devices) {
        if (devices.devices[0].advertisData)
        {
          if(that.data.connectedDeviceId == devices.devices[0].deviceId){
            console.log('find device to connect it :'+devices)
            that.ConnectByID(that.data.connectedDeviceId);
            //
            wx.stopBluetoothDevicesDiscovery({
              success: function (res) {
                console.log(res)
                that.setData({
                  searching: false
                })
              }
            })

          }
          devices.devices[0].advertisData = app.buf2hex(devices.devices[0].advertisData)
        }
        else
        {
          devices.devices[0].advertisData = ''
        }
        console.log(devices.devices[0])
        for (var i = 0; i < that.data.devicesList.length; i++) {
          if (devices.devices[0].deviceId == that.data.devicesList[i].deviceId) {
            isnotexist = false
          }
        }
        if (isnotexist) {
          that.data.devicesList.push(devices.devices[0])
        }
      }
      else if (devices[0]) {
        if (devices[0].advertisData)
        {
          devices[0].advertisData = app.buf2hex(devices[0].advertisData)
        }
        else
        {
          devices[0].advertisData = ''
        }
        console.log(devices[0])
        for (var i = 0; i < devices_list.length; i++) {
          if (devices[0].deviceId == that.data.devicesList[i].deviceId) {
            isnotexist = false
          }
        }
        if (isnotexist) {
          that.data.devicesList.push(devices[0])
        }
      }
      // that.setData({
      //   devicesList: that.data.devicesList
      // })
    })

 
    wx.onBLEConnectionStateChange(function (res) {
      console.log(res.connected)
      that.setData({
        connected: res.connected
      })
      if(res.connected){
        console.log('ble connected')        
      }
      else{
        console.log('ble disconnected, so search ble and reconnected')
        that.setData({
          searching: false
        })
        that.Search()
      }
     
    })
    //注册消息之后的回调函数
    //蓝牙设备发送的消息
    wx.onBLECharacteristicValueChange(function (res) {
      
      var receiveText ;
      var cur_rx_text = app.buf2string(res.value)
      if (that.data.receiveText.length <600){
        receiveText = that.data.receiveText;
        receiveText = receiveText + cur_rx_text//app.buf2string(res.value)
      }
      else{
        receiveText =  app.buf2string(res.value)
      }
     
    //   var idx = receiveText.indexOf('{');
    //  if(idx != -1){

    //  }
      if(receiveText.indexOf('"r":6,"d":{"st":1') != -1)
      {
        that.getcurstatus()
      }
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