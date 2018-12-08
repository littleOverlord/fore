import * as PIXI from '../pixijs/pixi.min';
import Frame from './frame'

let Application = PIXI.Application,
        Container = PIXI.Container,
        resources = PIXI.loader.resources,
        TextureCache = PIXI.utils.TextureCache,
        Sprite = PIXI.Sprite,
				Rectangle = PIXI.Rectangle;
const creater = {
	container: (data) => {
		let o = new Container();
		o.width = data.width;
		o.height = data.height;
		o.position.set(data.x || 0, data.y || 0);
		return o;
	},
	sprite: (data) => {
		let o = new Sprite(resources[data.url].texture);
		o.width = data.width;
		o.height = data.height;
		o.position.set(data.x || 0, data.y || 0);
		return o;
	}
}
export default class Scene {
	// render
	static app;
	// root node
	static root = new Container();
	// object cache
	static cache = {}
	/**
	 * @description create scene
	 */
	static Application(option,cfg){
		this.app = new Application(option);
		//映射pixi坐标
		this.app.renderer.plugins.interaction.mapPositionToPoint = (point, x, y) => {
				point.x = x * cfg.screen.scale;
				point.y = y * cfg.screen.scale;
		}

		this.root.width = cfg.screen._width;
		this.root.height = cfg.screen._height;
		this.root.position.set(cfg.screen.left,cfg.screen.top);
		
		this.app.stage.addChild(this.root);

		Frame.add(this.app.render);
	}
	/**
	 * 
	 * @param {object} option {type:"sprite || container || particleContainer",data:{}}
	 * @return {} 渲染对象
	 * @example {
	 * 	type:"sprite || container || particleContainer",
	 * 	data:{
	 * 		url: "images/xx.png",
	 * 		width: 10,
	 * 		height: 10,
	 * 		x: 0,
	 * 		y: 0
	 * 	},
	 * 	children: [
	 * 		{type:"",data:{},children:[]},
	 * 		{}
	 * 	]
	 * } 
	 */
	static create(option,parent){
		let o = creater[option.type](option.data),i,leng;
		if(parent){
			parent.addChild(o);
		}else{
			this.app.stage.addChild(o);
		}
		if(option.children && option.children.length){
			for(i=0, leng = option.children.length; i < leng; i++){
				this.create(option.children[i],o);
			}
		}
		return o;
	}
	/**
	 * @description 移除渲染对象
	 * @param obj 渲染对象
	 */
	static remove(obj){
		obj.distory();
	}
}