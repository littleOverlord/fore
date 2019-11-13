/**
 * @description 前台通讯模块，暂时以http作为通讯协议
 */
/****************** 导入 ******************/
import Http from "./http";
import Socket from "./websocket";
import Emitter from "./emitter";
import Widget from './widget';
import Scene from './scene';
import {Base64} from "./base64";
/****************** 导出 ******************/
enum Status{
    connecting = 0, // 连接中
    opened // 已经连接
}
/**
 * @description 前台通讯模块
 */
export default class Connect {
    /**
     * @description 测试接口，供前端测试使用
     */
    static testHandlers = {}
    /**
     * @description 通讯地址
     */
    static url = ""
    /**
     * @description 和后台唯一通讯标识
     */
    static sessionKey = ""
    /**
     * @description 通讯id
     */
    static mid = 1
    /**
     * @description 重连定时器
     */
    static reopenTimer = null
    /**
     * @description socket连接
     */
    static socket: Socket
    static openBack: Function
    /**
     * @description 通讯回调等待列表
     */
    static waitBack = {}
    /**
     * @description 后台消息推送监听
     * @param cfg 
     * @param callback 
     */
    static notify = new Emitter()
    /**
     * @description 服务器时间
     */
    static sTime = 0
    /**
     * @description 上次获取服务器时间的本地时间
     */
    static locTime = 0
    /**
     * @description ping服务器间隔时间
     */
    static ppSpace = 20 * 1000
    /**
     * @description ping服务器超时时间
     */
    static ppTimeout = 3 * Connect.ppSpace
    /**
     * @description ping服务器定时器
     */
    static ppTimer = 0
    /**
     * @description 连接状态
     */
    static status = Status.connecting
    /**
     * @description 打开链接
     */
    static open(cfg,callback){
        Connect.url = cfg.ws;
        Connect.openBack = callback;
        Connect.socket = new Socket(Connect.url,Connect.listener);
        Scene.open("app-ui-connect",Scene.root);
    }
    /**
     * @description 向后台发送请求
     * @param param {type:"",arg:{},mid:1}
     * @param callback 请求回调
     */
    static request(param: NetParam,callback: Function): void{
        if(Connect.runTest(param,callback)){
            return ;
        }
        param.mid = Connect.mid ++;
        Connect.waitBack[param.mid] = new Wait(param.mid,callback);
        Connect.socket.send(blendArg(param));
        // Http.request(blendArg(param),param.arg,(err,data)=>{
        //     if(err){
        //         callback({err});
        //     }else{
        //         d = JSON.parse(data);
        //         if(d[""]){
        //             Connect.sessionKey = d[""];
        //         }
        //         callback(d);
        //     }
            
        // })
    }
    /**
     * @description 向后台发送消息
     * @param param {type:"",arg:{}}
     */
    static send(param: NetParam){
        Connect.socket.send(blendArg(param));
    }
    /**
     * @description 添加模拟后台数据接口
     * @param type ""
     * @param handler 
     */
    static setTest(type: string,handler: Function): void{
        Connect.testHandlers[type] = handler;
    }
    /**
     * @description 跑测试接口，如果没有，则往服务器发送
     */
    static runTest(param: NetParam,callback: Function): boolean{
        if(Connect.testHandlers[param.type]){
            setTimeout(((func,arg,back) => {
                return ()=>{
                    func(arg,back);
                }
            })(Connect.testHandlers[param.type],param.arg,callback), 0);
            
        }else{
            return false;
        }
        return true;
    }
    /**
     * @description 监听websocket
     * @param type open || message || close || error
     * @param event 
     */
    static listener(type,event){
        switch (type){
            case "open":
                if(event){
                    return reopen();
                }
                Connect.status = Status.opened;
                WConnect.update();
                ping();
                Connect.openBack();
                console.log("websocket opened!");
                break;
            case "message":
                let msg = JSON.parse(event.data);
                matchHandler(msg);
                break;
            case "close":
                console.error(event);
                Connect.status = Status.connecting;
                WConnect.update();
                clearPing();
                reopen();
                Connect.notify.emit("close");
                console.log("websocket closed!");
                break;
        }
    }
};
/****************** 本地 ******************/
//通讯接口参数
interface NetParam {
    type: string
    arg: any
    mid?: number
}

class Wait{
    constructor(mid,callback){
        this.mid = mid;
        this.handler = callback;
        this.timmer = setTimeout(() => {
            callback({err:"time out"});
            delete Connect.waitBack[mid];
        }, this.timeout);
    }
    timeout = 30*1000
    mid
    handler
    timmer
    clear(){
        clearTimeout(this.timmer);
    }
}
/**
 * @description 用户组件
 */
class WConnect extends Widget{
    added(node){
        WConnect.node = node;
        node.children[0].ni.left = -node.children[0].width/2;
        node.children[0].ni.top = -node.children[0].height/2;
        if(Connect.status == Status.connecting){
            node.alpha = 1;
        }
    }
    static node = null
    static update(){
        if(Connect.status == Status.connecting){
            WConnect.node.alpha = 1;
        }else{
            WConnect.node.alpha = 0;
        }
    }
}
/**
 * @description 打包即将发送到后台的消息
 * @param param 
 */
const blendArg = (param: NetParam): string => {
    let str = `{"type":"${param.type}","mid":${param.mid},"arg":"${Base64.encode(JSON.stringify(param.arg))}"}`;
    // let str = "",dir = param.type.split("@");
    // str = `${Connect.url}/${dir[0]}?${dir[1]?"@="+dir[1]:""}`;
    return str;
}
/**
 * @description 分发服务器发送的消息
 * @param msg 
 */
const matchHandler = (msg) => {
    Connect.locTime = Date.now();
    let mid = msg.mid,w;
    if(mid == 0){
        return Connect.notify.emit(msg.type,msg);
    }
    w = Connect.waitBack[mid];
    delete Connect.waitBack[mid];
    if(!w){
        return console.error("invalid message which mid is ", mid);
    }
    // console.log(msg);
    w.handler(msg.data);
    w.clear();
}
/**
 * @description 重连
 */
const reopen = ()  => {
    if(Connect.reopenTimer){
        return;
    }
    Connect.reopenTimer = setTimeout(()=>{
        Connect.socket.reopen();
        Connect.reopenTimer = null;
    },10000)
}
/**
 * @description ping服务器
 */
const ping = () => {
    Connect.ppTimer = setTimeout(() => {
        Connect.request({type:"app/client@stime",arg:{}},(msg)=>{
            if(msg.err){
                if(Date.now() - Connect.locTime > Connect.ppTimeout){
                    Connect.ppTimer = null;
                    Connect.socket.close(-69,"time out");
                    return;
                }
            }else{
                Connect.locTime = Date.now();
                Connect.sTime = msg.ok.sTime;
            }
            ping();
        })
    }, Connect.ppSpace);
}
/**
 * @description 清除ping定时器
 */
const clearPing = () => {
    if(!Connect.ppTimer){
        return;
    }
    clearTimeout(Connect.ppTimer);
    Connect.ppTimer = null;
}
// ================================== 立即执行
Widget.registW("app-ui-connect",WConnect);