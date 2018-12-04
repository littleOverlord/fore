import * as PIXI from '../libs/pixijs/pixi.min'

/**
 * 游戏主函数
 */
const {pixelRatio, windowWidth, windowHeight} = wx.getSystemInfoSync()
export default class Main {
    constructor() {
        console.log(PIXI);
        console.log(pixelRatio,windowWidth,windowHeight);
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
            width: windowWidth * pixelRatio,
            height: windowHeight * pixelRatio,                       
            antialias: true,
            transparent: false,
            resolution: 1,
            view : canvas
            }
        );
        //映射pixi坐标
        app.renderer.plugins.interaction.mapPositionToPoint = (point, x, y) => {
            point.x = x * pixelRatio
            point.y = y * pixelRatio
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
            cat.y = 0;
            cat.y = 0;
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
