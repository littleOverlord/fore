/****************** 导入 ******************/
import Fs from '../ni/fs';
import DB from '../ni/db';
import Scene from '../ni/scene';
import Music from '../ni/music';
import Connect from '../ni/connect';
import Emitter from '../ni/emitter';

/****************** 导出 ******************/
const login_wx = () => {
        
    if(userInfo == undefined || !code){
        return;
    }
    Connect.request({type:"app/wx@login",arg:{
        "code":code,
        "encrypted": userInfo.encryptedData,
        "gamename": Fs.appName,
        "iv":userInfo.iv
    }},(data) => {
        if(data.err){
            return console.log(data.err.reson);
        }
        DB.data.user.uid = data.ok.uid;
        DB.data.user.from = "wx";
        DB.data.user.name = data.ok.name;
        DB.data.user.head = data.ok.head;
        DB.data.user.username = data.ok.username;
        DB.data.user.isnew = data.ok.regist;
        userInfo && (DB.data.user.info = userInfo);
        successBack("wx");
    })
    
}


/****************** 本地 ******************/
let userInfo:any,
    code,
    wxButton,
    successBack,
    failBack;
/**
 * @description 平台授权初始化
 */
const wxLogin = () => {
    let wx = (window as any).wx,
    createButton = () => {
        if(wxButton){
            wxButton.destroy();
        }
        var scale = Scene.screen.scale, w = Math.floor(386/scale), h = Math.floor(140/scale);
        wxButton = wx.createUserInfoButton({type: 'image',image:"images/btn.png",style:{left: wx.getSystemInfoSync().windowWidth/2-w/2,bottom: 200/scale,width: w,height: h}})
        wxButton.onTap((res) =>{
            Music.play("audio/butn.mp3");
            if(res.errMsg=="getUserInfo:ok"){
                userInfo = res;
                //清除微信授权按钮
                wxButton.destroy();
                wxButton = null;
                login_wx();
            }else{
                console.log("wx authorize fail");
                failBack();
            }
        })
    };
    wx.login({
        success(res) {
            // console.log("wx.login",res);
            if (res.code) {
            code = res.code;
            createButton();
            } else {
            console.log("wx login fail");
            }
        }
    })
}

const connectClose = () => {
    if(wxButton){
        wxButton.destroy();
        wxButton = null;
    }
}
/****************** 立即执行 ******************/
Emitter.global.add("ptfromUser",(param)=>{
    successBack = param.success;
    failBack = param.fail;
    wxLogin();
    return true;
})
//通讯事件监听
Connect.notify.add("close",connectClose);
