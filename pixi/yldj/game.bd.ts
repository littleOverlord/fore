import Config from "./config";
import Fs from "./libs/ni/fs";
import Http from "./libs/ni/http";
import Main from './app/main';

import  "./depend";

declare const wx;
const cfg = new Config(wx.getSystemInfoSync());
if(cfg.localRes){
    Fs.init(cfg,()=>{});
    new Main(cfg);
}else{
    Http.get(`${cfg.remote}/${cfg.name}/depend.json`,"","",(err,data)=>{
        if(err){
            return console.log(err)
        }
        let depend = JSON.parse(data);
        Fs.parseDepend(depend);
        Fs.init(cfg,()=>{
            new Main(cfg);
        })
        
    })
}
