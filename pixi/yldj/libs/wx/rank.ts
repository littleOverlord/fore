/****************** 导入 ******************/
import Frame from '../../libs/ni/frame';
import Emitter from '../../libs/ni/emitter';
import Scene from '../../libs/ni/scene';
import Connect from '../../libs/ni/connect';

/****************** 导出 ******************/
export default class Rank{
    static init(cfg){
        sendMessage({
            type:"screen",
            screen:cfg.screen
        })
        screen = cfg.screen;
    }
}

/****************** 本地 ******************/
declare const wx;

let rankNode,screen,fastRang,utStep = 300,lastStep = utStep,updataTimer = Date.now() + utStep;

/**
 * @description 向微信子域发消息
 * @param message 
 */
const sendMessage = (message: any) => {
    let openDataContext = wx.getOpenDataContext();
    openDataContext.postMessage(message);
}

const setScore = (score) => {
    sendMessage({
        type: 'updateScore',
        value: score
    });
}

const update = () => {
    let n = Date.now();
    if(!rankNode || n < updataTimer){
        return;
    }
    updataTimer = n + utStep;
    lastStep += 300;
    let sharedCanvas = window['sharedCanvas'];
    let texture = Scene.createCanvasTexture(sharedCanvas);
    rankNode.texture = texture;
    if(!fastRang || !fastRang.init){
        utStep = lastStep;
    }
}

const connectClose = () => {
    if(!rankNode){
        return;
    }
    Scene.remove(rankNode);
    rankNode = undefined;
}

const caclFastRang = (x,y,w,h) => {
    fastRang = {x,y,w,h};
    // console.log(fastRang);
}

const touchStart = (e) => {
    // console.log(e,fastRang)
    if(!fastRang || fastRang.init){
        return;
    }
    fastRang.init = true;
    // console.log(e);
    let touch = e.start;
    if(touch.y > fastRang.y && touch.x > fastRang.x && touch.y < fastRang.y + fastRang.h && touch.x < fastRang.x + fastRang.w){
        // console.log("yes!");
        utStep = 30;
        updataTimer = Date.now() + utStep;
    }
}

const touchEnd = (e) => {
    // console.log(e);
    if(!fastRang){
        return;
    }
    utStep = lastStep;
    fastRang.init = undefined;
    sendMessage({type:"onTouchEnd"});
}

/****************** 立即执行 ******************/

Emitter.global.add("ptRank",()=>{
    return true;
});
Emitter.global.add("newScore",(score)=>{
    setScore(score);
    utStep = lastStep = 300;
});
Emitter.global.add("ptRankTop",()=>{
    connectClose();
    let sharedCanvas = window['sharedCanvas'],scale;
    sendMessage({type:"ptRankTop"});
    // console.log(sharedCanvas.a);
    let app = Scene.app(),texture = Scene.createCanvasTexture(sharedCanvas);
    rankNode = Scene.createSpriteFromTexture(texture,app.stage);
    scale = 576/texture.frame.width;
    // console.log(rankNode);
    rankNode.width = 576;
    rankNode.height = texture.frame.height * scale;
    rankNode.x = (screen.width - 576) / 2;
    rankNode.y = 513;
});
Emitter.global.add("ptRankAll",()=>{
    connectClose();
    let sharedCanvas = window['sharedCanvas'],scale;
    sendMessage({type:"ptRankAll"});
    // console.log(sharedCanvas.a);
    let app = Scene.app(),texture = Scene.createCanvasTexture(sharedCanvas);
    rankNode = Scene.createSpriteFromTexture(texture,app.stage);
    scale = 608/texture.frame.width;
    // console.log(rankNode);
    rankNode.width = 608;
    rankNode.height = texture.frame.height * scale;
    rankNode.x = (screen.width - 608) / 2;
    rankNode.y = 274;
    caclFastRang(rankNode.x,rankNode.y,rankNode.width,rankNode.height-176);
});
Emitter.global.add("ptRankClose",()=>{
    // console.log("ptRankClose");
    Scene.remove(rankNode);
    rankNode = undefined;
    fastRang = undefined;
})
Emitter.global.add("rankTouchStart",(e)=>{
    touchStart(e);
    return true;
})
Emitter.global.add("rankTouchEnd",(e)=>{
    touchEnd(e);
    return true;
})

Frame.add(update);

//通讯事件监听
Connect.notify.add("close",connectClose);
