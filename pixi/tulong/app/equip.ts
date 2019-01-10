/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Widget from '../libs/ni/widget';

import {AppEmitter} from './appEmitter';

/****************** 导出 ******************/
/**
 * 游戏主函数
 */
export default class Equip {
    //武器
    static arms = []
    //防具
    static armors = []
    /**
     * @description 初始化装备界面
     */
    static init(){
        //创建底部界面
        Scene.open("app-ui-mainBottom",Scene.root,Equip);
    }
    /**
     * @description 响应快速购买
     */
    static fastBuy(e){
        console.log(`tap fast_buy button~~`,e);
    }
    /**
     * @description 打开商店界面
     */
    static openStore(e){
        console.log(`tap button_store button~~`,e);
    }
}
/****************** 本地 ******************/
//组件扩展
//主界面下面部分
class UiMainBottom extends Widget{
    added(){
        console.log("UiMainBottom added!!");
        matchBg(this.elements.get("bagBG"));
        createEquipBg(this.elements.get("equipBG"));
    }
}
//装备黑色背景
class WEquipBg extends Widget{
    setProps(props){
        super.setProps(props);
        this.cfg.data.url = props.url;
    }
}
//背包装备图标
class WEquip extends Widget{
    setProps(props){
        super.setProps(props);

    }
    drag(){
        console.log("drag");
    }
    dragEnd(){
        console.log("dragend");
    }
}
//适配背包背景
const matchBg = (bg) => {
    if(Scene.screen.left){
        bg.width += Scene.screen.left * 2;
        bg.x -= Scene.screen.left;
    }
    if(Scene.screen.top){
        bg.height += Scene.screen.top * 2;
    }
}
//创建装备背景
const createEquipBg = (node) => {
    let o,l,t;
    for(let i = 0;i<16;i++){
        o = Scene.open("app-ui-equipBg",node,null,{url:"images/ui/bag_border.png"});
        l = i % 4;
        t = Math.floor(i/4);
        o.x = l * 120 + (l+1) * 30;
        o.y = t * 120 + (t+1) * 30;
    }
}
/****************** 立即执行 ******************/
//注册组件
Widget.registW("app-ui-mainBottom",UiMainBottom);
Widget.registW("app-ui-equip",WEquip);
Widget.registW("app-ui-equipBg",WEquipBg);
//注册全局广播监听
AppEmitter.add("intoMain",Equip.init);