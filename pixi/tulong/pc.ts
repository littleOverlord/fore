import { ipcRenderer } from 'electron';

import Fs from "./libs/ni/fs";
import Http from "./libs/ni/http";
import Main from './app/main';

var cfg = {
    platForm : "pc",
    name : "tulong",
    remote : "https://tulong.xianquyouxi.com",
    screen : {
        _width: 750,
        _height: 1334,
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        scale: 1
    },
    debug: false
};
const resetcfg = () => {
    let pcCfg = ipcRenderer.sendSync("request","getCfg");
	var windowWidth = document.documentElement.clientWidth ||  document.body.clientWidth, windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
	let w,h,l = 0,t = 0,
		sw = cfg.screen._width/windowWidth,
		sh = cfg.screen._height/windowHeight,
		s = Math.max(sw,sh);
	w = windowWidth * s;
	h = windowHeight * s;
	if(sw < s){
		l = Math.floor((w - cfg.screen._width)/2);
	}else if(sh < s){
		t = Math.floor((h - cfg.screen._height)/2);
	}
	cfg.screen.width = w;
	cfg.screen.height = h;
	cfg.screen.left = l;
	cfg.screen.top = t;
    cfg.screen.scale = s;
    cfg.debug = pcCfg.debug;
};
window.onload = () => {
    Http.get(`${cfg.remote}/depend.json`,"","",(err,data)=>{
        if(err){
            return console.log(err)
        }
        resetcfg();
        let depend = JSON.parse(data);
        Fs.parseDepend(depend);
        Fs.init(cfg,()=>{
            new Main(cfg);
        })
        
    })
    
}


