/****************** 导入 ******************/
import Scene from '../libs/ni/scene';
import Frame from '../libs/ni/frame';

import {Fighter as FighterCfg} from './ui/fighter';
import {AppEmitter} from './appEmitter';
import {Fighter, FScene} from './fight';

/****************** 导出 ******************/
/**
 * 关卡
 */
export default class Test {
    static fightScene: any
    static list: Array<any>
    static init(arg: number){
        console.log(arg);
    }
    static loop(){
        for(let v of this.list){
            console.log(v);
        }
    }
}
/****************** 本地 ******************/
const eventHandler = {
    insert: function(){

    }
}

/****************** 立即执行 ******************/