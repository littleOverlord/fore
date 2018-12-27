/**
 * @description 事件处理模块
 */
/****************** 导出 ******************/
export default class Events {
    //是否移动端
    static mobile: boolean
    /**
     * @description 初始化设备数据
     */
    static init(){
        const ua = navigator.userAgent.toLowerCase();
        Events.mobile = (ua.indexOf('mobile') > -1) ? true : false;
    }
    /**
     * @description 在渲染节点上绑定事件
     * @param cfg {
     *  ...,
     *  on:{tap:"tap(0)","drag":"drag",...},
     *  ...
     * }
     */
    static bindEvent(o,cfg){
        if(!cfg.on){
            return;
        }
    }
};
/****************** 本地 ******************/
const bindMobile = () => {

}

const bindPc = () => {
    
}


/****************** 立即执行 ******************/
//初始化
Events.init();