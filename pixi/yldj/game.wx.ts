import './libs/wx/weapp-adapter';
import './libs/wx/api';
import './libs/wx/user';
import Rank from './libs/wx/rank';

import Config from "./config";
import Fs from "./libs/ni/fs";
import Http from "./libs/ni/http";
import Main from './app/main';

import  "./depend";
import "./libs/wx/fs";

declare const wx;
const cfg = new Config(wx.getSystemInfoSync());
Rank.init(cfg);
if(cfg.localRes){
    Fs.init(cfg,()=>{});
    // wx.loadFont("font/zkgdh.ttf");
    new Main(cfg);
}else{
    Http.get(`${cfg.remote}/${cfg.name}/depend.json`,"","",(err,data)=>{
        if(err){
            return console.log("get depend::",err)
        }
        let depend = JSON.parse(data);
        Fs.parseDepend(depend);
        Fs.init(cfg,()=>{
            new Main(cfg);
        })
        
    })
}


