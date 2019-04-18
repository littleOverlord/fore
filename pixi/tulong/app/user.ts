/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Widget from '../libs/ni/widget';
import CfgMgr from '../libs/ni/cfgmrg';
import DB from '../libs/ni/db';
import Connect from '../libs/ni/connect';
import Music from '../libs/ni/music';
import Hash from "../libs/ni/sha512";

/****************** 导出 ******************/
export default class User{
    /**
     * @description 平台名 "_default"没有任何平台 "wx"微信小游戏
     */
    static pt = "default"
    /**
     * @description 平台用户信息
     */
    static info
    /**
     * @description wx 登录code
     */
    static code
    /**
     * @description 初始化平台授权，不是平台直接走默认登录
     * @param callback 
     */
    static init(callback){
        for(let k in ptFrom){
            if(ptFrom[k](callback)){
                break;
            }
        }
        setTimeout(callback,0);
        console.log("open user");
        Scene.open("app-ui-user",Scene.root);
    }
    /**
     * @description 登录
     */
    static login(callback){
        User[`login_${User.pt}`](callback);
    }
    /**
     * @description 微信登录
     */
    static login_wx(callback){
        
        if(User.info == undefined || !User.code){
            return;
        }
        Connect.request({type:"app/wx@login",arg:{
            "code":User.code,
            "encrypted": encodeURIComponent(User.info.encryptedData),
            "iv":User.info.iv
        }},(data) => {
            if(data.err){
                return console.log(data.err.reson);
            }
            DB.data.user.uid = data.ok.uid;
            DB.data.user.from = "wx";
            User.info && (DB.data.user.info = User.info);
            callback();
        })
        
    }
    /**
     * @description 默认登录
     * @param callback 
     */
    static login_default(callback){
        console.log("default login aa");
    }
}

/****************** 本地 ******************/
/**
 * @description 平台授权初始化
 */
const ptFrom = {
    wx: (callback) => {
        let wx = (window as any).wx,
        createButton = () => {
            var button = wx.createUserInfoButton({type: 'text',text: '微信登录',style:{left: wx.getSystemInfoSync().windowWidth/2-70,bottom: wx.getSystemInfoSync().windowHeight/2,width: 140,height: 40,lineHeight: 40,backgroundColor: '#ff0000',color: '#ffffff',textAlign: 'center',fontSize: 16,borderRadius: 4}})
            button.onTap((res) =>{
                Music.play("audio/boom.mp3");
                if(res.errMsg=="getUserInfo:ok"){
                    console.log("授权用户信息")//获取到用户信息
                    User.info = res;
                    callback();
                    //清除微信授权按钮
                    button.destroy()
                }else{
                    console.log("授权失败")
                }
            })
        };
        if(!wx){
            return false;
        }
        User.pt = "wx";
        wx.login({
            success(res) {
              if (res.code) {
                User.code = res.code;
                createButton();
              } else {
                callback("login fail");
              }
            }
        })
        return true;
    }
}
/**
 * @description 用户组件
 */
class WUser extends Widget{
    login(){
        console.log(Hash);
        encryptPassword("tang2dan01234");
    }
}
/**
 * @description 计算哈希
 * @param s 
 * @param type 
 */
const caclHash = (s: string, type: string): string => {
    let sha512 = new Hash("SHA-512", "TEXT");
    sha512.update(s);
    return sha512.getHash(type);
}
/**
 * @description 合并字符串
 * @param s1 
 * @param s2 
 */
const blendStrig = (s1: string,s2: string): string =>{
    let s = "",len = Math.max(s1.length, s2.length);
    for(let i = 0; i < len; i++){
        s += `${s1[i]||""}${s2[i]||""}`;
    }
    return s;
}
/**
 * @description 密码加密
 * @param ps 
 */
const encryptPassword = (ps: string): string => {
    let b64 = caclHash(ps,"B64"),
        hex = caclHash(ps,"HEX");
    ps = caclHash(blendStrig(b64, hex),"B64");
    console.log(b64,hex,ps);
    return ps;
}
/****************** 立即执行 ******************/
//初始化关卡数据库表
DB.init("user",{uid:0,info:{},from:""});
//注册组件
Widget.registW("app-ui-user",WUser);