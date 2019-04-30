/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Widget from '../libs/ni/widget';

/****************** 导出 ******************/
export default class Process{
    static timer
    static node
    static table = []
    static add(){
        let index = Process.table.length;
        Process.table.push(0);
        createBar();
        return processHandler(index);
    }
    static clear(){
        Scene.remove(Process.node);
        Process.timer = null;
        Process.node = null;
        Process.table = [];
    }
}

/****************** 本地 ******************/
const barData = {   
    "type": "rect",
    "data": {
        "width": "100%",
        "height": "100%",
        "left": 0,
        "top": 0,
        "background-color":"0x000000",
        "background-alpha":0.5
    },
    "children": [
        {
            "type":"rect",
            "data":{
                "width": "80%",
                "height": 20,
                "left": "10%",
                "bottom": 200,
                "border-color": "0xffff00",
                "border-width": 1,
                "border-align": 1
            },
            "children":[
                {
                    "type":"rect",
                    "data":{
                        "id":"processBar",
                        "width": "100%",
                        "height": 20,
                        "left": 0,
                        "top": 0,
                        "background-color":"0x00ffff"
                    }
                },
                {
                    "type": "text",
                    "data": {
                        "text": "资源加载中...",
                        "style": {"fontSize":24,"fill":"#ffffff"},
                        "left": 0,
                        "top": 25
                    }
                },
                {
                    "type": "text",
                    "data": {
                        "text": "000.0%",
                        "style": {"fontSize":24,"fill":"#ffffff"},
                        "right": 0,
                        "top": 25
                    }
                }
            ]
        }
    ]
}
/**
 * @description 打开进度界面
 */
const createBar = () => {
    if(Process.node){
        return;
    }
    Process.node = Scene.create(barData,new Widget("app-ui-process"),Scene.root);
    Process.node.children[0].children[0].scale.x = 0.0001;
}
/**
 * @description 返回进度处理函数
 * @param index 
 */
const processHandler = (index) => {
    return (point) => {
        Process.table[index] = point;
        updateBar();
    }
}
/**
 * @description 更新进度条
 */
const updateBar = () => {
    let total = Process.table.length,
        _process = 0;
    for(let i = 0; i < total; i++){
        _process += Process.table[i];
    }
    console.log(_process);
    Process.node.children[0].children[0].scale.x = _process || 0.0001;
    Process.node.children[0].children[2].text = (_process*100).toFixed(1);
}

/****************** 立即执行 ******************/