const util = require('./utils/util.js')
const rent = require('/utils/rent.js')
const qiniu = require('/utils/qiniu.js')

//app.js
App({

  util: util,
  rent: rent,
  qiniu: qiniu,

  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 获取用户信息
    wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                // 可以将 res 发送给后台解码出 unionId
                this.globalData.userInfo = res.userInfo;
                // 登录
                wx.login({
                  success: res => {
                    // 发送 res.code 到后台换取 openId, sessionKey, unionId
                    this.globalData.jsCode = res.code;
                    rent.getUserByJsCode(res.code, this.globalData.userInfo.nickName,
                        this.globalData.userInfo.avatarUrl)
                      .then(res => {
                        this.globalData.rentUserBean = res[0];
                      })
                  }
                })

                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                if (this.userInfoReadyCallback) {
                  this.userInfoReadyCallback(res)
                }
              }
            })
          }
        }
      }),
      qiniu.getQiniuToken()
      .then(res => {
        this.globalData.qiniutoken = res.msg;
      })
  },
  globalData: {
    userInfo: null
  },
})