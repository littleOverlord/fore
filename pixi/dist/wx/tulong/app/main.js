/****************** 导入 ******************/
//mod
import './player';
import './equip'; //local use

import Scene from '../libs/ni/scene';
import Loader from '../libs/ni/loader';
import { AppEmitter } from './appEmitter';
/****************** 导出 ******************/

/**
 * 游戏主函数
 */

export default class Main {
  constructor(cfg) {
    let loadCount = 2,
        jsonData,
        loadOk = function () {
      if (loadCount == 0) {
        Scene.createSpriteSheets(jsonData);
        AppEmitter.emit("intoMain");
      }
    };

    console.log(cfg);
    let app = Scene.Application({
      width: cfg.screen.width,
      height: cfg.screen.height,
      antialias: true,
      transparent: false,
      view: canvas,
      resolution: 1
    }, cfg);
    Loader.add(["images/ui.png", "images/ani/M_S_043.png", "images/ani/M_S_002.png"], function () {
      loadCount -= 1;
      loadOk();
    });
    Loader.loadJson(["images/ani/M_S_043.json", "images/ani/M_S_002.json", "images/ui.json"], function (res) {
      console.log(res);
      jsonData = res;
      loadCount -= 1;
      loadOk();
    });
    console.log(app);
  }

}
/****************** 本地 ******************/