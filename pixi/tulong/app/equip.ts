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
        Scene.modifyTexture(this.elements["bag_tab_attack"],"images/ui/bag_tab_curr.png");
        matchBg(this.elements["bagBG"]);
    }
    tab(index){
        if(Equip.currTab === index){
            return;
        }
        const els = ["bag_tab_attack","bag_tab_armors"];
        Scene.modifyTexture(this.elements[els[index]],"images/ui/bag_tab_curr.png");
        Scene.modifyTexture(this.elements[els[Math.abs(index-1)]],"images/ui/bag_tab_bg.png");
        Equip.currTab = index;
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

/****************** 立即执行 ******************/
//注册组件
Widget.registW("app-ui-mainBottom",UiMainBottom);
//注册全局广播监听
AppEmitter.add("intoMain",Equip.init);