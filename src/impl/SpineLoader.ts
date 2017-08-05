/**
 * A series of functions for loading and creating skeleton data.
 * repo: https://github.com/fightingcat/egret-spine
 */
namespace spine.loader {

    /** TODO: deal with query and hash */
    function basename(url: string, extname = '') {
        let filename = url.substring(url.lastIndexOf('/') + 1);
        let extstart = filename.length - extname.length;

        if (filename.substring(extstart) == extname) {
            return filename.substring(0, extstart);
        }
        return filename;
    }

    /** TODO: deal with query and hash */
    function dirname(url: string) {
        let entries = url.split('/');
        if (!entries.pop()) entries.pop();
        return entries.join('/');
    }

    function loadByURL(url: string, type: string) {
        return new Promise<any>(resolve => RES.getResByUrl(url, resolve, null, type));
    }

    function loadByKey(key: string) {
        return new Promise<any>(resolve => RES.getResAsync(key, resolve, null));
    }

    /**
     * 创建一个以文件名为索引的资源表
     * @param keys 资源名称
     * @return 资源表
     */
    function getTextures(keys: string[]) {
        let textures = {};
        let images = keys.map(key => RES.getRes(key));

        for (let i = 0; i < keys.length; i++) {
            let pngName = basename(basename(keys[i], '_png'), '.png') + '.png';
            textures[pngName] = images[i];
        }
        return textures;
    }

    /**
     * 创建一个以文件名为索引的资源表, 并异步加载
     * @param keys 图片资源的key
     * @return Promise, resolve值为资源表
     */
    export function getTexturesAsync(keys: string[]) {
        return Promise.all(keys.map(loadByKey))
            .then(files => {
                let textures = {};
                for (let i = 0; i < keys.length; i++) {
                    let pngName = basename(basename(keys[i], '_png'), '.png') + '.png';
                    textures[pngName] = files[i];
                }
                return textures;
            });
    }

    /**
     * 创建一个以文件名为索引的资源表, 并异步加载
     * @param URLs 图片URL的数组
     * @return Promise, resolve值为资源表
     */
    export function getTexturesByURL(URLs: string[]) {
        return Promise.all(URLs.map(url => loadByURL(url, RES.ResourceItem.TYPE_IMAGE)))
            .then(files => {
                let textures = {};
                for (let i = 0; i < files.length; i++) {
                    let pngname = basename(URLs[i]);
                    textures[pngname] = files[i];
                }
                return textures;
            });
    }

    /**
     * 获取预加载的spine动画资源
     * @param jsonKey spine动画的json文件资源key
     * @param atlasKey spine动画的atlas文件资源key
     * @param pngKeys spine动画的图片文件资源key
     * @return 资源数组: [json文件, atlas文件, 图片资源表]
     */
    export function getSpine(jsonKey: string, atlasKey?: string, pngKeys?: string[]) {
        /** exclude dot from extname to work with egret resource alias */
        let baseKey = basename(jsonKey, 'json');
        if (!atlasKey) atlasKey = baseKey + 'atlas';
        if (!pngKeys) pngKeys = [baseKey + 'png'];
        return [
            RES.getRes(jsonKey),
            RES.getRes(atlasKey),
            getTextures(pngKeys)
        ];
    }

    /**
     * 异步加载spine动画资源
     * @param jsonKey spine动画的json文件资源key
     * @param atlasKey spine动画的atlas文件资源key
     * @param pngKeys spine动画的图片文件资源key
     * @return Promise, resolve值为资源数组: [json文件, atlas文件, 图片资源表]
     */
    export function getSpineAsync(jsonKey: string, atlasKey?: string, pngKeys?: string[]) {
        /** exclude dot from extname to work with egret resource alias */
        let baseKey = basename(jsonKey, 'json');
        if (!atlasKey) atlasKey = baseKey + 'atlas';
        if (!pngKeys) pngKeys = [baseKey + 'png'];

        return Promise.all([
            loadByKey(jsonKey),
            loadByKey(atlasKey),
            getTexturesAsync(pngKeys)
        ]);
    }

    /**
     * 异步加载spine动画资源
     * @param jsonURL spine动画的json文件URL
     * @param atlasURL spine动画的atlas文件URL
     * @param pngURLs spine动画的图片文件URL
     * @return Promise, resolve值为资源数组: [json文件, atlas文件, 图片资源表]
     */
    export function getSpineByURL(jsonURL: string, atlasURL?: string, pngURLs?: string[]) {
        let baseURL = dirname(jsonURL) + '/' + basename(jsonURL, '.json');
        if (!atlasURL) atlasURL = baseURL + '.atlas';
        if (!pngURLs) pngURLs = [baseURL + '.png'];

        return Promise.all([
            loadByURL(jsonURL, RES.ResourceItem.TYPE_JSON),
            loadByURL(atlasURL, RES.ResourceItem.TYPE_TEXT),
            getTexturesByURL(pngURLs)
        ]);
    }

    /**
     * 创建骨骼动画数据
     * @param jsonKey spine动画的json文件资源key
     * @param atlasKey spine动画的atlas文件资源key
     * @param pngKeys spine动画的图片文件资源key
     * @return 骨骼动画数据
     */
    export function createSkeletonData(jsonKey: string, atlasKey?: string, pngKeys?: string[]) {
        let [json, atlas, textures] = getSpine(jsonKey, atlasKey, pngKeys);
        let textureAtlas = spine.createTextureAtlas(atlas, textures);
        return spine.createSkeletonData(json, textureAtlas);
    }

    /**
     * 异步创建骨骼动画数据
     * @param jsonKey spine动画的json文件资源key
     * @param atlasKey spine动画的atlas文件资源key
     * @param pngKeys spine动画的图片文件资源key
     * @return Promise, resolve值为骨骼动画数据
     */
    export async function createSkeletonDataAsync(jsonKey: string, atlasKey?: string, pngKeys?: string[]) {
        let [json, atlas, textures] = await getSpineAsync(jsonKey, atlasKey, pngKeys);
        let textureAtlas = spine.createTextureAtlas(atlas, textures);
        return spine.createSkeletonData(json, textureAtlas);
    }

    /**
     * 异步创建骨骼动画数据
     * @param jsonURL spine动画的json文件URL
     * @param atlasURL spine动画的atlas文件URL
     * @param pngURLs spine动画的图片文件URL
     * @return Promise, resolve值为骨骼动画数据
     */
    export async function createSkeletonDataByURL(jsonURL: string, atlasURL?: string, pngURLs?: string[]) {
        let [json, atlas, textures] = await getSpineByURL(jsonURL, atlasURL, pngURLs);
        let textureAtlas = spine.createTextureAtlas(atlas, textures);
        return spine.createSkeletonData(json, textureAtlas);
    }
}