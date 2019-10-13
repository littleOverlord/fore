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
        rankNode = this.elements.get("rank_top");
        updateRankTop();
    }
}
class WrankTopItem extends Widget{
    setProps(props){
        this.cfg.data.left = props.index * 205 + 35;
        if(props.info.head){
            this.cfg.children[2].data.netUrl = props.info.head;
            delete this.cfg.children[2].data.url;
        }else{
            this.cfg.children[2].data.url = "images/logo/logo.png"
        }
        if(props.info.name){
            this.cfg.children[3].data.text = props.info.name;
        }
        this.cfg.children[1].data.text = `${props.top}`;
        this.cfg.children[4].data.text = `${props.info.score}`;
        if(props.self){
            this.cfg.children[1].data.style.fill = "0x4d7721";
        }
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
        setShareInfo(data.ok.phase);
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
    setShareInfo(score);
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
        updateRankTop();
    })
}
/**
 * @description 更新排行页面
 */
const updateRankTop = () => {
    if(!rankNode || ranksInfo.rank.length == 0){
        return;
    }
    let t,i = ranksInfo.top-ranksInfo.start,c = 0;
    if(rankNode.children.length > 0){
        rankNode.removeChildren();
    }
    // TODO 插入排行数据....
    if(i <= 0) {
        i = 0;
    }else{
        i -= 1;
    }
    for(let len = ranksInfo.rank.length; i < len; i++){
        t = i+1;
        if(i > 2){
            t = i-2+ranksInfo.start;
        }
        Scene.open("app-ui-rank_top_item",rankNode,null,{"info":ranksInfo.rank[i],"top":t,"index":c,"self":ranksInfo.rank[i].uid == DB.data.user.uid})
        c ++;
        if(c >= 3){
            return;
        }
    }
}
/**
 * @description 设置分享信息
 */
const setShareInfo = (phase) => {
    let s = phase || DB.data.score.phase,t = "";
    if(s > 0){
        t = `我得到了${s}分，等你来挑战！`
    }else{
        t = "不服来战，一决高下！"
    }
    Emitter.global.emit("setShareInfo",{
        title: t,
        query:`uid=${DB.data.uid}`
    })
}
/****************** 立即执行 ******************/
//初始化关卡数据库表
DB.init("score",{history:0,phase:0});
//注册组件
Widget.registW("app-ui-rank_top",WrankTop);
Widget.registW("app-ui-rank_top_item",WrankTopItem);
Emitter.global.add("intoMain",()=>{
    readScore();
    readRank();
});
Emitter.global.add("newScore",(score)=>{
    addScore(score);
});