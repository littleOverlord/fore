/****************** 导入 ******************/
import Widget from '../../libs/ni/widget';

/****************** 导出 ******************/
/****************** 本地 ******************/
//组件扩展
class Ani extends Widget{
    /*
    {"id":""}
    */
   /**
    * {
    *   "id":"" //缓存节点在Widget.elements中
    *   "url":"images/ua/equip_light.json" //精灵图片配置
    *   "width":0 //按钮宽度
    *   "height":0 //按钮高度
    *   "x":0 // 按钮相对父节点的x坐标
    *   "y":0 // 按钮相对父节点的y坐标
    *   "speed": 0.08 //动画播放速度
    *   "once": true //是否一次性动画
    *   "anicallback": Function //动画执行完之后的回调
    * }
    */
    setProps(props){
        super.setProps(props);
        const cfg = this.cfg,dk = ["id","url","width","height","x","y","speed","once","ani"];
        for(let i = 0, len = dk.length; i < len; i++){
            cfg.data[dk[i]] = props[dk[i]];
        }
        if(!props.id){
            props.id = id++;
            cfg.data.id = props.id;
        }
    }
    added(o){
        console.log();
        o.ni.anicallback = this.props.anicallback;
    }
}
let id = 1;
/****************** 立即执行 ******************/
//注册组件
Widget.registW("app-ui-ani",Ani);