/**
 * @description 组件管理
 */
export default class Widget {
    constructor(url?){
        if(url){
            this.url = url;
        }
        this.cfg = Widget.cfgCache.get(this.url);
    }
    //widget路径
    url: string
    //组件配置
    cfg: any
    //组件设置了id的元素
    elements: Map<string,any> = new Map()


    //组件扩展类缓存
    static wCache: Map<string,Widget> = new Map()
    //组件配置缓存
    static cfgCache: Map<string,any> = new Map()
    /**
     * @description 注册组件
     * @param name 组件名
     * @param w 组件类
     */
    static registW(name: string,w: Widget): void{
        Widget.wCache.set(name,w);
    }
    /**
     * @description 注册组件配置
     * @param cfgs 组件配置
     */
    static registC(cfgs: any): void{
        for(let k in cfgs){
            Widget.cfgCache.set(k.replace(".json","").replace(/\//g,"-"),cfgs[k]);
        }
    }
    /**
     * @description 创建组件
     * @param name 组件名
     */
    static factory(name: string): Widget{
        let w: any = Widget.wCache.get(name);
        if(w){
            return new w();
        }
        return new Widget(name);
    }
};