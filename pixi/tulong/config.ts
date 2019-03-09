export default class Config{
    constructor(option){
        const {windowWidth, windowHeight} = option;
        let w,h,l = 0,t = 0,
            sw = this.screen._width/windowWidth,
            sh = this.screen._height/windowHeight,
            s = Math.max(sw,sh);
        w = windowWidth * s;
        h = windowHeight * s;
        if(sw < s){
            l = Math.floor((w - this.screen._width)/2);
        }else if(sh < s){
            t = Math.floor((h - this.screen._height)/2);
        }
        this.screen.width = w;
        this.screen.height = h;
        this.screen.left = l;
        this.screen.top = t;
        this.screen.scale = s;
    }
    platForm = "wx"
    name = "tulong"
    remote = "http://192.168.3.22:9800"
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
