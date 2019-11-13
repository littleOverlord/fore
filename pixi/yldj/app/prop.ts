/****************** 导入 ******************/
import Widget from '../libs/ni/widget';
import Connect from '../libs/ni/connect';
import Scene from '../libs/ni/scene';
import Frame from '../libs/ni/frame';
import Emitter from '../libs/ni/emitter';
import Time from '../libs/ni/time';

/****************** 导出 ******************/

/****************** 本地 ******************/
let selectNode,
    listNode,
    stagePause = 1; // 关卡状态 0 正在运行 1 暂停
const kindOfProp = ["suction","filter","armor"];
/**
 * @description 看广告随机道具组件
 */
class SelectProp extends Widget{
    added(node){
        
        let tip = this.elements.get("tip");
        tip.ni.left = (Scene.screen.width - tip.width)/2;
    }
    /**
     * @description 跳过看广告，直接开始游戏
     */
    skip(){
        removeSelectNode();
        intoGame();
    }
    /**
     * @description 看广告
     */
    look(){
        removeSelectNode();
        Emitter.global.emit("lookAdv",lookAdvBack);
    }
}
/**
 * @description 道具操作列表组件
 */
class WProplist extends Widget{
    added(node){
        Prop.listContent = this.elements.get("propList");
    }
}
/**
 * @description 单个操作道具组件
 */
class WPropItem extends Widget{
    setProps(props){
        super.setProps(props);
        this.cfg.data.top = props.top;
        this.cfg.children[0].data.url = `images/shap/${props.type}.png`;
        this.cfg.children[1].data.text = `x${props.count}`;
        this.cfg.children[2].data.width = props.process;
        if(props.process == 0 && props.count == 0){
            this.cfg.children[2].data.alpha = 0;
        }
        
    }
    added(node){
        
    }
    active(){
        // console.log("active",this.props.type);
        if(!stagePause){
            Prop.caches.get(this.props.type).active();
        }
    }
}
/**
 * @description 道具特效组件
 */
class WPropEff extends Widget{
    setProps(props){
        super.setProps(props);
        this.cfg.data.url = props.url;
        this.cfg.data.top = props.top;
        this.cfg.data.left = props.left;
        this.cfg.data.width = props.width;
        this.cfg.data.height = props.height;
    }
    added(node){
        node.state.setAnimation(0, "itemact", true);
    }
}
/**
 * @description 道具特效组件
 */
class WPropEffFilter extends Widget{
    added(node){
        let filter1 = this.elements.get("filter1");
        filter1.scale.x = -1;
    }
}
/**
 * @description 道具管理
 */
class Prop{
    constructor(type){
        this.count  = 1
        this.type = type;
    }
    // 道具类型
    public type: string
    // 剩余次数
    public count: number
    // 持续时间
    public lastTime: number = 0
    // 道具显示对象
    public show: any
    // 道具效果显示对象
    public effect: any
    // 每个道具的持续生命
    public life: number = 10 * 1000
    // 显示位置
    public index: number = 0
    // 进度总时间
    public processTotal = 0
    // 激活道具
    public active(){
        if(this.count <= 0){
            return;
        }
        let now = Time.global.now(),leftTime = this.lastTime - now;
        if(leftTime > 0){
            this.lastTime += this.life;
            this.processTotal += this.life;
        }else{
            this.lastTime = now + this.life;
            this.processTotal = this.life;
            Emitter.global.emit("propOperate",{type:this.type,operation:"add"});
            PropEffect.create(this.type);
        }
        this.count--;
        // console.log("prop active!!");
    }
    /**
     * @description 更新道具
     * @param index 已经显示的数量，用来计算位置
     * @return 是否显示
     */
    public update(index):boolean{
        let now = Time.global.now(),leftTime = this.lastTime - now,p,text;
        if(!this.show && this.count>0){
            // console.log(index);
            this.show = Scene.open("app-ui-prop_item",Prop.listContent,null,{
                type:this.type,
                process: this.processTotal?(leftTime/this.processTotal):0,
                count: this.count,
                top: index * 92 + 22
            });
            this.index = index;
            return true;
        }else if(this.count > 0 && this.show && this.show.alpha == 0){
            this.show.alpha = 1;
            if(this.index == index){
                this.show.ni.top = index * 92 + 22;
            }
        }else if(this.count == 0 && this.show && this.show.alpha == 0){
            return false;
        }
        if(this.lastTime > 0 && leftTime <= 0){
            Prop.clearSingl(this);
            return false;
        }
        
        if(this.index != index){
            this.index = index;
            this.show.ni.top = index * 92 + 22;
        }
        text = `x${this.count}`
        if(text != this.show.children[1].text){
            this.show.children[1].text = text;
        }
        if(leftTime > 0 && this.processTotal > 0){
            p = `${(leftTime/this.processTotal)*100}%`;
        }
        this.show.children[2].ni.width = p || 0;
        return true;
    }

    // 所有道具列表
    static caches: Map<string,Prop> = new Map()
    // 显示节点
    static listContent: any
    // 添加道具
    static create(type: string){
        let cache = Prop.caches.get(type);
        if(!cache){
            Prop.caches.set(type,new Prop(type));
        }else{
            cache.count ++; 
        }
    }
    /**
     * @description 重置道具显示
     */
    static reset(){
        Prop.caches.forEach((v,k)=>{
            v.count = 0;
            v.lastTime = 0;
        })
    }
    /**
     * @description 清除单个效果
     */
    static clearSingl(p: Prop){
        if(p.count <= 0 && p.show && p.show.alpha){
             p.show.alpha = 0;
             p.show.ni.top = 2000;
        }
        if(p.processTotal){
            p.processTotal = 0;
            p.lastTime = 0;
            Emitter.global.emit("propOperate",{type:p.type,operation:"remove"});
            PropEffect.remove(p.type);
        }
    }
    /**
     * @description 清除道具数据
     */
    static clear(){
        if(listNode){
            Scene.remove(listNode);
            Prop.listContent = undefined;
            listNode = undefined;
        }
        Prop.caches.clear();
    }
}
/**
 * @description 道具效果
 */
class PropEffect{
    /**
     * @description 道具效果配置表
     */
    static cfg = {
        "suction":{
            name:"itemact01",
            width:512,
            height:512,
            left:()=>{
                return PropEffect.pos[0] + 118/2;
            },
            top:()=>{
                return PropEffect.pos[1] + 118/2;
            },
            widget:"app-ui-prop_effect"
        },
        "filter":{
            name:"itemact02",
            width:700,
            height:10,
            widget:"app-ui-prop_effect_filter"
        },
        "armor":{
            name:"itemact03",
            width:160,
            height:160,
            left:()=>{
                return PropEffect.pos[0] + 118/2;
            },
            top:()=>{
                return PropEffect.pos[1] + 118/2;
            },
            widget:"app-ui-prop_effect"
        }
    }
    static table = {}
    static pos:Array<number>
    /**
     * @description 创建特效
     */
    static create(type){
        let cfg = PropEffect.cfg[type],
            url = `images/spine/${cfg.name}.atlas`,
            width = cfg.width,
            height = cfg.height,
            left = cfg.left?cfg.left():null,
            top = cfg.top?cfg.top():null;
        PropEffect.table[type] = Scene.open(cfg.widget,Scene.root,null,{url,width,height,left,top});
    }
    /**
     * @description 移除特效
     */
    static remove(type){
        let eff = PropEffect.table[type];
        if(!eff){
            return;
        }
        Scene.remove(eff);
        delete PropEffect.table[type];
    }
    /**
     * @description 创建特效
     */
    static update(){
        let eff,cfg;
        for(let type in PropEffect.table){
            cfg = PropEffect.cfg[type];
            eff = PropEffect.table[type];
            if(cfg.left){
                eff.ni.left = cfg.left(); 
            }
            if(cfg.top){
                eff.ni.top = cfg.top(); 
            }
        }
    }
}
/**
 * @description 看广告回调
 * @param r 0 无效 1 有效
 */
const lookAdvBack = (r) => {
    if(r == 1){
        randomProp();
    }
    intoGame();
}
/**
 * @description 关闭道具选择页面
 */
const removeSelectNode = () => {
    if(!selectNode){
        return;
    }
    Scene.remove(selectNode);
    selectNode = undefined;
}
/**
 * @description 进入游戏
 */
const intoGame = () => {
    Emitter.global.emit("gameStart");
    listNode = Scene.open("app-ui-prop_list",Scene.root);
}
/**
 * @description 随机一个道具
 */
const randomProp = () => {
    let rd = Math.floor(Math.random()*kindOfProp.length);
    Prop.create(kindOfProp[rd]);
}
/**
 * @description 更新道具操作列表
 */
const update = () => {
    if(!Prop.listContent){
        return;
    }
    let i = 0;
    Prop.caches.forEach((v,k)=>{
        if(v.update(i)){
            i++;
        }
    });
}
/**
 * @description 通讯断开
 */
const connectClose = () => {
    removeSelectNode();
    Prop.clear();
}
/****************** 立即执行 ******************/
//注册组件
Widget.registW("app-ui-select_prop",SelectProp);
Widget.registW("app-ui-prop_item",WPropItem);
Widget.registW("app-ui-prop_list",WProplist);
Widget.registW("app-ui-prop_effect",WPropEff);
Widget.registW("app-ui-prop_effect_filter",WPropEffFilter);
//业务监听
Emitter.global.add("selectProp",()=>{
    selectNode = Scene.open("app-ui-select_prop",Scene.root);
});
Emitter.global.add("clearProp",()=>{
    Prop.clear();
});
Emitter.global.add("stagePause",(b)=>{
    stagePause = b;
});
Emitter.global.add("selfPos",(pos)=>{
    PropEffect.pos = pos;
    PropEffect.update();
});
Emitter.global.add("addProp",(type)=>{
    Prop.create(type);
});
Emitter.global.add("clearPropEffect",()=>{
    Prop.caches.forEach((v,k) => {
        Prop.clearSingl(v);
    })
});
//设置帧回调
Frame.add(update);
//通讯监听
Connect.notify.add("close",connectClose);