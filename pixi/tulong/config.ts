export default class Config{
    constructor(option){
        const {windowWidth, windowHeight} = option;
        let w,h,
            sw = this.screen._width/windowWidth,
            sh = this.screen._height/windowHeight,
            s = Math.max(sw,sh);
        w = windowWidth * s;
        h = windowHeight * s;
        this.screen.width = w;
        this.screen.height = h;
        this.screen.scale = s;
    }
    platForm = "wx"
    name = "tulong"
    remote = "https://tulong.xianquyouxi.com"
    screen = {
        _width: 750,
        _height: 1334,
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        scale: 1
    }
}
