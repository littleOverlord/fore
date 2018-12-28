/**
 * @description 事件处理模块
 *  支持事件 
 *  tap 单击 不会触发end事件
 *  longtap 长按 结束后会紧跟end事件
 *  drag 拖动 结束后会紧跟end事件
 *  end 结束
 */
/****************** 导入 ******************/
import Util from "./util";

/****************** 导出 ******************/
export default class Events {
    //支持的事件类型
    static eventsType = {
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
        const ua = navigator.userAgent.toLowerCase();
        Events.mobile = (ua.indexOf('mobile') > -1) ? true : false;
        Events.bindFunc = Events.mobile?bindMobile:bindPc;
    }
    /**
     * @description 事件监听循环,主要处理长按
     */
    static loop(){

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
        console.log("start ",e,this);
    }
    /**
     * @description 移动事件
     */
    static move(e){
        console.log("move this ",this);
        if(!Events.status.currTarget){
            return;
        }
        let {o,on,func,arg} = Events.findEvent(Events.eventsType.drag);
        
        if(!on || !func || (Events.status.eventType != Events.eventsType.drag && !Events.ismove(e.data.global))){
            return;
        }
        Events.status.eventType = Events.eventsType.drag;
        arg.push(e);
        arg.push(o);
        Util.call(func,arg);
    }
    /**
     * @description 结束事件
     */
    static end(e){
        Events.clear();
    }
    static longTap(){
        
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
    static findEvent(type){
        let o = Events.status.currTarget,
            on = o.ni.on[type],
            func = on?Events.findEventCall(on.func,o):null,
            arg = on?Util.copy(on.arg):null;
        return {o,on,func,arg};
    }
    /**
     * @description 寻找事件响应方法
     * @param name 时间名字
     * @param o 事件响应显示对象
     */
    static findEventCall(name,o){
        let func = o.widget[name] || o.logic?o.logic[name]:null;
        return func;
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