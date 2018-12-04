import * as PIXI from '../libs/pixijs/pixi.min'

/**
 * 游戏主函数
 */
export default class Main {
    constructor(cfg) {
        console.log(cfg);
        // console.log(pixelRatio,windowWidth,windowHeight);
      //Aliases
        let Application = PIXI.Application,
        Container = PIXI.Container,
        loader = PIXI.loader,
        resources = PIXI.loader.resources,
        TextureCache = PIXI.utils.TextureCache,
        Sprite = PIXI.Sprite,
        Rectangle = PIXI.Rectangle;

        //Create a Pixi Application
        let app = new Application({
            width: cfg.screen.width,
            height: cfg.screen.height,                       
            antialias: true,
            transparent: false,
            resolution: 1,
            view : canvas
            }
        );
        //映射pixi坐标
        app.renderer.plugins.interaction.mapPositionToPoint = (point, x, y) => {
            point.x = x * cfg.screen.scale
            point.y = y * cfg.screen.scale
        }
        //Add the canvas that Pixi automatically created for you to the HTML document
        // document.body.appendChild(app.view);

        loader
        .add("images/bg.jpg")
        .load(setup);

        //Define any variables that are used in more than one function
        let cat;

        function setup() {

            //Create the `cat` sprite
            cat = new Sprite(resources["images/bg.jpg"].texture);
            cat.width = cfg.screen.width;
            cat.height = cfg.screen.height;
            app.stage.addChild(cat);

            //Start the game loop
            app.ticker.add(delta => gameLoop(delta));
        }

        function gameLoop(delta){

        //Move the cat 1 pixel
        // cat.x += 1;

        //Optionally use the `delta` value
        //cat.x += 1 + delta;
        }
    }
}
