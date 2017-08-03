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
        if (entries.pop()) entries.pop();
        return entries.join('/');
    }

    function loadByURL(url: string, type: string) {
        return new Promise<any>(resolve => RES.getResByUrl(url, resolve, null, type));
    }

    function loadByKey(key: string) {
        return new Promise<any>(resolve => RES.getResAsync(key, resolve, null));
    }

    export function loadSpineByURL(jsonURL: string, atlasURL?: string, pngURLs?: string[]) {
        let baseURL = dirname(jsonURL) + basename(jsonURL, '.json');
        if (!atlasURL) {
            atlasURL = baseURL + '.atlas';
        }
        if (!pngURLs) {
            pngURLs = [baseURL + '.png'];
        }
        return Promise.all([
            loadByURL(jsonURL, RES.ResourceItem.TYPE_JSON),
            loadByURL(atlasURL, RES.ResourceItem.TYPE_TEXT),
            ...pngURLs.map(pngURL => loadByURL(pngURL, RES.ResourceItem.TYPE_IMAGE))

        ]).then(([jsonFile, atlasFile, ...pngFiles]) => {
            let textures = {};
            for (let i = 0; i < pngFiles.length; i++) {
                let pngname = basename(pngURLs[i]);
                textures[pngname] = pngFiles[i];
            }
            let atlas = spine.createTextureAtlas(atlasFile, textures);
            let skelData = spine.createSkeletonData(jsonFile, atlas);
            let renderer = new spine.SkeletonRenderer(skelData);
            return new spine.SkeletonAnimation(renderer);
        });
    }

    export function loadSpineByKey(jsonKey: string, atlasKey?: string, pngKeys?: string[]) {
        /** exclude dot from extname to work with egret resource alias */
        let baseKey = basename(jsonKey, 'json');
        if (!atlasKey) atlasKey = baseKey + 'atlas';
        if (!pngKeys) pngKeys = [baseKey + 'png'];

        return Promise.all([
            loadByKey(jsonKey),
            loadByKey(atlasKey),
            ...pngKeys.map(loadByKey)

        ]).then(([jsonFile, atlasFile, ...pngFiles]) => {
            let textures = {};
            for (let i = 0; i < pngFiles.length; i++) {
                /** workaround with egret resource alias key */
                let pngname = basename(basename(pngKeys[i], '_png'), '.png') + '.png';
                textures[pngname] = pngFiles[i];
            }
            let atlas = spine.createTextureAtlas(atlasFile, textures);
            let skelData = spine.createSkeletonData(jsonFile, atlas);
            let renderer = new spine.SkeletonRenderer(skelData);
            return new spine.SkeletonAnimation(renderer);
        });
    }
}