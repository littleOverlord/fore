import Scene from '../libs/ni/scene';
import Loader from '../libs/ni/loader';

/**
 * 游戏主函数
 */
export default class Main {
    constructor(cfg) {
        console.log(cfg);
        Scene.Application({
            width: cfg.screen.width,
            height: cfg.screen.height,  
            antialias: true,
            transparent: false,
            view: canvas,
            resolution: 1
        },cfg);
        Loader.add(["images/ui/bag_bg.png","images/ui/bag_tab_armors.png","images/ui/bag_tab_attack.png","images/ui/bag_tab_bg.png","images/ui/bag_tab_curr.png","images/ui/button_buy.png","images/ui/button_sale.png","images/ui/button_store.png","images/ui/scene.png","images/ui/stage_level_bg.png","images/ui/token_attack.png","images/ui/token_bg.png","images/ui/token_diamond.png","images/ui/token_hp.png","images/ui/token_money.png"],function(){
            //顶部界面
            Scene.create({
                type:"container",
                name: "top",
                data: {
                    x:0,
                    y:0,
                    width: 750,
                    height: 424
                },
                children: [
                    {
                        type: "sprite",
                        data: {
                            url: "images/ui/scene.png",
                            width: 982,
                            height: 424,
                            x: 0,
                            y: 0
                        }
                    }
                ]
            },Scene.root);
            //底部界面
            Scene.create({
                type:"container",
                name: "bottom",
                data: {
                    x:0,
                    y:424,
                    width: 750,
                    height: 920
                },
                children: [
                    {
                        type: "sprite",
                        data: {
                            url: "images/ui/bag_bg.png",
                            width: 750,
                            height: 920,
                            x: 0,
                            y: 0
                        }
                    }
                ]
            },Scene.root);
        });
    }
}
