/**
 * @description 微信分享
 * 所有分享走相同的流程，通过事件分发机制传递分享数据
 */
/****************** 导入 ******************/

import Emitter from "../ni/emitter";;
import DB from "../ni/db";


/****************** 导出 ******************/

/****************** 本地 ******************/
declare const swan;
declare const canvas;

let shareInfo = { //分享详情
    title:"",
    query:"",
    callback:()=>{

    }
}; 
let RewardedVideoAd,// 激励广告组件
    BannerAd, //banner广告组件
    SDKVersion: number;

const sys = swan.getSystemInfoSync();
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

const launchOptions = swan.getLaunchOptionsSync();

const createShareInfo = () => {
    let swaninfo = swan.getSystemInfoSync();
    return {
        title: shareInfo.title,
        query: shareInfo.query,
        imageUrl: canvas.toTempFilePathSync({
          destWidth: swaninfo.windowWidth,
          destHeight: swaninfo.windowHeight
        })
      }
}
const caclVersion = () => {
    let arr = sys.SDKVersion.split();
    for(let i = 0, len = arr.length;i < len; i++){
        if(arr[i].length == 1){
            arr[i] += "0";
        }
    }
    SDKVersion = parseInt(arr.join(""),10);
}
/**
 * @description 创建激励广告
 * @callback (errcode) 0: 广告有效 1: 基础库太低，无法加载激励广告 2: 无效观看 3: 微信api调用错误
 */
const createRewardedVideoAd = (id,callback) => {
    if(SDKVersion < 200040){
        callback(1);
    }
    let RewardedVideoAd = swan.createRewardedVideoAd({
        adUnitId:id
    }),destroy = ()=>{
        RewardedVideoAd.destroy(); 
        RewardedVideoAd = undefined;
    }
    RewardedVideoAd.load();
    RewardedVideoAd.show();
    RewardedVideoAd.onError((err)=>{
        console.log(err);
        destroy();
        callback(3); 
    });
    RewardedVideoAd.onClose((res)=>{
        // 用户点击了【关闭广告】按钮
        // 小于 2.1.0 的基础库版本，res 是一个 undefined
        destroy();
        if (res && res.isEnded || res === undefined) {
            callback(0);
        } else {
            callback(2);
        }
    });
}
/**
 * @description 创建banner广告
 * @callback (banner) banner组件实例，用于销毁组件(banner.destroy())
 */
const createBannerAd = (id,callback) => {
    if(SDKVersion < 200040){
        callback();
    }
    let BannerAd = swan.createBannerAd({
        adUnitId:id,
        adIntervals: 30,
        style:{
            width: sys.windowWidth,
            left:0
        }
    });
    BannerAd.onResize((res)=>{
        BannerAd.style.top = sys.windowHeight - res.height;
    })
    callback(BannerAd);
}
/****************** 立即执行 ******************/
caclVersion();
swan.showShareMenu({
    withShareTicket: true,
    success: ()=> {
        // console.log("open share success!")
    },
    fail: ()=>{
        // console.log("open share fail!")
    },
    complete: ()=>{
        // console.log("open share complete!")
    }
})
/**
 * @description 被动分享监听
 */
swan.onShareAppMessage(() => {
    status.share = 1;
    return createShareInfo();
})  

swan.onShow((res)=>{
    // console.log("show::",res);
    Emitter.global.emit("show");
    /**
     * @description 分享成功
     */
    if(status.share == 1){
        shareInfo.callback && shareInfo.callback();
        shareInfo.callback = null;
        status.share = 0;
    }
})
swan.onHide((res)=>{
    // console.log("show::",res);
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
Emitter.global.add("share",(arg)=>{
    status.share = 1;
    swan.shareAppMessage(createShareInfo());
})
/**
 * @description 设置分享信息
 */
Emitter.global.add("setShareInfo",(arg)=>{
    shareInfo = arg;
})
/**
 * @description 手机震动
 */
Emitter.global.add("vibrate",()=>{
    status.vibrate = 1;
    // let t = Date.now();
    swan.vibrateShort({
        success:()=>{
            // console.log(`vibrate time = ${Date.now() - t}`);
        },
        fail:()=>{},
        complete:()=>{
            // console.log(`vibrate time = ${Date.now() - t}`);
        }
    })
})

/**
 * @description 打开激励广告
 * @param arg {
 *      id: ADVID, //广告id
        callback
 * }
 */
Emitter.global.add("advRewarded",(arg)=>{
    createRewardedVideoAd(arg.id,arg.callback);
})
/**
 * @description 打开banner广告
 * @callback (banner) banner组件实例，用于销毁组件(banner.destroy())
 */
Emitter.global.add("advBanner",(arg)=>{
    createBannerAd(arg.id,arg.callback);
})