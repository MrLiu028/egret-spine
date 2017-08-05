/**
 * Spine skeleton renderer for Egret.
 * repo: https://github.com/fightingcat/egret-spine
 */
namespace spine {
    /**
     * 创建骨骼数据
     * @param jsonData 骨骼动画的json文件内容
     * @param atlas 图集对象
     */
    export function createSkeletonData(jsonData: string | {}, atlas: spine.TextureAtlas) {
        let json = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(atlas));
        return json.readSkeletonData(jsonData);
    }

    /**
     * 创建图集
     * @param atlasData 图集的atlas文件内容
     * @param textures 图片资源表, 键值为图片名称, 值为egret加载后的Texture.
     */
    export function createTextureAtlas(atlasData: string, textures: Record<string, egret.Texture>) {
        return new spine.TextureAtlas(atlasData, (file: string) => {
            let tex = textures[file];
            return new AdapterTexture(tex.bitmapData);
        });
    }

    export class SkeletonRenderer extends egret.DisplayObjectContainer {
        public readonly skeleton: Skeleton;
        public readonly state: AnimationState;
        public readonly stateData: AnimationStateData;
        public readonly slotRenderers: SlotRenderer[] = [];

        public constructor(protected spineData: SkeletonData) {
            super();
            if (!spineData) {
                throw new Error('The spineData param is required.');
            }
            this.scaleY = -1;
            this.touchEnabled = true;
            this.stateData = new AnimationStateData(spineData);
            this.state = new AnimationState(this.stateData);
            this.skeleton = new Skeleton(spineData);
            this.skeleton.updateWorldTransform();

            for (let slot of this.skeleton.slots) {
                let renderer = new SlotRenderer();
                this.slotRenderers.push(renderer);
                this.addChild(renderer);
                renderer.renderSlot(slot, this.skeleton);
            }
        }

        public update(dt: number) {
            this.state.update(dt);
            this.state.apply(this.skeleton);
            this.skeleton.updateWorldTransform();

            let drawOrder = this.skeleton.drawOrder;
            let slots = this.skeleton.slots;

            for (let i = 0; i < drawOrder.length; i++) {
                this.setChildIndex(this.slotRenderers[drawOrder[i].data.index], i);
            }
            for (let i = 0; i < slots.length; i++) {
                let slot = slots[i];
                let bone = slot.bone;
                let attachment = slot.getAttachment();
                let slotRenderer = this.slotRenderers[i];

                slotRenderer.renderSlot(slot, this.skeleton);
            }
        }
    }

    class AdapterTexture extends Texture {
        public readonly spriteSheet: egret.SpriteSheet;

        public constructor(bitmapData: egret.BitmapData) {
            super(bitmapData.source);
            let texture = new egret.Texture();
            texture.bitmapData = bitmapData;
            this.spriteSheet = new egret.SpriteSheet(texture);
        }

        /** NIY */
        setFilters(minFilter: TextureFilter, magFilter: TextureFilter): void { }
        setWraps(uWrap: TextureWrap, vWrap: TextureWrap): void { }
        dispose(): void { }
    }

    export class SlotRenderer extends egret.DisplayObjectContainer {
        private currentSprite: egret.DisplayObject;
        private colorFilter = new egret.ColorMatrixFilter();

        public renderSlot(slot: Slot, skeleton: Skeleton) {
            let bone = slot.bone;
            let attachment = slot.getAttachment() as RegionAttachment;
            // update transform.
            this.x = bone.worldX;
            this.y = bone.worldY;
            this.rotation = bone.getWorldRotationX();
            this.scaleX = bone.getWorldScaleX();
            this.scaleY = bone.getWorldScaleY() * (skeleton.flipY ? -1 : 1);
            // update color.
            if (attachment) {
                let r = skeleton.color.r * slot.color.r * attachment.color.r;
                let g = skeleton.color.g * slot.color.g * attachment.color.g;
                let b = skeleton.color.b * slot.color.b * attachment.color.b;
                this.alpha = skeleton.color.a * slot.color.a * attachment.color.a;

                if (r == 1 && g == 1 && b == 1) {
                    this.filters = null;

                } else {
                    this.colorFilter.matrix[0] = r;
                    this.colorFilter.matrix[6] = g;
                    this.colorFilter.matrix[13] = b;
                    if (!this.filters) this.filters = [this.colorFilter];
                }
            }
            // only RegionAttachment is supported.
            if (attachment instanceof RegionAttachment) {
                let region = attachment.region as TextureAtlasRegion;
                let currentName = this.currentSprite ? this.currentSprite.name : '';
                let regionName = region ? region.name : '';
                this.visible = true;

                // attachment changed.
                if (currentName != regionName) {
                    if (this.currentSprite) {
                        this.currentSprite.visible = false;
                        this.currentSprite = null;
                    }
                    if (region) {
                        this.currentSprite = this.getChildByName(regionName) ||
                            this.createSprite(attachment, region);
                        this.currentSprite.visible = true;
                    }
                }

            } else {
                this.visible = false;
            }
        }

        private createSprite(attachment: RegionAttachment, region: TextureAtlasRegion) {
            let sheet = (region.texture as AdapterTexture).spriteSheet;
            let texture = sheet.getTexture(region.name) || region.rotate
                ? sheet.createTexture(
                    region.name,
                    region.x, region.y,
                    region.height, region.width,
                    region.offsetX, region.offsetY,
                    region.originalHeight, region.originalWidth
                )
                : sheet.createTexture(
                    region.name,
                    region.x, region.y,
                    region.width, region.height,
                    region.offsetX, region.offsetY,
                    region.originalWidth, region.originalHeight
                );
            let sprite = new egret.Bitmap(texture);
            this.addChild(sprite);
            sprite.name = region.name;
            sprite.x = attachment.x;
            sprite.y = attachment.y;
            sprite.anchorOffsetX = 0.5 * sprite.width;
            sprite.anchorOffsetY = 0.5 * sprite.height;
            sprite.scaleX = attachment.scaleX * (attachment.width / region.width);
            sprite.scaleY = -attachment.scaleY * (attachment.height / region.height);
            sprite.rotation = attachment.rotation;
            if (region.rotate) {
                sprite.rotation -= 90;
            }
            return sprite;
        }
    }
}
