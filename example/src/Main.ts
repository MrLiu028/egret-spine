class Main extends egret.DisplayObjectContainer {
    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage() {
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, e => RES.loadGroup("preload"), this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    private async loadComplete() {
        // synchronously create animation by resource key.
        let boy1 = spine.SkeletonAnimation.create('spineboy_json');
        this.addAnimation(boy1, 240, 480);

        // asynchronously create animation by url.
        let boy2 = await spine.SkeletonAnimation.createByURL('resource/assets/spineboy.json');
        this.addAnimation(boy2, 720, 480);
        boy2.scaleX *= -1;

        // create animation asynchronously by resource key.
        let tank = await spine.SkeletonAnimation.createAsync('tank_json', 'tank_atlas', ['tank_png']);
        /**
         * Simpler way:
         * spine.SkeletonAnimation.createAsync('tank_json');
         * 
         * Or more primitive way:
         * let skelData = await spine.loader.createSkeletonDataAsync('tank_json');
         * let renderer = new spine.SkeletonRenderer(skelData);
         * let animation = new spine.SkeletonAnimation(renderer);
         */
        tank.x = 850;
        tank.y = 480;
        tank.scaleX = tank.scaleY = 0.2;
        this.addChildAt(tank, 0);
        this.enableDragging(tank);

        // loop forever, and flip every time loop complete.
        let track = tank.play('drive');
        while (await track.whenComplete()) {
            tank.scaleX *= -1;
            tank.x = tank.scaleX > 0 ? 850 : 250;
        }
    }

    private async addAnimation(animation: spine.SkeletonAnimation, x: number, y: number) {
        let i = 0;
        let names = animation.skeleton.data.animations.map(anim => anim.name);

        animation.x = x;
        animation.y = y;
        animation.scaleX = animation.scaleY = 200 / animation.height;
        this.addChild(animation);
        this.enableDragging(animation);

        // play animations one by one
        while (true) {
            await animation.play(names[i], 1).whenEnd();
            i = (i + 1) % names.length;
        }
    }

    private enableDragging(target: egret.DisplayObject) {
        let dragging = false;
        let dx = 0, dy = 0;

        target.addEventListener(egret.TouchEvent.TOUCH_BEGIN, event => {
            dragging = true;
            dx = event.stageX - target.x;
            dy = event.stageY - target.y;
        }, this);

        this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, event => {
            if (dragging) {
                target.x = event.stageX - dx;
                target.y = event.stageY - dy;
            }
        }, this);

        target.addEventListener(egret.TouchEvent.TOUCH_END, event => dragging = false, this);
        target.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, event => dragging = false, this);
    }
}