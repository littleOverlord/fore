/****************** 导入 ******************/
import Widget from '../libs/ni/widget';
import Connect from '../libs/ni/connect';
import Scene from '../libs/ni/scene';
import Frame from '../libs/ni/frame';
import Emitter from '../libs/ni/emitter';

/****************** 导出 ******************/

/****************** 本地 ******************/
let selectNode;
const kindOfProp = ["suction","filter","armor"];
/**
 * @description 看广告随机道具组件
 */
class SelectProp extends Widget{
    added(node){
        
        let title = this.elements.get("title"),tip = this.elements.get("tip");
        title.ni.left = (Scene.screen.width - title.width)/2;
        tip.ni.left = (Scene.screen.width - tip.width)/2;
    }
    /**
     * @description 跳过看广告，直接开始游戏
     */
    skip(){
        intoGame();
    }
    /**
     * @description 看广告
     */
    look(){
        Emitter.global.emit("lookAdv",lookAdvBack);
    }
}
/**
 * @description 道具操作列表组件
 */
class WProplist extends Widget{
    added(node){
        Prop.nodeList = this.elements.get("propList");
    }
}
/**
 * @description 单个操作道具组件
 */
class WPropItem extends Widget{
    setProps(props){
        super.setProps(props);
        this.cfg.data.url = `images/shap/${props.type}.png`;
        this.cfg.children[0].data.text = String(props.count);
        this.cfg.children[1].data.width = props.process;
        if(props.process == 0 && props.count == 0){
            this.cfg.children[1].data.alpha = 0;
        }
        this.cfg.children[1].data.bottom = props.bottom;
    }
    added(node){
        
    }
    active(){
        Prop.caches.get(this.props.type).active();
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
    public lastTime: number
    // 道具显示对象
    public show: any
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
        let now = Date.now(),leftTime = this.lastTime - now;
        if(leftTime > 0){
            this.lastTime += this.life;
            this.processTotal += this.life;
        }else{
            this.lastTime = now + this.life;
            this.processTotal = this.life;
            Emitter.global.emit("propOperate",{type:this.type,operation:"add"});
        }
        this.count--;
        console.log("prop active!!");
    }
    /**
     * @description 更新道具
     * @param index 已经显示的数量，用来计算位置
     * @return 是否显示
     */
    public update(index):boolean{
        let now = Date.now(),leftTime = this.lastTime - now;
        if(!this.show && this.count>0){
            this.show = Scene.open("app-ui-prop_item",Prop.nodeList,null,{
                type:this.type,
                process: this.processTotal?(leftTime/this.processTotal):0,
                count: this.count,
                bottom: index * 126
            });
            this.index = index;
            return true;
        }else if(this.count > 0 && this.show && this.show.alpha == 0){
            this.show.alpha = 1;
        }
        if(this.count <= 0 && leftTime <= 0){
            this.show && this.show.alpha && (this.show.alpha = 0);
            if(this.processTotal){
                this.processTotal = 0;
                Emitter.global.emit("propOperate",{type:this.type,operation:"remove"});
            }
            return false;
        }
        
        if(this.index != index){
            this.index = index;
            this.show.ni.bottom = index * 126;
        }
        if(String(this.count) != this.show.children[0].text){
            this.show.children[0].text = String(this.count);
        }
        this.show.children[1].ni.width = `${(leftTime/this.processTotal)*100}%`;
        return true;
    }

    // 所有道具列表
    static caches: Map<string,Prop> = new Map()
    // 显示节点
    static nodeList: any
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
     * @description 清除道具数据
     */
    static clear(){
        if(Prop.nodeList){
            Scene.remove(Prop.nodeList);
            Prop.nodeList = undefined;
        }
        Prop.caches.clear();
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
 * @description 进入游戏
 */
const intoGame = () => {
    Scene.remove(selectNode);
    Emitter.global.emit("gameStart");
    selectNode = undefined;
    Scene.open("app-ui-prop_list",Scene.root);
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
    if(!Prop.nodeList){
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
    if(selectNode){
        Scene.remove(selectNode);
        selectNode = undefined;
    }
    Prop.clear();
}
/****************** 立即执行 ******************/
//注册组件
Widget.registW("app-ui-select_prop",SelectProp);
Widget.registW("app-ui-prop_item",WPropItem);
Widget.registW("app-ui-prop_list",WProplist);
//业务监听
Emitter.global.add("selectProp",()=>{
    selectNode = Scene.open("app-ui-select_prop",Scene.root);
});
Emitter.global.add("resetProp",()=>{
    Prop.reset();
});
//设置帧回调
Frame.add(update);
//通讯监听
Connect.notify.add("close",connectClose);