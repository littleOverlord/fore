/****************** 导入 ******************/
import Widget from '../libs/ni/widget';
import DB from '../libs/ni/db';

/****************** 导出 ******************/

/****************** 本地 ******************/

/**
 * @description 用户组件
 */
class WrankTop extends Widget{
    setProps(props){
        for(let k in props){
            this.cfg.data[k] = props[k];
        }
    }
    added(node){
        if(DB.data.rank.length == 0){
            return;
        }
        node.children[0].alpha = 0;
        // TODO 插入排行数据....

    }
}
/****************** 立即执行 ******************/
//初始化关卡数据库表
DB.init("rank",[]);
//注册组件
Widget.registW("app-ui-rank_top",WrankTop);