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
    name = "yldj"
    //是否使用全本地资源，否则会先从外网加载depend，然后对比资源签名，再决定本地加载还是外网加载
    localRes = true
    remote = "https://mgame.xianquyouxi.com"
    ws = "wss://mgame.xianquyouxi.com:10102"
    // remote = "http://192.168.2.77:8081"
    // ws = "ws://192.168.2.77:10101"
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
