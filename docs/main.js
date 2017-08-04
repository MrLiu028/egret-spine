var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        var _this = _super.call(this) || this;
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.onAddToStage, _this);
        return _this;
    }
    Main.prototype.onAddToStage = function () {
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, function (e) { return RES.loadGroup("preload"); }, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.loadComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    };
    Main.prototype.loadComplete = function () {
        return __awaiter(this, void 0, void 0, function () {
            var boy1, boy2, tank, track;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        boy1 = spine.SkeletonAnimation.create('spineboy_json');
                        this.addAnimation(boy1, 240, 480);
                        return [4 /*yield*/, spine.SkeletonAnimation.createByURL('resource/assets/spineboy.json')];
                    case 1:
                        boy2 = _a.sent();
                        this.addAnimation(boy2, 720, 480);
                        boy2.scaleX *= -1;
                        return [4 /*yield*/, spine.SkeletonAnimation.createAsync('tank_json', 'tank_atlas', ['tank_png'])];
                    case 2:
                        tank = _a.sent();
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
                        track = tank.play('drive');
                        _a.label = 3;
                    case 3: return [4 /*yield*/, track.whenComplete()];
                    case 4:
                        if (!_a.sent()) return [3 /*break*/, 5];
                        tank.scaleX *= -1;
                        tank.x = tank.scaleX > 0 ? 850 : 250;
                        return [3 /*break*/, 3];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.addAnimation = function (animation, x, y) {
        return __awaiter(this, void 0, void 0, function () {
            var i, names;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        names = animation.skeleton.data.animations.map(function (anim) { return anim.name; });
                        animation.x = x;
                        animation.y = y;
                        animation.scaleX = animation.scaleY = 200 / animation.height;
                        this.addChild(animation);
                        this.enableDragging(animation);
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 3];
                        return [4 /*yield*/, animation.play(names[i], 1).whenEnd()];
                    case 2:
                        _a.sent();
                        i = (i + 1) % names.length;
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.enableDragging = function (target) {
        var dragging = false;
        var dx = 0, dy = 0;
        target.addEventListener(egret.TouchEvent.TOUCH_BEGIN, function (event) {
            dragging = true;
            dx = event.stageX - target.x;
            dy = event.stageY - target.y;
        }, this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, function (event) {
            if (dragging) {
                target.x = event.stageX - dx;
                target.y = event.stageY - dy;
            }
        }, this);
        target.addEventListener(egret.TouchEvent.TOUCH_END, function (event) { return dragging = false; }, this);
        target.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, function (event) { return dragging = false; }, this);
    };
    return Main;
}(egret.DisplayObjectContainer));
