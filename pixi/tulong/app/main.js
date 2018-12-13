/****************** 导入 ******************/
//mod
import './player'
import './equip'
//local use
import Scene from '../libs/ni/scene';
import Loader from '../libs/ni/loader';
import Emitter from '../libs/ni/emitter';

/****************** 导出 ******************/
/**
 * 游戏主函数
 */
export default class Main {
    constructor(cfg) {
        let loadCount = 2,
            jsonData,
            loadOk = function(){
                if(loadCount == 0){
                    Scene.createSpriteSheets(jsonData);
                    Emitter.emit("intoMain");
                }
            };
        console.log(cfg);
        Scene.Application({
            width: cfg.screen.width,
            height: cfg.screen.height,  
            antialias: true,
            transparent: false,
            view: canvas,
            resolution: 1
        },cfg);
        Loader.add(["images/ui/bag_bg.png","images/ui/bag_tab_armors.png","images/ui/bag_tab_attack.png","images/ui/bag_tab_bg.png","images/ui/bag_tab_curr.png","images/ui/button_buy.png","images/ui/button_sale.png","images/ui/button_store.png","images/ui/scene.png","images/ui/stage_level_bg.png","images/ui/token_attack.png","images/ui/token_bg.png","images/ui/token_diamond.png","images/ui/token_hp.png","images/ui/token_money.png","images/ani/B_S_005.png"],function(){
            loadCount -= 1;
            loadOk();
        });
        Loader.loadJson(["images/ani/B_S_005.json"],function(res){
            console.log(res);
            jsonData = res;
            loadCount -= 1;
            loadOk();
        });
    }
}
