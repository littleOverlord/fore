export default class Config{
    constructor(option){
        const {pixelRatio, windowWidth, windowHeight} = option;
        let w,h,
            sw = this.screen._width/windowWidth,
            sh = this.screen._height/windowHeight,
            s = Math.min(sw,sh);
        w = windowWidth * s;
        h = windowHeight * s;
        if(sw > s){
            w = (windowWidth/windowHeight) * h;
        }else if(sh > s){
            h = (windowHeight/windowWidth) * w;
        }

        this.screen.width = w;
        this.screen.height = h;
        this.screen.scale = s;
    }
    screen = {
        _width: 750,
        _height: 1334,
        width: 0,
        height: 0,
        scale: 1
    }
}
