/****************** 导入 ******************/
import Emitter from "./emitter"
/****************** 导出 ******************/
export default class Animate {
	static emitter = new Emitter()
	/**
	 * @description 动画处理
	 */
	static run(arr){
		for(let i = 0, len = arr.length; i < len; i++){

		}
	}
	static onLoop(o){
		// console.log("onLoop",o);
	}
	static onComplete(o){
		// console.log("onComplete",o);
	}
	static onFrameChange(o){
		// console.log("onFrameChange",o);
		let cf = o.currentFrame,
			ani = o.ni.animate.ani,
			rang = o.ni.actions[ani];
		if(!rang){
			return;
		}
		if(cf == rang[1]){
			o.gotoAndPlay(rang[0]);
		}
	}
}
/****************** 本地 ******************/
