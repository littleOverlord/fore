import './libs/wx/weapp-adapter';

import Config from "./config";
import Fs from "./libs/ni/fs";
import Http from "./libs/ni/http";
import Main from './app/main';
declare const wx;
const cfg = new Config(wx.getSystemInfoSync());
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

