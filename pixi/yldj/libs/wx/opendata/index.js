let sharedCanvas = wx.getSharedCanvas();
let context = sharedCanvas.getContext('2d');
let screen;

const screenWidth = wx.getSystemInfoSync().screenWidth;
const screenHeight = wx.getSystemInfoSync().screenHeight;
const ratio = wx.getSystemInfoSync().pixelRatio;
let itemCanvas = wx.createCanvas();
let ctx = itemCanvas.getContext('2d');
let showType = "friends";

let myScore = undefined;
let myInfo = {};
let myRank = undefined;
getUserInfo();

// 初始化标题返回按钮等元素
function initEle() {
    context.restore();
    context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
}

function initRanklist (list) {
    // 至少绘制6个
    let length = Math.max(list.length,6);
    let itemHeight = 104;
    let topStart = 0;
    let draw = (item, index, rank, noline) => {
        let avatar = wx.createImage();
        if(item.avatarUrl){
            avatar.src = item.avatarUrl;
            avatar.onload = function() {
                ctx.drawImage(avatar, 89, index*itemHeight + 17, 67, 67);
                reDrawItem(0);
            }
        }

        ctx.fillStyle = '#714230';
        ctx.font = '26px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline="top";
        ctx.fillText(item.nickname, 182, index * itemHeight + 36);

        ctx.fillStyle = '#592011';
        ctx.font = 'bold 32px zcool-gdh';
        ctx.textAlign = 'left';
        ctx.textBaseline="top";
        ctx.fillText(item.score || 0, 444, index * itemHeight + 40);

        ctx.fillStyle = rank == myRank+1?'#4d7721':'#592011';
        ctx.font = '36px zcool-gdh';
        ctx.textAlign = 'center';
        ctx.textBaseline="top";
        ctx.fillText(rank, 46, index * itemHeight + 40);
        if(!noline){
            ctx.fillStyle = '#9c7b72';
            ctx.fillRect(0,index * itemHeight+100, 608,4);
        }
    };
    let drawTop = (item, index, rank) => {
        let avatar = wx.createImage();
        if(item.avatarUrl){
            avatar.src = item.avatarUrl;
            avatar.onload = function() {
                ctx.drawImage(avatar, index * 203 + 29, itemHeight * (length +1) + 45, 112, 112);
                reDrawItem(0);
            }
        }
        // console.log(item.nickname);
        // ctx.fillStyle = '#bd9a7c';
        // ctx.fillRect(index * 203,itemHeight * (length +1), 170,240);
        roundRect(ctx,index * 203,itemHeight * (length +1), 170,240,10,'#bd9a7c');
        ctx.fillStyle = '#825743';
        ctx.font = '26px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline="top";
        ctx.fillText(item.nickname, index * 203+85, itemHeight * (length +1) + 160);

        ctx.fillStyle = '#592011';
        ctx.font = 'bold 32px zcool-gdh';
        ctx.textAlign = 'center';
        ctx.textBaseline="top";
        ctx.fillText(item.score || 0, index * 203 + 85, itemHeight * (length +1) + 204);

        ctx.fillStyle = rank == myRank+1?'#4d7721':'#592011';
        ctx.font = '36px zcool-gdh';
        ctx.textAlign = 'center';
        ctx.textBaseline="top";
        ctx.fillText(rank, index * 203 +85, itemHeight * (length +1) + 10);
    }

    // itemCanvas.width = screenWidth - 40 * 2;
    // itemCanvas.height = itemHeight * length;
    itemCanvas.width = 608;
    itemCanvas.height = itemHeight * (length +1) + 240;

    if(myRank > 0 && myRank < list.length-1){
        topStart = myRank - 1;
    }else if(myRank >= list.length -1){
        topStart = myRank - 2;
    }

    ctx.clearRect(0, 0, itemCanvas.width, itemCanvas.height);

    if (myInfo.avatarUrl) {
        draw({
            avatarUrl: myInfo.avatarUrl,
            nickname: myInfo.nickName,
            openid: myInfo.openid,
            score: myScore || 0 // 取最高分
        },0,myRank>=0?(myRank+1):(list.length+1),true);
    }

    for (let i = 0; i < length; i++) {
        if(!list[i]){
            break;
        }
        if (i % 2 === 1) {
            ctx.fillStyle = '#bd9a7c';
            ctx.fillRect(0, (i + 1) * itemHeight, itemCanvas.width, itemHeight);
        }
    }
    if (list && list.length >0) {
        list.map((item,index) => {
            draw(item,index+1,index + 1);
            if(index >= topStart && index < topStart+3){
                drawTop(item,index - topStart,index+1);
            }
        });
    } else {
        // 没有数据
    }

   reDrawItem(0);
}

function initRankTop(){

}
function roundRect(ctx, x, y, w, h, r,color) {
    ctx.fillStyle = color;
    if (w< 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
}
// 因为头像绘制异步的问题，需要重新绘制
function reDrawItem(y) {
    let scale;
    context.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
    if(showType == "friends"){
        scale = screenWidth/608;
        if (y < 104) { // 到顶
            y = 104;
        } else if (y > itemCanvas.height - (104*6 + 240)) { // 到底
            y = itemCanvas.height - (104*6 + 240);
        }
        // console.log(y);
        context.drawImage(itemCanvas, 0, y, 608, 104*6, 0, 0, screenWidth, scale * 104*6);
        context.drawImage(itemCanvas, 0, 0, 608, 104, 0, scale * (104*6 + 72), screenWidth, scale * 104);
    }else if(showType == "top"){
        scale = screenWidth/576;
        y = itemCanvas.height - 240;
        context.drawImage(itemCanvas, 0, y, 576, 240, 0, 0, screenWidth, scale * 240);
    }
    //
    // context.drawImage(itemCanvas, 40, y+175, screenWidth - 40 * 2, 295);
}
function sortByScore (data) {
    let array = [];
    data.map(item => {

        array.push({
            avatarUrl: item.avatarUrl,
            nickname: item.nickname,
            openid: item.openid,
            score: item['KVDataList'][0]?item['KVDataList'][0].value-0:0 // 取最高分
        })

    })
    array.sort((a, b) => {
        return b['score'] - a['score'];
    });
    myRank = array.findIndex((item) => {
       return item.nickname === myInfo.nickName && item.avatarUrl === myInfo.avatarUrl;
    });
    if (myRank === -1)
        myRank = array.length;
    
    return array;
}
// 开放域的getUserInfo 不能获取到openId, 可以在主域获取，并从主域传送
function getUserInfo() {
    wx.getUserInfo({
        openIdList:['selfOpenId'],
        lang: 'zh_CN',
        success: res => {
            myInfo = res.data[0];
            // console.log(myInfo);
        },
        fail: res => {

        }
    })
}

// 获取自己的分数
function getMyScore (callback) {
    if(myScore != undefined){
        callback && callback();
        return;
    }
    wx.getUserCloudStorage({
        keyList: ['score'],
        success: res => {
            // console.log(res);
            myScore = res.KVDataList[0]?res.KVDataList[0].value : 0;
            callback && callback();
            getFriendsRanking();
            
        }
    });
}

function saveScore(score) {
    getMyScore(()=>{
        if(score <= myScore){
            return;
        }
        wx.setUserCloudStorage({
            KVDataList: [{ 'key': 'score', 'value': (''+score) }],
            success: res => {
                // console.log(res);
                myScore = score;
                getFriendsRanking();
            },
            fail: res => {
                console.log(res);
            }
        });
    })
    
}

function getFriendsRanking () {
  wx.getFriendCloudStorage({
    keyList: ['score'],
    success: res => {
        let data = res.data;
        // console.log(res.data);
        // drawRankList(data);
        initRanklist(sortByScore(data));
        // drawMyRank();
    }
  });
}
// getGroupRanking();
wx.onMessage(data => {
    if (data.type === 'ptRankAll') {
        // sharedCanvas.height = screenHeight;
        showType = "friends";
        reDrawItem(0);
    }else if(data.type === 'ptRankTop'){
        showType = "top";
        reDrawItem();
    }else if (data.type === 'updateScore') {
        // 更新最高分
        // console.log('更新最高分');
        saveScore(data.value);
    }else if(data.type === "screen"){
        screen = data.screen;
        initEle();
    }else if(data.type === "onTouchEnd"){
        startY = undefined;
    }
});

let startY = undefined, moveY = 0;
// 触摸移动事件
wx.onTouchMove(e => {
    // console.log(e);
    let touch = e.touches[0];
    // 触摸移动第一次触发的位置
    if (startY === undefined) {
        startY = touch.clientY + moveY;
    }
    moveY = startY - touch.clientY;
    
    reDrawItem(moveY);
});
