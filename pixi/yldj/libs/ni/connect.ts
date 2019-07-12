/**
 * @description 前台通讯模块，暂时以http作为通讯协议
 */
/****************** 导入 ******************/
import Http from "./http";
import Socket from "./websocket";
import Emitter from "./emitter";
/****************** 导出 ******************/
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
     * @description 打开链接
     */
    static open(cfg,callback){
        Connect.url = cfg.ws;
        Connect.openBack = callback;
        Connect.socket = new Socket(Connect.url,Connect.listener);
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
        Connect.waitBack[param.mid] = callback;
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
                Connect.openBack();
                console.log("websocket opened!");
                break;
            case "message":
                let msg = JSON.parse(event.data);
                matchHandler(msg);
                break;
            case "close":
                console.error(event);
                reopen();
                break;
        }
    }
};
/****************** 本地 ******************/
//通讯接口参数
interface NetParam {
    type: string
    arg: any
    mid: number
}
const blendArg = (param: NetParam): string => {
    // let str = `{"type":"${param.type}","mid":${param.mid},"data":"${JSON.stringify(param.arg).replace(/\{/g,"_(").replace(/\}/g,")_")}"}`;
    // let str = "",dir = param.type.split("@");
    // str = `${Connect.url}/${dir[0]}?${dir[1]?"@="+dir[1]:""}`;
    return JSON.stringify(param);
}
const matchHandler = (msg) => {
    let mid = msg.mid,handler;
    if(mid == 0){
        return Connect.notify.emit(msg.type,msg);
    }
    handler = Connect.waitBack[mid];
    if(!handler){
        return console.error("invalid message which mid is ", mid);
    }
    console.log(msg);
    handler(msg.data);
}
const reopen = ()  => {
    if(Connect.reopenTimer){
        return;
    }
    Connect.reopenTimer = setTimeout(()=>{
        Connect.socket.reopen();
        Connect.reopenTimer = null;
    },10000)
}