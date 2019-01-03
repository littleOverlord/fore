/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Widget from '../libs/ni/widget';

// import {UiMainBottom} from './ui/mainBottom';
import {AppEmitter} from './appEmitter';

/****************** 导出 ******************/
/**
 * 游戏主函数
 */
export default class Equip {
    static currTab = 0
    /**
     * @description 初始化装备界面
     */
    static init(){
        //创建顶部界面
        Scene.open("app-ui-mainBottom",Scene.root);
        //给按钮绑定事件
        // Scene.bindEvent("fast_buy","tap",Equip.fastBuy);
        // Scene.bindEvent("button_store","tap",Equip.openStore);
        // Scene.bindEvent("bag_tab_attack","tap",function(e){
        //     console.log(e);
        //     Equip.bagTab(0);
        // });
        // Scene.bindEvent("bag_tab_armors","tap",function(){
        //     Equip.bagTab(1);
        // });
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
class UiMainBottom extends Widget{
    added(){
        console.log("UiMainBottom added!!");
        matchBg(this.elements.get("bagBG"));
    }
}
class WEquipBg extends Widget{
    setProps(props){
        super.setProps(props);
        this.cfg.data.url = props.url;
    }
}
class WEquip extends Widget{
    setProps(props){
        super.setProps(props);

    }
    drag(){
        console.log("drag");
        matchBg(this.elements.get("bagBG"));
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
    for(let i = 0;i<16;i++){
        Scene.open("app-ui-equipBg",node,null,{url:"app/images/ui/bag_border.png"});
    }
}
/****************** 立即执行 ******************/
//注册组件
Widget.registW("app-ui-mainBottom",UiMainBottom);
Widget.registW("app-ui-equip",WEquip);
Widget.registW("app-ui-equipBg",WEquipBg);
//注册全局广播监听
AppEmitter.add("intoMain",Equip.init);