/****************** 导入 ******************/
import Widget from '../libs/ni/widget';
import Emitter from '../libs/ni/emitter';
import Scene from '../libs/ni/scene';
import Frame from '../libs/ni/frame';
import Connect from '../libs/ni/connect';
import Time from '../libs/ni/time';

/****************** 导出 ******************/

/****************** 本地 ******************/
let advNode,
    timeNode,
    allTime = 15,
    leftTime = 15,
    validTime = 15,
    startTime,
    lookBack: Function,
    timeMgr = new Time("adv");
// 平台广告id
const ADVID = {
    rewarded:0,
    banner:0
};
/**
 * @description 用户组件
 */
class Adv extends Widget{
    setProps(props){
        super.setProps(props);
        this.cfg.children[2].data.text = `${leftTime}`;
    }
    added(node){
        timeNode = this.elements.get("time");
        startTime = timeMgr.now();
    }
    /**
     * @description 关闭广告
     */
    close(){
        Scene.remove(advNode);
        lookBack(cacl());
        clear();
    }
}

/**
 * @description 更新倒计时
 */
const updDate = () => {
    if(leftTime == 0 || !timeNode){
        return;
    }
    let diff = Math.floor((timeMgr.now() - startTime)/1000),
        left = allTime - diff;
    if(left < leftTime){
        leftTime = left;
        timeNode.text = leftTime.toString();
    }
}
/**
 * @description 计算结果
 * 0 无效 1 有效
 */
const cacl = (): number => {
    if(leftTime == 0 || allTime - leftTime >= validTime){
        return 1;
    }
    return 0
}
/**
 * @description 清除数据
 */
const clear = () => {
    advNode = null;
    timeNode = null;
    allTime = 15;
    leftTime = 15;
    validTime = 15;
    startTime = 0;
    lookBack = null;
    timeMgr.reset();
}
/**
 * @description 通讯断开
 */
const connectClose = () => {
    if(!advNode){
        return;
    }
    Scene.remove(advNode);
    clear();
}
/****************** 立即执行 ******************/
//注册组件
Widget.registW("app-ui-adv",Adv);
//查看激励广告
//@callback (errcode) 0: 广告有效 1: 基础库太低，无法加载激励广告 2: 无效观看 3: api调用错误
Emitter.global.add("lookAdv",(callback)=>{
    if(ADVID.rewarded){
        Emitter.global.emit("advRewarded",{
            id: ADVID.rewarded,
            callback
        });
        return;
    }
    if(advNode){
        debugger;
        return console.log("Con't open another adv page");
    }
    advNode = Scene.open("app-ui-adv",Scene.root)
    lookBack = callback;
});
// 打开banner广告
//@callback (banner) banner组件实例，用于销毁组件(banner.destroy())
Emitter.global.add("showBannerAdv",(callback)=>{
    if(!ADVID.banner){
        return;
    }
    Emitter.global.emit("advBanner",{
        id: ADVID.banner,
        callback
    });
});
//监听游戏是否切到后台
Emitter.global.add("hide",()=>{
    if(!advNode){
        return;
    }
    timeMgr.stop();
})
//监听游戏是否切到前台
Emitter.global.add("show",()=>{
    if(!advNode){
        return;
    }
    timeMgr.resume();
})
Frame.add(updDate);
//通讯监听
Connect.notify.add("close",connectClose);