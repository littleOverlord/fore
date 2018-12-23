export class Fighter {
  constructor(skin, x, y, ani, anicallback) {
    this.data.url = `images/ani/${skin}.json`;
    this.data.x = x;
    this.data.y = y;
    this.data.ani = ani;
    this.data.actions = skin.indexOf("B_S") == 0 ? actionsCfg["B_S"] : actionsCfg["M_S"];
    this.data.anicallback = anicallback;
  }

  type = "animatedSprite";
  data = {
    url: "images/ani/B_S_005.json",
    x: 0,
    y: 0,
    width: 356,
    height: 356,
    speed: 0.08,
    once: false,
    ani: "standby",
    actions: {},
    anicallback: Function
  };
}
const actionsCfg = {
  "B_S": {
    "standby": [0, 4],
    "behit": [5, 7],
    "dodge": [8, 11],
    "attack": [12, 19],
    "attack1": [20, 31]
  },
  "M_S": {
    "standby": [0, 3],
    "behit": [4, 7],
    "dodge": [8, 11],
    "attack": [12, 20]
  }
};