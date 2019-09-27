export default class Config{
    constructor(option){
        this.init();
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
    init(){
        this.platForm = "bd";
        this.name = "yldj";
        this.localRes = true;
        this.remote = "https://mgame.xianquyouxi.com";
        this.ws = "wss://mgame.xianquyouxi.com:10102";
        this.screen = {
            _width: 750,
            _height: 1334,
            width: 0,
            height: 0,
            left: 0,
            top: 0,
            scale: 1
        };
    }
    public platForm: string
    public name: string
    //是否使用全本地资源，否则会先从外网加载depend，然后对比资源签名，再决定本地加载还是外网加载
    public localRes:boolean
    public remote:string
    public ws: string
    // remote = "http://192.168.28.92:8081"
    // ws = "ws://192.168.28.92:10101"
    public screen: any
}
