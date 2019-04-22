/****************** 导入 ******************/
import Scene from '../../libs/ni/scene';
import Widget from '../../libs/ni/widget';
import { Events, HandlerResult } from '../../libs/ni/events';
import Util from '../../libs/ni/util';

/****************** 导出 ******************/
/****************** 本地 ******************/
//组件扩展
class Button extends Widget{
    /*
    {"id":""}
    */
   /**
    * {
    *   "id":"" //缓存节点在Widget.elements中
    *   "url":"" //背景图片
    *   "width":0 //按钮宽度
    *   "height":0 //按钮高度
    *   "left":0 // 按钮相对父节点的x坐标
    *   "top":0 // 按钮相对父节点的y坐标
    *   "text":"" // 按钮的文字，如果没有则会删除文字节点
    *   "size":20 // 文字大小
    *   "color":#000000 //文字颜色
    *   "on":{"tap":{"func":"tab","arg":[1]}} //事件
    * }
    */
    setProps(props){
        super.setProps(props);
        const cfg = this.cfg,text = cfg.children[0].data,dk = ["id","url","width","height","left","top"];
        for(let i = 0, len = dk.length; i < len; i++){
            cfg.data[dk[i]] = props[dk[i]];
        }
        cfg.on = props.on || {"tap":{"func":"buttonTap",arg:[]}};
        text.text = props.text;
        text.style.fontSize = props.size;
        text.style.fill = props.color;

        if(props.on && props.on.tap){
            this[cfg.on.tap.func] = ()=>{
                return this.buttonTap();
            }
        }
        cfg.on.start = {"func":"tapStart","arg":[]};
    }
    added(){
        let node = this.elements.get(this.props.id),
            text = this.elements.get(this.props.id).children[0];
        node.anchor.set(0.5,0.5);
        node.ni.left = this.props.left + this.props.width/2;
        node.ni.top = this.props.top + this.props.height/2;
        text.ni.left = (this.props.width - text.width)/2 - this.props.width/2;
        text.ni.top = (this.props.height - text.height)/2 - this.props.height/2;
        console.log(text.width,text.height);
    }
    tapStart(){
        let btn = this.elements.get(this.props.id);
        btn.scale.x = btn.scale.y = 0.8;
        console.log("tapStart");
    }
    buttonTap(){
        let btn = this.elements.get(this.props.id);
        btn.scale.x = btn.scale.y = 1;
        console.log("buttonTap");
        return HandlerResult.OK;
    }
}

/****************** 立即执行 ******************/
//注册组件
Widget.registW("app-ui-button",Button);