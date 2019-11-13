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
let rankAllNode;
let rankAllContent;
/**
 * @description 用户组件
 */
class WrankTop extends Widget{
    setProps(props){
        for(let k in props){
            this.cfg.data[k] = props[k];
        }
        Emitter.global.emit("ptRankTop");
    }
    added(node){
        rankNode = this.elements.get("rank_top");
        updateRankTop();
    }
    lookAll(){
        rankAllNode = Scene.open("app-ui-rank_all",Scene.root);
    }
}
/**
 * @description 用户组件
 */
class WrankAll extends Widget{
    setProps(props){
        for(let k in props){
            this.cfg.data[k] = props[k];
        }
        updateSelf(this.cfg.children[2].children[5].props);
        Emitter.global.emit("ptRankAll");
    }
    added(){
        
        rankAllContent = this.elements.get("rankAllContent");
        updateRankAll();
    }
    empty(){
        
    }
    goback(){
        Emitter.global.emit("ptRankTop");
        Scene.remove(rankAllNode);
    }
    start(e){
        let r = Emitter.global.emit("rankTouchStart",e);
        r = r && r[0];
        if (r){
            return;
        }
    }
    end(e){
        let r = Emitter.global.emit("rankTouchEnd",e);
        r = r && r[0];
        if (r){
            return;
        }
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
        this.cfg.children[1].data.text = `${props.tops}`;
        this.cfg.children[4].data.text = `${props.info.score}`;
        if(props.self){
            this.cfg.children[1].data.style.fill = "0x4d7721";
        }
    }
}

class WrankAllItem extends Widget{
    setProps(props){
        let d = 0;
        this.cfg.data.top = props.top || (props.index * 104);
        if(props.left != undefined){
            this.cfg.data.left = props.left;
        }
        if(props.index % 2 == 0){
            d = 1;
            this.cfg.children.splice(0,1);
        }
        if(props.info.head){
            this.cfg.children[2-d].data.netUrl = props.info.head;
            delete this.cfg.children[2-d].data.url;
        }else{
            this.cfg.children[2-d].data.url = "images/logo/logo.png"
        }
        if(props.info.name){
            this.cfg.children[3-d].data.text = props.info.name;
        }
        this.cfg.children[1-d].children[0].data.text = `${props.tops}`;
        this.cfg.children[4-d].data.text = `${props.info.score}`;
        if(props.self){
            this.cfg.children[1-d].children[0].data.style.fill = "0x4d7721";
        }
        if(props.noline){
            this.cfg.children.splice(5-d,1);
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
        // console.log(data);
        DB.data.score.phase = data.ok.phase;
        DB.data.score.history = data.ok.history;
        Emitter.global.emit("readScore");
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
        // console.log(data);
        DB.data.score.phase = score;
        if(score > DB.data.score.history){
            DB.data.score.history = score;
        }
        
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
        // console.log(data);
        ranksInfo = data.ok;
        updateRankTop();
    })
}
/**
 * @description 更新结算排名
 */
const updateRankTop = () => {
    let r = Emitter.global.emit("ptRank");
    r = r && r[0];
    if(r || !rankNode || ranksInfo.rank.length == 0){
        return;
    }
    let t,i = -1,c = 0;
    let topStart = 1,selfIndex = -1;
    if(rankNode.children.length > 0){
        rankNode.removeChildren();
    }
    for(let ii = 0, len = ranksInfo.rank.length; ii < len; ii++){
        if(ranksInfo.rank[ii].uid == DB.data.user.uid){
            topStart = ranksInfo.top - ii;
            selfIndex = i = ii;
            break;
        }
    }

    // TODO 插入排行数据....
    if (i > ranksInfo.rank.length - 3){
        i = ranksInfo.rank.length - 3;
        if(i <= 0) {
            i = 0;
        }
    }else if(i <= 0) {
        i = 0;
    }else{
        i -= 1;
    }
    for(let len = ranksInfo.rank.length; i < len; i++){
        t = topStart + i
        Scene.open("app-ui-rank_top_item",rankNode,null,{"info":ranksInfo.rank[i],"tops":t,"index":c,"self":i == selfIndex})
        c ++;
        if(c >= 3){
            return;
        }
    }
}
/**
 * @description 更新排名列表
 */
const updateRankAll = () => {
    let r = Emitter.global.emit("ptRank"),topStart = 1,selfIndex = -1,i = 0,t;
    r = r && r[0];
    if(r || !rankAllContent || ranksInfo.rankTop.length == 0){
        return;
    }
    if(rankAllContent.children.length > 0){
        rankAllContent.removeChildren();
    }

    for(let ii = 0, len = ranksInfo.rank.length; ii < len; ii++){
        if(ranksInfo.rank[ii].uid == DB.data.user.uid){
            topStart = ranksInfo.top - ii;
            selfIndex = ii;
            break;
        }
    }

    for(let len = ranksInfo.rank.length; i < len; i++){
        t = topStart + i;
        Scene.open("app-ui-rank_all_item",rankAllContent,null,{"info":ranksInfo.rank[i],"tops":t,"index":i,"self":i == selfIndex});
    }
}
/**
 * @description 更新自己的排行
 * @param props 
 */
const updateSelf = (props: any) => {
    let selfIndex = -1;
    //{"info":ranksInfo.rank[i],"tops":t,"index":i,"self":i == selfIndex}
    for(let ii = 0, len = ranksInfo.rank.length; ii < len; ii++){
        if(ranksInfo.rank[ii].uid == DB.data.user.uid){
            selfIndex = ii;
            props.info = ranksInfo.rank[ii];
            break;
        }
    }
    if(!props.info){
        props.info = {
            name: DB.data.user.name,
            head: DB.data.user.head,
            score: DB.data.score.phase
        }
    }
    props.tops = ranksInfo.top;
    props.self = true;
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
        query:`uid=${DB.data.user.uid}`
    })
}
/**
* @description 通讯断开
*/
const connectClose = () => {
   if(rankAllNode){
       Scene.remove(rankAllNode);
       rankAllNode = null;
   }
   rankNode = null;
   rankAllContent = null;
}

/****************** 立即执行 ******************/
//初始化关卡数据库表
DB.init("score",{history:0,phase:0});
//注册组件
Widget.registW("app-ui-rank_top",WrankTop);
Widget.registW("app-ui-rank_top_item",WrankTopItem);
Widget.registW("app-ui-rank_all",WrankAll);
Widget.registW("app-ui-rank_all_item",WrankAllItem);
Emitter.global.add("login",()=>{
    readScore();
    readRank();
});
Emitter.global.add("newScore",(score)=>{
    addScore(score);
});

//通讯监听
Connect.notify.add("close",connectClose);