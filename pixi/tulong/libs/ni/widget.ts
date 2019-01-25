/**
 * @description 组件管理
 */
/****************** 导入 ******************/
import Util from "./util";
/****************** 导出 ******************/
export default class Widget {
    constructor(url,props?){
        if(!this.url){
            this.url = url;
        }
        this.cfg = Util.copy(Widget.cfgCache.get(this.url));
        this.setProps(props);
    }
    //widget路径
    url: string
    //组件配置
    cfg: any
    //组件数据
    props: any
    //组件设置了id的元素
    elements: Map<string,any> = new Map()
    //设置props
    setProps(props){
        this.props = props;
    }
    //组件被添加到场景,渲染周期内调用，谨慎使用
    /**
     * 
     * @param o 渲染对象
     */
    added(o){}
    //组件被销毁
    destory(){}

    //组件扩展类缓存
    static wCache: Map<string,Function> = new Map()
    //组件配置缓存
    static cfgCache: Map<string,any> = new Map()
    /**
     * @description 注册组件
     * @param name 组件名
     * @param w 组件类
     */
    static registW(name: string,w: Function): void{
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
    static factory(name: string, wName: string, prop?: any): Widget{
        let w: any = Widget.wCache.get(wName) || Widget;

        return new w(name, prop);
    }
};