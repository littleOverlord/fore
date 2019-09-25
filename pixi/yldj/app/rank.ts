/****************** 导入 ******************/
import Widget from '../libs/ni/widget';
import DB from '../libs/ni/db';
import Connect from '../libs/ni/connect';
import Scene from '../libs/ni/scene';
import Emitter from '../libs/ni/emitter';

/****************** 导出 ******************/

/****************** 本地 ******************/
/**
 * ranksInfo
 * {
 *  "rank":[],
 *  top:0
 * }
 */
let ranksInfo;
let rankNode;
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
        rankNode = node;
        updateRankPage();
    }
}
class WrankItem extends Widget{
    setProps(props){
        this.cfg.data.left = props.index * 90;
        this.cfg.data.top = Math.floor(props.index / 6) * 200;
        if(props.info.head){
            this.cfg.children[1].data.netUrl = props.info.head;
            delete this.cfg.children[1].data.url;
        }else{
            this.cfg.children[1].data.url = "images/logo/logo.png"
        }
        if(props.info.name){
            this.cfg.children[2].data.text = props.info.name;
        }
        this.cfg.children[0].data.text = `第${props.top}名`;
        this.cfg.children[3].data.text = `${props.info.score}`;
    }
    added(node){
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
        DB.data.score.phase = data.ok.phase;
        DB.data.score.history = data.ok.history;
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
        DB.data.score.phase = score;
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
        ranksInfo = data.ok;
        updateRankPage();
    })
}
/**
 * @description 更新排行页面
 */
const updateRankPage = () => {
    if(!rankNode || ranksInfo.rank.length == 0){
        return;
    }
    let t;
    rankNode.children[0].alpha = 0;
    if(rankNode.children.length > 1){
        rankNode.removeChildren(1);
    }
    // TODO 插入排行数据....
    for(let i = 0, len = ranksInfo.rank.length; i < len; i++){
        t = i+1;
        if(i > 2){
            t = i-2+ranksInfo.start;
        }
        Scene.open("app-ui-rank_item",rankNode,null,{"info":ranksInfo.rank[i],"top":t,"index":i})
    }
}
/****************** 立即执行 ******************/
//初始化关卡数据库表
DB.init("score",{history:0,phase:0});
//注册组件
Widget.registW("app-ui-rank_top",WrankTop);
Widget.registW("app-ui-rank_item",WrankItem);
Emitter.global.add("gameStart",()=>{
    readScore();
    readRank();
});
Emitter.global.add("newScore",(score)=>{
    addScore(score);
});