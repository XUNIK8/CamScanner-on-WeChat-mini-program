import { base64src } from '../../base64.js'
const app = getApp();
var startPoint
Page({
  data: {
    StatusBar: 20,
    CustomBar: 60,
    PageCur: 'basics',
    picx0:0,
    picy0:0,
    imgsave:'',
    corner:[[0,0],[0,0],[0,0],[0,0]], //拖动获取的四个角点
     //按钮位置参数
     buttonTop1: 0,
     buttonLeft1: 0,
     buttonTop2: 0,
     buttonLeft2: 0,
     buttonTop3: 0,
     buttonLeft3: 0,
     buttonTop4: 0,
     buttonLeft4: 0,
     windowHeight: '',
     windowWidth: '',
     widthpic:0,
     heightpic:0,
     widthchange:0,
     heightchange:0,
     //角标显示数字
     corner_data:0,
    
    // 这里src改成了下面两个，origin作为存储原图像的变量，process作为存储处理后图像
    srcOrigin:"../../images/empty.jpg",
    srcProcess:"../../images/empty.jpg",
    flag:0,
    par:0,
    bool:'0',


   array: [{
    mode: 'aspectFit',
    text: 'aspectFit：保持纵横比缩放图片，使图片的长边能完全显示出来'
  }], 
  iconList: [{
    icon: 'cardboardfill',
    color: 'red',
    badge: 120,
    name: '对比度',
    flag:1
  }, {
    icon: 'recordfill',
    color: 'orange',
    badge: 1,
    name: '去噪声',
    flag:2
  }, {
    icon: 'picfill',
    color: 'yellow',
    badge: 0,
    name: '二值化',
    flag:3
  }, {
    icon: 'noticefill',
    color: 'olive',
    badge: 22,
    name: '锐化',
    flag:4
  },{
    icon: 'clothesfill',
    color: 'blue',
    badge: 1,
    name: '自适应阈值',
    flag:5
  }, {
    icon: 'discoverfill',
    color: 'purple',
    badge: 1,
    name: 'sauvola阈值',
    flag:6
  },{
    icon: 'commandfill',
    color: 'purple',
    badge: 1,
    name: '腐蚀',
    flag:8
  },
  {
    icon: 'brandfill',
    color: 'purple',
    badge: 1,
    name: '膨胀',
    flag:9
  },
  {
    icon: 'brandfill',
    color: 'mauve',
    badge: 1,
    name: '一键复原',
    flag:7
  }
],
  gridCol:4,
  skin: false,
  info: ''
},
onLoad:function(){
  // 获取购物车控件适配参数
  var that =this;
  wx.getSystemInfo({
    success: function (res) {
      console.log(res);
      // 屏幕宽度、高度
      console.log('height=' + res.windowHeight);
      console.log('width=' + res.windowWidth);
      // 高度,宽度 单位为px
      that.setData({
        windowHeight:  res.windowHeight,
        windowWidth:  res.windowWidth,
        buttonTop1:res.windowHeight*0.88,//这里定义按钮的初始位置
        buttonLeft1:res.windowWidth*0.70,//这里定义按钮的初始位置
        buttonTop2:res.windowHeight*0.88,//这里定义按钮的初始位置
        buttonLeft2:res.windowWidth*0.80,//这里定义按钮的初始位置
        buttonTop3:res.windowHeight*0.93,//这里定义按钮的初始位置
        buttonLeft3:res.windowWidth*0.80,//这里定义按钮的初始位置
        buttonTop4:res.windowHeight*0.93,//这里定义按钮的初始位置
        buttonLeft4:res.windowWidth*0.70,//这里定义按钮的初始位置
      })
    }
  })
},

//可拖动悬浮按钮点击事件
btn_Suspension_click1:function(){ 
  var centerx,centery,corner,widthpic,heightpic,widthchange,heightchange
  widthpic=this.data.widthpic
  heightpic=this.data.heightpic
  widthchange=this.data.widthchange
  heightchange=this.data.heightchange
  centerx=this.data.buttonLeft1+10-this.data.picx0
  centery=this.data.buttonTop1+10-this.data.picy0
  corner=this.data.corner
  if(centerx>=0 & centery >=0 & centerx<=widthchange & centery<= heightchange) {
    //这里是点击之后将要执行的操作
    wx.showToast({
      title: '位置确认成功',
      icon:'success',
      duration:1000
    })
    // corner[0][0]=centerx,
    // corner[0][1]=centery,
    // corner[0][0]=centerx*widthpic/(10*widthchange),
    // corner[0][1]=centery*heightpic/(10*heightchange),
    corner[0][0]=Math.round(centerx*widthpic/(widthchange)),
    corner[0][1]=Math.round(centery*heightpic/(heightchange)),
    console.log('按钮位置',corner[0][0],corner[0][1])
    this.setData({
      corner: corner
    })
} else {
wx.showToast({
  title: '超出范围',
  icon:'error',
  duration:1000
})
}

},
btn_Suspension_click2:function(){
  var centerx,centery,corner,widthpic,heightpic,widthchange,heightchange
  widthpic=this.data.widthpic
  heightpic=this.data.heightpic
  widthchange=this.data.widthchange
  heightchange=this.data.heightchange
  centerx=this.data.buttonLeft2+10-this.data.picx0
  centery=this.data.buttonTop2+10-this.data.picy0
  corner=this.data.corner
  if(centerx>=0 & centery >=0 & centerx<=widthchange & centery<= heightchange) {
        //这里是点击购物车之后将要执行的操作
        wx.showToast({
          title: '位置确认成功',
          icon:'success',
          duration:1000
        })
        // corner[1][0]=centerx,
        // corner[1][1]=centery,
        // corner[1][0]=centerx*widthpic/(10*widthchange),
        // corner[1][1]=centery*heightpic/(10*heightchange),
        corner[1][0]=Math.round(centerx*widthpic/(widthchange)),
        corner[1][1]=Math.round(centery*heightpic/(heightchange)),
        this.setData({
          corner: corner
        })
  } else {
    wx.showToast({
      title: '超出范围，请重新选择',
      icon:'wrong',
      duration:1000
    })
  }
  console.log('按钮位置',corner[1][0],corner[1][1])
},
btn_Suspension_click3:function(){

  var centerx,centery,corner,widthpic,heightpic,widthchange,heightchange
  widthpic=this.data.widthpic
  heightpic=this.data.heightpic
  widthchange=this.data.widthchange
  heightchange=this.data.heightchange
  centerx=this.data.buttonLeft3+10-this.data.picx0
  centery=this.data.buttonTop3+10-this.data.picy0
  corner=this.data.corner
  //////////////////////////
  if(centerx>=0 & centery >=0 & centerx<=widthchange & centery<= heightchange) {
    //这里是点击购物车之后将要执行的操作
    wx.showToast({
      title: '位置确认成功',
      icon:'success',
      duration:1000
    })
    // corner[2][0]=centerx,
    // corner[2][1]=centery,
    // corner[2][0]=centerx*widthpic/(10*widthchange),
    // corner[2][1]=centery*heightpic/(10*heightchange),
    corner[2][0]=Math.round(centerx*widthpic/(widthchange)),
    corner[2][1]=Math.round(centery*heightpic/(heightchange)),
    this.setData({
      corner: corner
    })
} else {
wx.showToast({
  title: '超出范围',
  icon:'error',
  duration:1000
})
}
console.log('按钮位置',corner[2][0],corner[2][1])

},
btn_Suspension_click4:function(){

  var centerx,centery,corner,widthpic,heightpic,widthchange,heightchange
  widthpic=this.data.widthpic
  heightpic=this.data.heightpic
  widthchange=this.data.widthchange
  heightchange=this.data.heightchange
  centerx=this.data.buttonLeft4+10-this.data.picx0
  centery=this.data.buttonTop4+10-this.data.picy0
  corner=this.data.corner 

  if(centerx>=0 & centery >=0 & centerx<=widthchange & centery<= heightchange) {
    //这里是点击购物车之后将要执行的操作
    wx.showToast({
      title: '位置确认成功',
      icon:'success',
      duration:1000
    })
    // corner[3][0]=centerx,
    // corner[3][1]=centery,
    // corner[3][0]=centerx*widthpic/(10*widthchange),
    // corner[3][1]=centery*heightpic/(10*heightchange)
    corner[3][0]=Math.round(centerx*widthpic/(widthchange)),
    corner[3][1]=Math.round(centery*heightpic/(heightchange))
    this.setData({
      corner: corner
    })
} else {
wx.showToast({
  title: '超出范围',
  icon:'error',
  duration:1000
})
}
console.log('按钮位置',corner[3][0],corner[3][1])

},
//以下是按钮拖动事件
buttonStart: function (e) {
  startPoint = e.touches[0]//获取拖动开始点
},
buttonMove1: function (e) {
  var endPoint = e.touches[e.touches.length - 1]//获取拖动结束点
  //计算在X轴上拖动的距离和在Y轴上拖动的距离
  var translateX = endPoint.clientX - startPoint.clientX
  var translateY = endPoint.clientY - startPoint.clientY
  startPoint = endPoint//重置开始位置
  var buttonTop1 = this.data.buttonTop1 + translateY
  var buttonLeft1 = this.data.buttonLeft1 + translateX
  //判断是移动否超出屏幕
  if (buttonLeft1+10 >= this.data.windowWidth){
    buttonLeft1 = this.data.windowWidth-10;
  }
  if (buttonLeft1<=-10){
    buttonLeft1=-10;
  }
  if (buttonTop1<=0){
    buttonTop1=0
  }
  if (buttonTop1 + 10 >= this.data.windowHeight){
    buttonTop1 = this.data.windowHeight-10;
  }
  this.setData({
    buttonTop1: buttonTop1,
    buttonLeft1: buttonLeft1
  })
},
buttonMove2: function (e) {
  var endPoint = e.touches[e.touches.length - 1]//获取拖动结束点
  //计算在X轴上拖动的距离和在Y轴上拖动的距离
  var translateX = endPoint.clientX - startPoint.clientX
  var translateY = endPoint.clientY - startPoint.clientY
  startPoint = endPoint//重置开始位置
  var buttonTop2 = this.data.buttonTop2 + translateY
  var buttonLeft2 = this.data.buttonLeft2 + translateX
  //判断是移动否超出屏幕
  if (buttonLeft2+10 >= this.data.windowWidth){
    buttonLeft2 = this.data.windowWidth-10;
  }
  if (buttonLeft2<=-10){
    buttonLeft2=-10;
  }
  if (buttonTop2<=0){
    buttonTop2=0
  }
  if (buttonTop2 + 10 >= this.data.windowHeight){
    buttonTop2 = this.data.windowHeight-10;
  }
  this.setData({
    buttonTop2: buttonTop2,
    buttonLeft2: buttonLeft2
  })
},
buttonMove3: function (e) {
  var endPoint = e.touches[e.touches.length - 1]//获取拖动结束点
  //计算在X轴上拖动的距离和在Y轴上拖动的距离
  var translateX = endPoint.clientX - startPoint.clientX
  var translateY = endPoint.clientY - startPoint.clientY
  startPoint = endPoint//重置开始位置
  var buttonTop3 = this.data.buttonTop3 + translateY
  var buttonLeft3 = this.data.buttonLeft3 + translateX
  //判断是移动否超出屏幕
  if (buttonLeft3+10 >= this.data.windowWidth){
    buttonLeft3 = this.data.windowWidth-10;
  }
  if (buttonLeft3<=-10){
    buttonLeft3=-10;
  }
  if (buttonTop3<=0){
    buttonTop3=0
  }
  if (buttonTop3 + 10 >= this.data.windowHeight){
    buttonTop3 = this.data.windowHeight-10;
  }
  this.setData({
    buttonTop3: buttonTop3,
    buttonLeft3: buttonLeft3
  })
},
buttonMove4: function (e) {
  var endPoint = e.touches[e.touches.length - 1]//获取拖动结束点
  //计算在X轴上拖动的距离和在Y轴上拖动的距离
  var translateX = endPoint.clientX - startPoint.clientX
  var translateY = endPoint.clientY - startPoint.clientY
  startPoint = endPoint//重置开始位置
  var buttonTop4 = this.data.buttonTop4 + translateY
  var buttonLeft4 = this.data.buttonLeft4 + translateX
  //判断是移动否超出屏幕
  if (buttonLeft4+10 >= this.data.windowWidth){
    buttonLeft4 = this.data.windowWidth-10;
  }
  if (buttonLeft4<=-10){
    buttonLeft4=-10;
  }
  if (buttonTop4<=0){
    buttonTop4=0
  }
  if (buttonTop4 + 10 >= this.data.windowHeight){
    buttonTop4 = this.data.windowHeight-10;
  }
  this.setData({
    buttonTop4: buttonTop4,
    buttonLeft4: buttonLeft4
  })
},

buttonEnd: function (e) {
},

getpicwh(e){
  console.log('获取宽高',e.detail)
  var widthpic=e.detail.width
  var heightpic=e.detail.height
  var widthchange, heightchange,x0,y0

  if (widthpic > heightpic) {
    widthchange=414
    heightchange=414*heightpic/widthpic
  } else {
    heightchange=331
    widthchange=331*widthpic/heightpic
  }

  x0=(414-widthchange)/2
  y0=(331-heightchange)/2+71

  this.setData({
    widthpic:widthpic,
    heightpic:heightpic,
    widthchange:widthchange,
    heightchange:heightchange,
    picx0:x0,
    picy0:y0,
  })
},

clickflag(e){
  var _this = this
  var flag = e.currentTarget.dataset.name;
   console.log("选择的功能",flag);
   if(flag == '1'){
     var parOrigin = 2
   }
   if(flag == '2'){
    var parOrigin = 5
  }
  if(flag == '4'){
    var parOrigin = 2
  }
  if(flag == '5'){
    var parOrigin = 11
  }
  if(flag == '6'){
    var parOrigin = 0.2
  }
   
   if(flag=='7'){
      var that =this;
      that.setData({
        srcProcess:that.data.srcOrigin,
        corner:[[0,0],[0,0],[0,0],[0,0]],
        bool:'0'
      })
      wx.getSystemInfo({
        success: function (res) {
          console.log(res);
          // 屏幕宽度、高度
          console.log('height=' + res.windowHeight);
          console.log('width=' + res.windowWidth);
          // 高度,宽度 单位为px
          that.setData({
            windowHeight:  res.windowHeight,
            windowWidth:  res.windowWidth,
            buttonTop1:res.windowHeight*0.88,//这里定义按钮的初始位置
            buttonLeft1:res.windowWidth*0.70,//这里定义按钮的初始位置
            buttonTop2:res.windowHeight*0.88,//这里定义按钮的初始位置
            buttonLeft2:res.windowWidth*0.80,//这里定义按钮的初始位置
            buttonTop3:res.windowHeight*0.93,//这里定义按钮的初始位置
            buttonLeft3:res.windowWidth*0.80,//这里定义按钮的初始位置
            buttonTop4:res.windowHeight*0.93,//这里定义按钮的初始位置
            buttonLeft4:res.windowWidth*0.70,//这里定义按钮的初始位置
          })
        } 
    })
  } 
  if(flag == '8'){
    var parOrigin = 2
  }   
  if(flag == '9'){
    var parOrigin = 2
  }    
  _this.setData({
    flag:flag,
    par:parOrigin,

   })
},

   gotoShow: function(){
     var _this = this
    wx.chooseImage({
     count: 1, // 最多可以选择的图片张数，默认9
     sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
     sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
     success: function(res){
     // success
     console.log('路径',res.tempFilePaths)
     _this.setData({
      srcOrigin:res.tempFilePaths[0],
      srcProcess:res.tempFilePaths[0],
      bool:'0',
      corner:[[0,0],[0,0],[0,0],[0,0]]
     })
     wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        // 屏幕宽度、高度
        console.log('height=' + res.windowHeight);
        console.log('width=' + res.windowWidth);
        // 高度,宽度 单位为px
        _this.setData({
          windowHeight:  res.windowHeight,
          windowWidth:  res.windowWidth,
          buttonTop1:res.windowHeight*0.88,//这里定义按钮的初始位置
          buttonLeft1:res.windowWidth*0.70,//这里定义按钮的初始位置
          buttonTop2:res.windowHeight*0.88,//这里定义按钮的初始位置
          buttonLeft2:res.windowWidth*0.80,//这里定义按钮的初始位置
          buttonTop3:res.windowHeight*0.93,//这里定义按钮的初始位置
          buttonLeft3:res.windowWidth*0.80,//这里定义按钮的初始位置
          buttonTop4:res.windowHeight*0.93,//这里定义按钮的初始位置
          buttonLeft4:res.windowWidth*0.70,//这里定义按钮的初始位置
        })
      } 
  })
     },
     fail: function() {
     // fail
     },
     complete: function() {
     // complete
     }
    })
    
   },

  NavChange(e) {
    this.setData({
      PageCur: e.currentTarget.dataset.cur
    })
  },
  onShareAppMessage() {
    return {
      title: 'ColorUI-高颜值的小程序UI组件库',
      imageUrl: '/images/share.jpg',
      path: '/pages/index/index'
    }
  },
  sliderchange: function(event){
    var _this = this
    var par=event.detail.value
  
    console.log('参数修改为',par)
   _this.setData({
     par:par
   })
   },




// 图像处理部分（服务器）
  processImg:function(){
    var _this = this
    // 服务器部分
   if(_this.data.srcOrigin == '../../images/zanCode.jpg'){ 
    wx.showToast({
      title: '请选择图片',
      icon: 'none',
    })
  }else{
    // _this.setData({
    //   srcProcess:_this.data.srcOrigin
    //  })
    wx.showLoading({
      title: '处理图片中...',
    })
    console.log('Ffffffffff'+_this.data.srcProcess)
    console.log(_this.data.corner)
    wx.uploadFile({
      // 改下地址！！！！！
      url: 'https://experimentforzcl.cn:7500',
      filePath: _this.data.srcOrigin,
      name: 'file',
      // 传送功能标志、参数值
      formData:{
        'flag': _this.data.flag,
        'par': Number(_this.data.par),
        'bool':_this.data.bool,
        'corner1':Number(_this.data.corner[0][0]),
        'corner2':Number(_this.data.corner[0][1]),
        'corner3':Number(_this.data.corner[1][0]),
        'corner3':Number(_this.data.corner[1][0]),
        'corner4':Number(_this.data.corner[1][1]),
        'corner5':Number(_this.data.corner[2][0]),
        'corner6':Number(_this.data.corner[2][1]),
        'corner7':Number(_this.data.corner[3][0]),
        'corner8':Number(_this.data.corner[3][1])
        },
      
      success (res){
        console.log('000')    
        wx.hideLoading()
        _this.setData({
          // 转换图像格式
          srcProcess: "data:image/png;base64," + res.data,
          bool:'1',
          corner:[[0,0],[0,0],[0,0],[0,0]]
        })
          console.log(_this.data.srcProcess)

        console.log('SSSSSSSSSSS'+ _this.data.srcProcess)
        wx.hideLoading(),
        wx.showToast({
          title: '处理成功',//提示文字
          duration:1000,//显示时长
          icon:'success', //图标，支持"success"、"loading" 
        })
      },
      fail(res){
        console.log('111')
        wx.hideLoading(),
        wx.showToast({
          title: '处理失败',//提示文字
          duration:1000,//显示时长
          icon:'error', //图标
        })
      }
    })
  }
  
  },

    // 长按保存功能
   // 长按保存功能
   saveImage (e) {
    console.log('000',e)
    // var bool =this.data.bool,
    if(this.data.bool=='1'){
    base64src(e.currentTarget.dataset.url, res => {
      // console.log('zhuan',res) // 返回图片地址，直接赋值到image标签即可
      var url = res
      console.log('urlsave',url)
      const { saveImage1, saveImage2, saveImage3, saveImage4 } = this
      saveImage1(url).then(saveImage2).then(saveImage3).then(saveImage4)
    });
  }else{
    var url = e.currentTarget.dataset.url
    const { saveImage1, saveImage2, saveImage3, saveImage4 } = this
      saveImage1(url).then(saveImage2).then(saveImage3).then(saveImage4)
  }
  },
    // 吊起 actionsheet
    saveImage1 (url) {
      const p1 = new Promise((resolve, reject) => {
        wx.showActionSheet({
          itemList: ['保存到相册'],
          success: res => {
            resolve(url)
          },
          fail: err => {
            reject(err)
          }
        })
      })
      return p1
    },
    // 授权
    saveImage2 (url) {
      const p2 = new Promise((resolve, reject) => {
        wx.getSetting({
          success: settings => {
            if (!settings.authSetting['scope.writePhotosAlbum']) {
              wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success: () => {
                    // 同意授权
                    resolve(url)
                },
                fail: () => {
                    wx.showModal({
                        title: '保存失败',
                        content: '请开启访问手机相册权限',
                        success: () => {
                          wx.openSetting()
                        }
                    })
                    reject()
                }
              })
            } else {
              // 已经有权限了
              resolve(url)
            }
          }
        })
      })
      return p2
    },
    // 转换图片格式为本地路径
    saveImage3 (url) {
      const p3 = new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: url,
          success: res => {
            resolve(res.path)
          },
          fail: () => {
            reject()
          }
        })
      })
      return p3
    },
    // 保存
    saveImage4 (path) {
      const p4 = new Promise((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success: () => {
              wx.showToast({
                 title: '已保存到相册',
              })
          },
          fail: err => {
            console.log(err)
          }
        })
      })
      return p4
    },

    fuyuan(){
      var that =this;
      that.setData({
        srcProcess:that.data.srcOrigin,
        corner:[[0,0],[0,0],[0,0],[0,0]],
        bool:'0'
      })
      wx.getSystemInfo({
        success: function (res) {
          console.log(res);
          // 屏幕宽度、高度
          console.log('height=' + res.windowHeight);
          console.log('width=' + res.windowWidth);
          // 高度,宽度 单位为px
          that.setData({
            windowHeight:  res.windowHeight,
            windowWidth:  res.windowWidth,
            buttonTop1:res.windowHeight*0.88,//这里定义按钮的初始位置
            buttonLeft1:res.windowWidth*0.70,//这里定义按钮的初始位置
            buttonTop2:res.windowHeight*0.88,//这里定义按钮的初始位置
            buttonLeft2:res.windowWidth*0.80,//这里定义按钮的初始位置
            buttonTop3:res.windowHeight*0.93,//这里定义按钮的初始位置
            buttonLeft3:res.windowWidth*0.80,//这里定义按钮的初始位置
            buttonTop4:res.windowHeight*0.93,//这里定义按钮的初始位置
            buttonLeft4:res.windowWidth*0.70,//这里定义按钮的初始位置
          })
        } 
    })
  } 
})