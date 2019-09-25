/**
 * @description 微信分享
 * 所有分享走相同的流程，通过事件分发机制传递分享数据
 */
/****************** 导入 ******************/

import Emitter from "../ni/emitter";;
import DB from "../ni/db";


/****************** 导出 ******************/

/****************** 本地 ******************/
declare const wx;
declare const canvas;

/**
 * @description 微信api调用状态
 */
const status = {
    /**
     * @description 分享状态
     * 0 没有分享
     * 1 正在分享
     */
    share: 0,
    /**
     * @description 手机震动状态
     * 0 没有震动
     * 1 震动结束
     */
    vibrate: 0
}

const launchOptions = wx.getLaunchOptionsSync();

const createShareInfo = () => {
    let wxinfo = wx.getSystemInfoSync();
    return {
        title: `引力对决，我得到了${DB.data.score.phase}分，等你来挑战`,
        query:`uid=${DB.data.uid}`,
        imageUrl: canvas.toTempFilePathSync({
          destWidth: wxinfo.windowWidth,
          destHeight: wxinfo.windowHeight
        })
      }
}

/****************** 立即执行 ******************/
wx.showShareMenu({
    withShareTicket: true,
    success: ()=> {
        console.log("open share success!")
    },
    fail: ()=>{
        console.log("open share fail!")
    },
    complete: ()=>{
        console.log("open share complete!")
    }
})
/**
 * @description 被动分享监听
 */
wx.onShareAppMessage(() => {
    status.share = 1;
    return createShareInfo();
})  

wx.onShow((res)=>{
    console.log("show::",res);
    Emitter.global.emit("show");
    /**
     * @description 分享成功
     */
    if(status.share == 1){
        Emitter.global.emit("shareComplete");
        status.share = 0;
    }
})
wx.onHide((res)=>{
    console.log("show::",res);
    Emitter.global.emit("hide");
})
//初始化
// Emitter.global.add("intoMain",()=>{
//     console.log(launchOptions);
// })

//========= 外部接口 ========\\

/**
 * @description 主动分享
 */
Emitter.global.add("share",()=>{
    status.share = 1;
    wx.shareAppMessage(createShareInfo());
})

/**
 * @description 手机震动
 */
Emitter.global.add("vibrate",()=>{
    status.vibrate = 1;
    // let t = Date.now();
    wx.vibrateShort({
        success:()=>{
            // console.log(`vibrate time = ${Date.now() - t}`);
        },
        fail:()=>{},
        complete:()=>{
            // console.log(`vibrate time = ${Date.now() - t}`);
        }
    })
})

