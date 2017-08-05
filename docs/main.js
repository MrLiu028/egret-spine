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
            return __generator(this, function (_a) {
                this.createTank();
                this.createBoy1();
                this.createBoy2();
                return [2 /*return*/];
            });
        });
    };
    Main.prototype.createTank = function () {
        return __awaiter(this, void 0, void 0, function () {
            var tank, track;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, spine.SkeletonAnimation.createAsync('tank_json', 'tank_atlas', ['tank_png'])];
                    case 1:
                        tank = _a.sent();
                        this.addAnimation(tank, 850, 480);
                        track = tank.play('drive');
                        _a.label = 2;
                    case 2: return [4 /*yield*/, track.whenComplete()];
                    case 3:
                        if (!_a.sent()) return [3 /*break*/, 4];
                        tank.scaleX *= -1;
                        tank.x = tank.scaleX > 0 ? 850 : 250;
                        return [3 /*break*/, 2];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.createBoy1 = function () {
        return __awaiter(this, void 0, void 0, function () {
            var boy, names, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        boy = spine.SkeletonAnimation.create('spineboy_json');
                        this.addAnimation(boy, 240, 240);
                        names = boy.skeleton.data.animations.map(function (anim) { return anim.name; });
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 4];
                        // wait for animation end.
                        return [4 /*yield*/, boy.play(names[i], 1).whenEnd()];
                    case 2:
                        // wait for animation end.
                        _a.sent();
                        i = (i + 1) % names.length;
                        _a.label = 3;
                    case 3:
                        i = ++i % names.length;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.createBoy2 = function () {
        return __awaiter(this, void 0, void 0, function () {
            var boy, track, step, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, spine.SkeletonAnimation.createByURL('resource/assets/spineboy.json')];
                    case 1:
                        boy = _b.sent();
                        this.addAnimation(boy, 720, 240);
                        boy.scaleX *= -1;
                        track = boy.play('run');
                        step = 0;
                        _b.label = 2;
                    case 2:
                        _a = 'footstep';
                        return [4 /*yield*/, track.whenEvent()];
                    case 3:
                        if (!(_a == (_b.sent()))) return [3 /*break*/, 4];
                        if (++step % 5 == 0) {
                            // Play another animation on track 1.
                            boy.play('shoot', 1, 1);
                        }
                        return [3 /*break*/, 2];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Main.prototype.addAnimation = function (animation, x, y) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                animation.x = x;
                animation.y = y;
                animation.scaleX = animation.scaleY = 200 / animation.height;
                this.addChild(animation);
                this.enableDragging(animation);
                return [2 /*return*/];
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
    Main.prototype.test = function () {
        return __awaiter(this, void 0, void 0, function () {
            var boy, track, step, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        boy = spine.SkeletonAnimation.create('spineboy_json');
                        track = boy.play('walk');
                        step = 0;
                        _b.label = 1;
                    case 1:
                        _a = 'footstep';
                        return [4 /*yield*/, track.whenEvent()];
                    case 2:
                        if (!(_a == (_b.sent()))) return [3 /*break*/, 3];
                        if (++step % 5 == 0) {
                            // Play another animation on track 1.
                            boy.play('shoot', 1, 1);
                        }
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return Main;
}(egret.DisplayObjectContainer));
