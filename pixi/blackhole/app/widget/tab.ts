/****************** 导入 ******************/
import Scene from '../../libs/ni/scene';
import Widget from '../../libs/ni/widget';
import { HandlerResult } from '../../libs/ni/events';

/****************** 导出 ******************/
/****************** 本地 ******************/
let index = 0;
//组件扩展
class Tab extends Widget{
    /*
    {"curr":0,"bg_n":"bag_tab_bg","bg_c":"bag_tab_curr","items":[
        {"icon":"bag_tab_attack","con":""},{"icon":"bag_tab_armors","con":""}
    ]}
    */
    setProps(props){
        super.setProps(props);
        index = props.curr;
        let tabs = this.cfg.children[0].children;
        for(let i = 0, len = tabs.length; i < len; i++){
            if(props.curr == i){
                tabs[i].data.url = `images/ui/${props.bg_c}.png`;
            }else{
                tabs[i].data.url = `images/ui/${props.bg_n}.png`;
                this.cfg.children[i+1].data.left = 2000;
            }
            this.cfg.children[i+1].children[0].type = props.items[i].con;
            this.cfg.children[i+1].children[0].props = {index:i};
        }
    }
    tab(pos){
        if(index === pos){
            return;
        }
        let tabs = this.cfg.children[0].children;
        for(let i = 0, len = tabs.length; i < len; i++){
            let t = `tab_${i}`,c = `content_${i}`;
            if(i == pos){
                Scene.modifyTexture(this.elements.get(t),`images/ui/${this.props.bg_c}.png`);
                this.elements.get(c).ni.left = 0;
            }else if(i == index){
                Scene.modifyTexture(this.elements.get(t),`images/ui/${this.props.bg_n}.png`);
                this.elements.get(c).ni.left = 2000;
            }
        }
        index = pos;
        return HandlerResult.OK;
    }
}

/****************** 立即执行 ******************/
//注册组件
Widget.registW("app-ui-tab",Tab);