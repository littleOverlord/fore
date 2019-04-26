/**
 * @description 事件处理模块
 * 事件顺序：widget -> logic -> parent widget -> parent logic -> ... -> root
 *  支持事件 
 *  tap 单击 不会触发end事件
 *  longtap 长按 结束后会紧跟end事件
 *  drag 拖动 结束后会紧跟end事件
 *  end 结束
 */
/****************** 导入 ******************/
import Util from "./util";

/****************** 导出 ******************/
export enum HandlerResult {
    BREAK_OK = 0, // （默认）结束事件调用，不再继续往上冒
    OK // ok
}
export class Events {
    //支持的事件类型
    static eventsType = {
        start: "start",
        tap: "tap",
        longtap: "longtap",
        drag: "drag",
        end: "end"
    }
    // 正在触发的事件状态
    static status = {
        currTarget: null, // 当前触发事件的渲染对象
        event: null, // 事件对象 PIXI.interaction.InteractionEvent
        startPos: null, // 起始位置 {x:0,y:0}
        moving: null, // 
        eventType: null, // 触发的事件类型
        time: 0 // 触发时间点
    }
    //是否移动端
    static mobile: boolean
    //绑定函数
    static bindFunc: Function
    /**
     * @description 初始化设备数据
     */
    static init(){
        const ua = navigator.userAgent.toLowerCase() || "";
        Events.mobile = (ua.indexOf('mobile') > -1) ? true : false;
        Events.bindFunc = Events.mobile?bindMobile:bindPc;
    }
    /**
     * @description 事件监听循环,主要处理长按
     */
    static loop(){
        if(!Events.status.currTarget){
            return;
        }
        Events.longTap(Events.status.event);
    }
    /**
     * @description 在渲染节点上绑定事件
     * @param cfg {
     *  ...,
     *  "on":{"tap":{"func":"tab","arg":[1]}}
     *  ...
     * }
     */
    static bindEvent(o,cfg){
        if(!cfg.on){
            return;
        }
        o.interactive = true;
        o.ni.on = cfg.on;
        o.on(Events.mobile?"touchstart":"mousedown",Events.start);
    }
    /**
     * @description 绑定根节点事件
     * @param o
     */
    static bindGlobal(o){
        o.interactive = true;
        Events.bindFunc(o);
    }
    /**
     * @description 开始事件
     */
    static start(e){
        Events.status.currTarget = this;
        Events.status.startPos = {x:e.data.global.x,y:e.data.global.y};
        Events.status.time = Date.now();
        Events.status.event = e;
        e.start = Events.status.startPos;
        let {o,on,func,arg} = Events.findEvent(Events.eventsType.start);
        if(on){
            Events.responseEvent(o,e,arg,func,Events.eventsType.start);
        }
        e.stopPropagation();
        // console.log("start ",e,this);
    }
    /**
     * @description 移动事件
     */
    static move(e){
        // console.log("move this ",this);
        if(!Events.status.currTarget){
            return;
        }
        let {o,on,func,arg} = Events.findEvent(Events.eventsType.drag);
        
        if(!on || (Events.status.eventType != Events.eventsType.drag && !Events.ismove(e.data.global))){
            return;
        }
        Events.responseEvent(o,e,arg,func,Events.eventsType.drag);
    }
    /**
     * @description 结束事件
     */
    static end(e){
        if(!Events.status.currTarget){
            return Events.clear();
        }
        let {o,on,func,arg} = Events.tap(e);
        if(!on){
            return Events.clear();
        }
        Events.responseEvent(o,e,arg,func,Events.eventsType.end);
        Events.clear();
    }
    /**
     * @description 触发点击事件
     * @param e 
     */
    static tap(e){
        let {o,on,func,arg} = Events.findEvent(Events.eventsType.tap);
        if(on){
            Events.responseEvent(o,e,arg,func,Events.eventsType.tap);
        }else{
        // if(Events.status.eventType && Events.status.eventType != Events.eventsType.start){
            return Events.findEvent(Events.eventsType.end);
        }
        
        return {o:null,on:null,func:null,arg:null};
    }
    /**
     * @description 检查是否执行长按事件
     * @param e 
     */
    static longTap(e){
        let t = Date.now();
        if(Events.status.eventType || t - Events.status.time < 300 ){
            return;
        }
        let {o,on,func,arg} = Events.findEvent(Events.eventsType.longtap);
        if(!on){
            return;
        }
        Events.responseEvent(o,e,arg,func,Events.eventsType.longtap);
    }
    /**
     * @description 清除事件缓存
     */
    static clear(){
        for(let k in Events.status){
            Events.status[k] = null;
        }
    }
    /**
     * @description 判断是否可以触发移动事件
     * @param pos 新的触发点坐标
     */
    static ismove(pos){
        let dx = pos.x - Events.status.startPos.x,
            dy = pos.y - Events.status.startPos.y,
            rang = 3;
        return dx * dx + dy * dy >= rang * rang;
    }
    /**
     * @description 按事件类型获取某个节点上的事件
     * @param type 事件类型
     */
    static findEvent(type){
        let o = Events.status.currTarget,
            on = o.ni.on[type],
            func = on?on.func:null,
            arg = on?Util.copy(on.arg):null;
        return {o,on,func,arg};
    }
    /**
     * @description 找到事件，执行
     */
    static eventCall(name,o,arg){
        let w,l;
        while (o){
            if(o.widget && w != o.widget && o.widget[name]){
                w = o.widget;
                if(Util.objCall(w,name,arg) !== HandlerResult.OK){
                    return;
                }
            }
            
            if(o.logic && l !=o.logic && o.logic[name]){
                l = o.logic;
                if(Util.objCall(l,name,arg) !== HandlerResult.OK){
                    return;
                }
            }
            o = o.parent;
        }
    }
    /**
     * @description 响应事件
     */
    static responseEvent(o,e,arg,func,type){
        Events.status.eventType = type;
        arg = arg || [];
        arg.push(e);
        arg.push(o);
        try{
           Events.eventCall(func,o,arg);
        }catch(e){
            console.error(e);
        }
    }
};
/****************** 本地 ******************/

/**
 * @description 绑定移动端事件
 * @param o 渲染对象
 */
const bindMobile = (o) => {
    o.on("touchmove",Events.move);
    o.on("touchend",Events.end);
    o.on("touchendoutside",Events.end);
    o.on("touchcancel",Events.end);
}
/**
 * @description 绑定pc端事件
 * @param o 渲染对象
 */
const bindPc = (o) => {
    o.on("mousemove",Events.move);
    o.on("mouseup",Events.end);
    o.on("mouseupoutside",Events.end);
}


/****************** 立即执行 ******************/
//初始化
Events.init();