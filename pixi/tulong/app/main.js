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
        let app = Scene.Application({
            width: cfg.screen.width,
            height: cfg.screen.height,  
            antialias: true,
            transparent: false,
            view: canvas,
            resolution: 1
        },cfg);
        Loader.add(["images/ui.png","images/ani/B_S_005.png"],function(){
            loadCount -= 1;
            loadOk();
        });
        Loader.loadJson(["images/ani/B_S_005.json","images/ui.json"],function(res){
            console.log(res);
            jsonData = res;
            loadCount -= 1;
            loadOk();
        });
        console.log(app);
    }
}
