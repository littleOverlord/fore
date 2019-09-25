/****************** 导入 ******************/
import Widget from '../libs/ni/widget';
import Emitter from '../libs/ni/emitter';
import Connect from '../libs/ni/connect';
import Scene from '../libs/ni/scene';
import Frame from '../libs/ni/frame';
/****************** 导出 ******************/

/****************** 本地 ******************/
let reviveNode,
    reviveBack: Function,
    stop = false,
    lastTime = 5000,
    hideTime = 0,
    endTime = 0;
/**
 * @description 看广告随机道具组件
 */
class Wrevive extends Widget{
    /**
     * @description 看广告
     */
    revive(){
        if(stop){
            return;
        }
        stop = true;
        Emitter.global.emit("lookAdv",(r)=>{
            reviveBack(r);
            clear();
        });
    }
}
/**
 * @description 更新复活倒计时
 */
const update = () => {
    if(!reviveNode || stop){
        return;
    }
    if(endTime == 0 && reviveNode){
        reviveBack(0);
        clear();
        return;
    }
    let leftTime = endTime - Date.now();
    if(leftTime <= 0){
        leftTime = 0;
        endTime = 0;
    }
    leftTime = Math.floor(leftTime/1000);
    reviveNode.children[1].children[0].text = `复活${leftTime}`;
    console.log(leftTime);
}
/**
 * @description 清除数据
 */
const clear = () => {
    if(reviveNode){
        Scene.remove(reviveNode);
        reviveNode = undefined;
        endTime = 0;
        reviveBack = undefined;
    }
}
/**
 * @description 通讯断开
 */
const connectClose = () => {
    clear();
}
/****************** 立即执行 ******************/
//注册组件
Widget.registW("app-ui-revive",Wrevive);
//业务监听
Emitter.global.add("showRevive",(callback: Function)=>{
    reviveNode = Scene.open("app-ui-revive",Scene.root);
    endTime = Date.now() + lastTime;
    reviveBack = callback;
    stop = false;
});
Emitter.global.add("hide",()=>{
    hideTime = Date.now();
})
Emitter.global.add("show",()=>{
    endTime += (Date.now()-hideTime);
})
//设置帧回调
Frame.add(update);
//通讯监听
Connect.notify.add("close",connectClose);