/****************** 导入 ******************/
import Scene from '../../libs/ni/scene';
import Widget from '../../libs/ni/widget';
import { Events, HandlerResult } from '../../libs/ni/events';
import Util from '../../libs/ni/util';

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
        const cfg = this.cfg,dk = ["id","url","width","height","x","y","speed","once","anicallback"];
        for(let i = 0, len = dk.length; i < len; i++){
            cfg.data[dk[i]] = props[dk[i]];
        }

    }
    added(){
        console.log();
    }
}

/****************** 立即执行 ******************/
//注册组件
Widget.registW("app-ui-ani",Ani);