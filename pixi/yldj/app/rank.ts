/****************** 导入 ******************/
import Widget from '../libs/ni/widget';
import DB from '../libs/ni/db';
import { AppEmitter } from './appEmitter';
import Connect from '../libs/ni/connect';

/****************** 导出 ******************/

/****************** 本地 ******************/
let ranks = []

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
        if(ranks.length == 0){
            return;
        }
        node.children[0].alpha = 0;
        // TODO 插入排行数据....

    }
}
/**
 * @description 读取玩家积分数据
 */
const readScore = () => {
    Connect.request({type: "app/score@read",arg: {}},(data)=>{
        if(data.err){
            return;
        }
        console.log(data);
    })
}
/**
 * @description 更新得分
 * @param score 
 */
const addScore = (score) => {
    if(score <= DB.data.score.phase){
        return console.log(`the score is not enough to update(${score}<=${DB.data.score.phase})`);
    }
    Connect.request({type: "app/score@add",arg: {score}},(data)=>{
        if(data.err){
            return;
        }
        console.log(data);
        readRank();
    })
}
/**
 * @description 读取玩家排行榜数据
 */
const readRank = () => {
    Connect.request({type: "app/score@rank",arg: {}},(data)=>{
        if(data.err){
            return;
        }
        console.log(data);
    })
}
/****************** 立即执行 ******************/
//初始化关卡数据库表
DB.init("score",{history:0,phase:0});
//注册组件
Widget.registW("app-ui-rank_top",WrankTop);
AppEmitter.add("gameStart",()=>{
    readScore();
    readRank();
});
AppEmitter.add("newScore",(score)=>{
    addScore(score);
});