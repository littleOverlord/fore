/****************** 导入 ******************/
import Widget from '../libs/ni/widget';
import Emitter from '../libs/ni/emitter';
import Connect from '../libs/ni/connect';
import Scene from '../libs/ni/scene';
import Frame from '../libs/ni/frame';
/****************** 导出 ******************/

/****************** 本地 ******************/
let guideNode,
    guideBack,
    handNode,
    arrowNode;
/**
 * @description 看广告随机道具组件
 */
class Wguide extends Widget{
    
    /**
     * @description 添加到渲染节点
     */
    added(){
        handNode = this.elements.get("hand");
        arrowNode = this.elements.get("arrow");
        handNode.__ani = {
            mark:1
        };
        arrowNode.__ani = {
            mark:-1
        };
    }
    /**
     * @description 触发下一步引导
     */
    next(){
        guideBack();
        clear();
    }
}
/**
 * @description 更新引导动画
 */
const update = () => {
    if(!handNode || !arrowNode){
        return;
    }
    handNode.scale.x = handNode.scale.y = (handNode.scale.x+handNode.__ani.mark*0.01);
    arrowNode.ni.left += arrowNode.__ani.mark*1;
    if(handNode.scale.x > 1.5){
        handNode.__ani.mark = -1;
    }else if(handNode.scale.x < 1){
        handNode.__ani.mark = 1;
    }
    if(arrowNode.ni.left < -336){
        arrowNode.__ani.mark = 1;
    }else if(arrowNode.ni.left > -236){
        arrowNode.__ani.mark = -1;
    }
}
/**
 * @description 清除数据
 */
const clear = () => {
    if(!guideNode){
        return;
    }
    Scene.remove(guideNode);
    guideNode = undefined;
    guideBack = undefined;
    Frame.delete(update);
}
/**
 * @description 通讯断开
 */
const connectClose = () => {
    clear();
}
/****************** 立即执行 ******************/
//注册组件
Widget.registW("app-ui-guide",Wguide);

Emitter.global.add("guide",(callback)=>{
    if(localStorage.guid){
        return true;
    }
    guideNode = Scene.open("app-ui-guide",Scene.root);
    guideBack = callback;
    localStorage.guid = true;
    return false;
})
//设置帧回调
Frame.add(update);
//通讯监听
Connect.notify.add("close",connectClose);