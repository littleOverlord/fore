/**
 * @description 微信分享
 * 所有分享走相同的流程，通过事件分发机制传递分享数据
 */
/****************** 导入 ******************/
import { AppEmitter } from "../../app/appEmitter";
import DB from "../ni/db";

/****************** 导出 ******************/

/****************** 本地 ******************/
declare const wx;
declare const canvas;

const launchOptions = wx.getLaunchOptionsSync();

const createShareInfo = () => {
    return {
        title: `引力对决，我得到了${DB.data.score.phase}分，等你来挑战`,
        query:`uid=${DB.data.uid}`,
        imageUrl: canvas.toTempFilePathSync({
          destWidth: 500,
          destHeight: 400
        })
      }
}

const getShareInfo = () => {
    let a = wx.showShareMenu({
        withShareTicket: true,
        success: ()=> {

        },
        fail: ()=>{

        },
        complete: ()=>{

        }
    })
    console.log(a);
    // wx.getShareInfo({
    //     shareTicket:a
    // })
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

wx.onShareAppMessage(() => {
    getShareInfo();
    return createShareInfo()
})  

wx.onShow((res)=>{
    console.log("show::",res);
})
//初始化

AppEmitter.add("intoMain",()=>{
    console.log(launchOptions);
})
AppEmitter.add("share",()=>{
    getShareInfo();
})