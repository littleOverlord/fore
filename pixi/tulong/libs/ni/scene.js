/****************** 导入 ******************/
import * as PIXI from '../pixijs/pixi.min';
import Frame from './frame'
/****************** 导出 ******************/
export default class Scene {
	// render
	static app = function(){
		return app;
	};
	// root node
	static root;
	// object cache
	static cache = {}
	//SpriteSheets
	static spriteSheets = {}
	/**
	 * @description create scene
	 */
	static Application(option,cfg){
		app = new Application(option);
		//映射pixi坐标
		app.renderer.plugins.interaction.mapPositionToPoint = (point, x, y) => {
				point.x = x * cfg.screen.scale;
				point.y = y * cfg.screen.scale;
		}
		this.root = new Container();
		this.root.width = cfg.screen._width;
		this.root.height = cfg.screen._height;
		this.root.position.set(cfg.screen.left,cfg.screen.top);
		
		app.stage.addChild(this.root);

		Frame.add(function(){
			app.render();
		});
		return app;
	}
	/**
	 * 
	 * @param {object} option {type:"sprite || container || particleContainer",data:{}}
	 * @return {} 渲染对象
	 * @example {
	 * 	type:"sprite || container || particleContainer || text",
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
			app.stage.addChild(o);
		}
		if(option.name){
			this.cache[option.name] = o;
			o.on("removed",(function(name){
				return function(){
					console.log(`Delete the node which name is ${name} from cache!!`);
					delete Scene.cache[name];
				};
			})(option.name))
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
	/**
	 * @description 在某个节点上绑定事件
	 */
	static bindEvent(key,type,func){
		if(!this.cache[key]){
			return console.error(`The node is not created which key is ${key}`);
		}
		this.cache[key].interactive = true;
		this.cache[key].on(type,func);
	}
	/**
	 * @de
	 */
	static modifyTexture(param,name){
		if(typeof param == "string"){
			param = Scene.cache[param];
		}
		if(!param){
			return console.error(`Don't find the node!`);
		}
		param.texture = resources[name].texture;
	}
	static createSpriteSheets(data){
		for(let k in data){
			let texture = resources[k.replace(".json",".png")].texture.baseTexture;
			Scene.spriteSheets[k] = new Spritesheet(texture,data[k]);
			Scene.spriteSheets[k].parse(function(sps){
				console.log(sps);
			})
		}
		console.log(Scene.spriteSheets);
	}
}
/****************** 本地 ******************/
let Application = PIXI.Application,
		Container = PIXI.Container,
		resources = PIXI.loader.resources,
		TextureCache = PIXI.utils.TextureCache,
		Sprite = PIXI.Sprite,
		Rectangle = PIXI.Rectangle,
		Text = PIXI.Text,
		Spritesheet = PIXI.Spritesheet,
		//当前渲染实例 new PIXI.Application()
		app;
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
	},
	/**
	 * @param data {
	 * 	text: "",
	 * 	style: {
		* 	fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center',
		* 	wordWrapWidth:100, 换行宽度
		* 	wordWrap:true 是否换行
	 * 	}
	 * }
	 * PIXI.TextStyle http://pixijs.download/release/docs/PIXI.TextStyle.html
	 */
	text: (data) => {
		let o = new Text(data.text,data.style);
		data.width !== undefined && (o.width = data.width);
		data.height !== undefined && (o.height = data.height);
		o.position.set(data.x || 0, data.y || 0);
		return o;
	}
}