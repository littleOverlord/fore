/****************** 导入 ******************/
import Scene from "./scene";
import Util from "./util"
/****************** 导出 ******************/
export default class TextAnimate {
	constructor(aniFunc: Function,style){
		this.aniFunc = aniFunc;
		this.style = style;
	}
	//动画缓存
	cache = []
	playing = []
	//文字样式
	style: any
	//动画执行函数
	aniFunc: Function
	//创建text
	/**
	 * 
	 * @param option {text,x,y,alpha}
	 * @param parent 渲染对象
	 */
	create(option,parent){
		let o = this.cache.shift(),d:any = {};
		if(o){
			Util.setValueO2O(option,o);
		}else{
			Util.setValueO2O(option,d);
			d.style = d.style || this.style;
			o = Scene.create({
				type: "text",
				data: d
			},null,parent,null);
		}
		this.playing.push(o);
		return o;
	}
	//动画循环
	loop(){
		for(let i = this.playing.length - 1; i >= 0; i--){
			if(this.aniFunc(this.playing[i])){
				this.cache.push(this.playing[i]);
				this.playing.splice(i,1)
			}
		}
	}
}
/****************** 本地 ******************/
