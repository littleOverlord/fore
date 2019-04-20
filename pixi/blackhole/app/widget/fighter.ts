export class Fighter{
    constructor(id,skin,x,y,ani,anicallback){
        this.data.url = `images/ani/${skin}.json`;
        this.data.id = id;
        this.data.left = x;
        this.data.top = y;
        this.data.ani = ani;
        this.data.anicallback = anicallback;
    }
    type = "animatedSprite"
    data = {
        url:"images/ani/B_S_005.json",
        left:0,
        top:0,
        id:'',
        width: 356,
        height: 356,
        speed: 0.08,
        times: 0,
        ani: "standby",
        actions: {},
        anicallback: Function
    }
}

export class DragonbonesFighter{
    constructor(id,skin,armature,x,y,ani,anicallback){
        this.data.url = `images/ani/${skin}`;
        this.data.id = id;
        this.data.left = x;
        this.data.top = y;
        this.data.armature = armature;
        this.data.ani = ani;
        this.data.anicallback = anicallback;
    }
    type = "dragonbones"
    data = {
        url:"images/ani/",
        armature: "",
        left:0,
        top:0,
        id:'',
        ani: "standby",
        times:0,
        anicallback: Function
    }
}