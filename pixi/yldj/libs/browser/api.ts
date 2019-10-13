/**
 * @description 浏览器api适配层
 */
/****************** 导入 ******************/

import Emitter from "../ni/emitter";

/****************** 导出 ******************/

/****************** 本地 ******************/
class DocVisiblity{
    constructor(){
        var visibilityChange;
        if (typeof document.hidden !== "undefined") {
            this.vKey = "hidden";
            visibilityChange = "visibilitychange";
        } else if (typeof (document as any).mozHidden !== "undefined") {
            this.vKey = "mozHidden";
            visibilityChange = "mozvisibilitychange";
        } else if (typeof (document as any).msHidden !== "undefined") {
            this.vKey = "msHidden";
            visibilityChange = "msvisibilitychange";
        } else if (typeof (document as any).webkitHidden !== "undefined") {
            this.vKey = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }
        // 添加监听器
        document.addEventListener(visibilityChange, ()=>{this.change();}, false);
    }
    /**
     * @description 记录不同浏览器的窗口状态属性
     */
    public vKey: string
    /**
     * @description 当前窗口状态，false 显示， true 隐藏
     */
    public status = false
    /**
     * @description 状态改变回调
     */
    public change(){
        if(document[this.vKey] == this.status){
            return;
        }
        this.status = document[this.vKey];
        Emitter.global.emit(!this.status?"show":"hide");
    }
}

 

/****************** 立即执行 ******************/
const DV = new DocVisiblity();

//========= 外部接口 ========\\
