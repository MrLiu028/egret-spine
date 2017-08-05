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
        this.createTank();
        this.createBoy1();
        this.createBoy2();
    }

    private async createTank() {
        /**
         * create animation asynchronously by resource key.
         * 
         * Simpler way:
         * spine.SkeletonAnimation.createAsync('tank_json');
         * 
         * Or more primitive way:
         * let skelData = await spine.loader.createSkeletonDataAsync('tank_json');
         * let renderer = new spine.SkeletonRenderer(skelData);
         * let animation = new spine.SkeletonAnimation(renderer);
         */
        let tank = await spine.SkeletonAnimation.createAsync('tank_json', 'tank_atlas', ['tank_png']);
        this.addAnimation(tank, 850, 480);

        // loop forever, and flip every time loop complete.
        let track = tank.play('drive');
        while (await track.whenComplete()) {
            tank.scaleX *= -1;
            tank.x = tank.scaleX > 0 ? 850 : 250;
        }
    }

    private async createBoy1() {
        // synchronously create animation by resource key.
        let boy = spine.SkeletonAnimation.create('spineboy_json');
        this.addAnimation(boy, 240, 240);

        // play animations one by one
        let names = boy.skeleton.data.animations.map(anim => anim.name);

        for (let i = 0; true; i = ++i % names.length) {
            // wait for animation end.
            await boy.play(names[i], 1).whenEnd();
            i = (i + 1) % names.length;
        }
    }

    private async createBoy2() {
        // asynchronously create animation by url.
        let boy = await spine.SkeletonAnimation.createByURL('resource/assets/spineboy.json');
        this.addAnimation(boy, 720, 240);
        boy.scaleX *= -1;

        // Play an animation. With default parameters,
        // that would play animation on track 0 and loop forever.
        let track = boy.play('run');
        let step = 0;

        // Observe an event.
        while ('footstep' == await track.whenEvent()) {
            if (++step % 5 == 0) {
                // Play another animation on track 1.
                boy.play('shoot', 1, 1);
            }
        }
    }

    private async addAnimation(animation: spine.SkeletonAnimation, x: number, y: number) {
        animation.x = x;
        animation.y = y;
        animation.scaleX = animation.scaleY = 200 / animation.height;
        this.addChild(animation);
        this.enableDragging(animation);
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

    async test() {
        // Create a skeleton animation. Or alternatively:
        // let boy = await spine.SkeletonAnimation.createAsync('spineboy_json');
        // let boy = await spine.SkeletonAnimation.createByURL('resource/assets/spineboy.json');
        let boy = spine.SkeletonAnimation.create('spineboy_json');

        // Play an animation. With default parameters,
        // that would play animation on track 0 and loop forever.
        let track = boy.play('walk');

        // Observe an event.
        let step = 0;
        while ('footstep' == await track.whenEvent()) {
            if (++step % 5 == 0) {
                // Play another animation on track 1.
                boy.play('shoot', 1, 1);
            }
        }
    }
}
