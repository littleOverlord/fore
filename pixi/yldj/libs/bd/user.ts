/****************** 导入 ******************/
import Fs from '../ni/fs';
import DB from '../ni/db';
import Scene from '../ni/scene';
import Music from '../ni/music';
import Connect from '../ni/connect';
import Emitter from '../ni/emitter';

/****************** 导出 ******************/
const login_swan = () => {
        
    if(userInfo == undefined || !code){
        return;
    }
    Connect.request({type:"app/bd@login",arg:{
        "code":code,
        "encrypted": userInfo.data,
        "gamename": Fs.appName,
        "iv":userInfo.iv
    }},(data) => {
        if(data.err){
            return console.log(data.err.reson);
        }
        DB.data.user.uid = data.ok.uid;
        DB.data.user.from = "baidu";
        DB.data.user.name = data.ok.name;
        DB.data.user.head = data.ok.head;
        DB.data.user.username = data.ok.username;
        DB.data.user.isnew = data.ok.regist;
        userInfo && (DB.data.user.info = userInfo);
        successBack("baidu");
    })
    
}


/****************** 本地 ******************/
let userInfo:any,
    code,
    swanButton,
    successBack,
    failBack;
/**
 * @description 平台授权初始化
 */
const swanLogin = () => {
    let swan = (window as any).swan,
    createButton = () => {
        if(swanButton){
            swanButton.destroy();
        }
        var scale = Scene.screen.scale, w = Math.floor(386/scale), h = Math.floor(140/scale);
        swanButton = swan.createUserInfoButton({type: 'image',image:"images/btn.png",style:{left: swan.getSystemInfoSync().windowWidth/2-w/2,top: swan.getSystemInfoSync().windowHeight - h - 200/scale,width: w,height: h}})
        swanButton.onTap((res) =>{
            Music.play("audio/butn.mp3");
            if(res.errMsg=="getUserInfo:ok"){
                userInfo = res;
                //清除微信授权按钮
                swanButton.destroy();
                swanButton = null;
                login_swan();
            }else{
                console.log("swan authorize fail");
                swanButton.destroy();
                swanButton = null;
                failBack();
            }
        })
    };
    createButton();
    swan.login({
        success:(res)=> {
            console.log("swan.login",res);
            if (res.code) {
            code = res.code;
            createButton();
            } else {
            console.log("swan login fail");
            }
        },
        fail:(err)=>{
            console.log(err)
        }
    })
}

const connectClose = () => {
    if(swanButton){
        swanButton.destroy();
        swanButton = null;
    }
}
/****************** 立即执行 ******************/
Emitter.global.add("ptfromUser",(param)=>{
    successBack = param.success;
    failBack = param.fail;
    swanLogin();
    return true;
})
//通讯事件监听
Connect.notify.add("close",connectClose);
