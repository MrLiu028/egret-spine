namespace spine {
    interface Trigger<T> extends Promise<T> {
        resolve: (value: T | PromiseLike<T>) => void;
    }

    function getEventName(event: Event) {
        return event && event.data ? event.data.name : '';
    }

    class TrackObserver {
        private triggers = {};
        private completed: boolean;

        public constructor(
            private state: AnimationState,
            private animation: string,
            private track: number,
            private loops: number
        ) { }

        /**
         * 是否已结束
         */
        public get isCompleted() {
            return this.completed;
        }

        /**
         * 等待自定义事件
         * @return resolve值为自定义事件名称
         */
        public whenEvent(): Promise<string> {
            return this.observeEvent(EventType.event).then(getEventName);
        }

        /**
         * 等待自定义事件
         * @return resolve值为自定义事件对象
         */
        public whenEventData(): Promise<Event> {
            return this.observeEvent(EventType.event);
        }

        /**
         * 等待动画开始事件
         * @return resolve值为动画名称
         */
        public whenStart() {
            return this.observeEvent(EventType.start);
        }

        /**
         * 等待动画结束事件
         * @return resolve值为动画名称
         */
        public whenEnd() {
            return this.observeEvent(EventType.end);
        }

        /**
         * 等待动画循环结束事件
         * @return resolve值为动画名称
         */
        public whenComplete() {
            return this.observeEvent(EventType.complete);
        }

        /**
         * 等待spine事件
         * @return resolve值为动画名称或自定义事件对象
         */
        public observeEvent(type: EventType) {
            if (!this.completed) {
                let resolve, trigger = this.triggers[type];

                if (!trigger) {
                    trigger = new Promise(cb => resolve = cb);
                    trigger.resolve = resolve;
                    this.triggers[type] = trigger;
                }
                return trigger;
            }
            // in case of awaiting both "complete" and "end" event, that
            // "end" will never yield animation name since it is already completed.
            return Promise.resolve(type == EventType.end ? this.animation : null);
        }

        /**
         * 终止动画，等待的事件将返回空值。
         */
        public interrupt() {
            this.completed = true;
            this.clearObservations();
            this.state.clearTrack(this.track);
        }

        /**
         * 派发事件
         * @param type 事件类型
         * @param entry 动画轨道
         * @param event 自定义事件
         */
        public dispatchEvent(type: EventType, entry: TrackEntry, event?: Event) {
            let trigger: Trigger<Event | string>;

            if (trigger = this.triggers[type]) {
                this.triggers[type] = null;
                trigger.resolve(event || this.animation);
            }
            switch (type) {
                case EventType.complete: {
                    if (--this.loops <= 0) this.interrupt();
                    break;
                }
                // in case of clear track directly.
                case EventType.end: {
                    if (!this.completed) this.interrupt();
                    break;
                }
                case EventType.interrupt: {
                    this.clearObservations();
                    break;
                }
            }
        }

        private clearObservations() {
            for (let k of Object.keys(this.triggers)) {
                let trigger = this.triggers[k];
                if (trigger) {
                    this.triggers[k] = null;
                    trigger.resolve(null);
                }
            }
        }
    }

    export class SkeletonAnimation extends egret.DisplayObjectContainer {
        private observers: TrackObserver[] = [];
        private scheduleTimes: number = 0;
        private lastTime: number;
        private autoRun: boolean;
        private paused: boolean;

        public constructor(protected renderer: SkeletonRenderer) {
            super();
            const callback = this.onEventCallback;
            this.renderer.state.addListener({
                event: callback.bind(this, EventType.event),
                start: callback.bind(this, EventType.start),
                end: callback.bind(this, EventType.end),
                complete: callback.bind(this, EventType.complete),
                interrupt: callback.bind(this, EventType.interrupt),
                dispose: callback.bind(this, EventType.dispose)
            });
            this.touchEnabled = true;
            this.addChild(renderer);
            this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddedToStage, this);
            this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemovedFromStage, this);
        }

        public get skeleton(): Skeleton {
            return this.renderer.skeleton;
        }

        public get state(): AnimationState {
            return this.renderer.state;
        }

        public get stateData(): AnimationStateData {
            return this.renderer.stateData;
        }

        public get width() {
            return this.renderer.width;
        }

        public get height() {
            return this.renderer.height;
        }

        /**
         * 返回指定动画轨道的监听器
         * @param track 动画轨道索引
         */
        public observe(track: number) {
            return this.observers[track] || null;
        }

        /**
         * 设置动画皮肤
         * @param skinName 皮肤名称
         */
        public setSkinByName(skinName: string) {
            this.renderer.skeleton.setSkinByName(skinName);
        }

        /**
         * 设置从一个动画到另一个动画混合过渡的时间
         * @param anim1 要混合的动画
         * @param anim2 要混合的动画
         * @param duration 混合过渡时间
         */
        public setMix(anim1: string, anim2: string, time: number) {
            this.renderer.stateData.setMix(anim1, anim2, time);
        }

        /**
         * 从头开始播放一个动画
         * @param anim 动画名称
         * @param times 播放次数(默认无限)。[[1~N]: 循环播放 N 次, [小于1]: 无限循环播放]
         * @param track 播放轨道
         * @param autoRun 是否自动播放(默认true)。为true时将自动调用autoSchedule()。
         * @return 返回动画轨道监听器
         */
        public play(anim: string, times = 0, track = 0, autoRun = true): TrackObserver {
            let state = this.renderer.state;

            if (track < 0) track = 0;
            if (times <= 0) times = Infinity;
            if (autoRun) {
                this.autoRun = true;
                this.autoSchedule();
            }
            this.paused = false;
            state.setAnimation(track, anim, times != 1);

            return this.observers[track] = new TrackObserver(state, anim, track, ~~times);
        }

        /**
         * 停止指定轨道的动画
         * @param track 动画轨道索引
         */
        public stop(track: number) {
            this.renderer.state.clearTrack(track);
        }

        /**
         * 停止所有轨道的动画
         * @param reset 同时重置动作
         */
        public stopAll(reset?: boolean) {
            this.renderer.state.clearTracks();
            if (reset) this.renderer.skeleton.setToSetupPose();
        }

        /**
         * 暂停当前播放的动画
         */
        public pause() {
            this.paused = true;
        }

        /**
         * 恢复当前播放的动画
         */
        public resume() {
            this.paused = false;
        }

        /**
         * 自动调用更新动画(基于计数管理)
         * @return 调度计数
         */
        public autoSchedule() {
            if (0 == this.scheduleTimes++) {
                this.lastTime = egret.getTimer() * 0.001;
                this.addEventListener(egret.Event.ENTER_FRAME, this.onSchedule, this);
            }
            return this.scheduleTimes;
        }

        /**
         * 停止自动调用更新动画
         * @return 调度计数
         */
        public stopSchedule() {
            if (--this.scheduleTimes <= 0) {
                this.scheduleTimes = 0;
                this.removeEventListener(egret.Event.ENTER_FRAME, this.onSchedule, this);
            }
            return this.scheduleTimes;
        }

        private onSchedule() {
            let time = egret.getTimer() * 0.001;
            this.renderer.update(time - this.lastTime);
            this.lastTime = time;
        }

        private onAddedToStage() {
            if (this.scheduleTimes > 0) {
                this.lastTime = egret.getTimer() * 0.001;
                this.addEventListener(egret.Event.ENTER_FRAME, this.onSchedule, this);
            }
        }

        private onRemovedFromStage() {
            this.removeEventListener(egret.Event.ENTER_FRAME, this.onSchedule, this);
        }

        private onEventCallback(type: EventType, entry: TrackEntry, event?: Event) {
            let observer = this.observers[entry.trackIndex];
            if (observer) {
                observer.dispatchEvent(type, entry, event);
            }
            if (type == EventType.dispose) {
                this.observers[entry.trackIndex] = null;
                if (this.autoRun) this.autoRun = this.stopSchedule() > 0;
            }
        }
    }
}