/****************** 导入 ******************/
import * as PIXI from '../pixijs/pixi';
/****************** 导出 ******************/
export default class Frame {
	static list: Array<any> = []
	/**
	 * @description 添加帧回调
	 * @param frameCall 帧回调函数
	 * @param interval 回调间隔（ms）
	 * @param isOnce 是否一次性，是则执行一次后删除
	 * @returns {} 帧对象，存储于帧列表，如果自身需要手动删除，则用户应该抓住它
	 */
	static add(frameCall: Function,interval?: number,isOnce?: boolean){
		let f = {
			frameCall: frameCall,
			interval: interval,
			last: Date.now(),
			once: isOnce,
			delete: false
		};
		Frame.list.push(f);
		return f;
	}
	/**
	 * @description 删除某个帧回调函数
	 * @param f 由Frame.add返回的帧对象
	 */
	static delete(f){
		let i = Frame.list.indexOf(f);
		if(i<0){
			return console.warn(`Don't have the frameCallback `,f);
		}
		Frame.list.splice(i,1);
		f.delete = true;
	}
	/**
	 * @description 执行帧列表
	 */
	static loop(){
		let i = Frame.list.length - 1,f,t = Date.now();
		for( i; i >= 0; i--){
			f = Frame.list[i];
			if(!f.interval || t - f.last >= f.interval){
				f.frameCall();
				if(Date.now() - t > 5){
					// console.log("slow task ",Date.now() - t,f.frameCall);
				}
				f.last = t;
				if(f.once){
					Frame.delete(f);
				}
			}
			t = Date.now();
		}
	}
}
/****************** 本地 ******************/
const ticker = new PIXI.ticker.Ticker();
let t = 0;
/****************** 立即执行 ******************/
ticker.stop();
ticker.add((deltaTime) => {
	Frame.loop();
});
ticker.start();