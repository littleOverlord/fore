export class Fighter{
    constructor(id,skin,x,y,ani,anicallback){
        this.data.url = `images/ani/${skin}.json`;
        this.data.id = id;
        this.data.x = x;
        this.data.y = y;
        this.data.ani = ani;
        this.data.anicallback = anicallback;
    }
    type = "animatedSprite"
    data = {
        url:"images/ani/B_S_005.json",
        x:0,
        y:0,
        id:'',
        width: 356,
        height: 356,
        speed: 0.08,
        once: false,
        ani: "standby",
        actions: {},
        anicallback: Function
    }
}

export class DragonbonesFighter{
    constructor(id,skin,x,y,ani,anicallback){
        this.data.url = `images/ani/${skin}`;
        this.data.id = id;
        this.data.x = x;
        this.data.y = y;
        this.data.ani = ani;
        this.data.anicallback = anicallback;
    }
    type = "spine"
    data = {
        url:"images/ani/",
        x:0,
        y:0,
        id:'',
        ani: "standby",
        anicallback: Function
    }
}