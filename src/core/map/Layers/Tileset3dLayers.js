/*
 * @Author: your name
 * @Date: 2020-04-21 11:32:45
 * @LastEditTime: 2020-04-27 09:43:05
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \map3d-designer-sdk\Source\Map\Layers\Tileset3dLayers.js
 */

const { Cesium } = DC.Namespace
import CesiumUtils from '../utils/CesiumUtils';
// 自己写的方法
import LabelUtils from '../Effect/Label/LabelUtils.js';


var defaultOptions = { tiles3DLayers: null };
//控制3dtile的显示和隐藏
var isShow = false;

//3dtile
function Tileset3dLayers(viewer, options) {
    this.options = Cesium.defaultValue(options, defaultOptions);
    this.viewer = viewer;
    this.tileset3dLayer = null;
}

Tileset3dLayers.prototype.add = function() {
    var that = this;
    // that.viewer.scene.globe.depthTestAgainstTerrain = true;
    this.options.tiles3DLayers = Cesium.defaultValue(this.options.tiles3DLayers, [{ id: 'tile3d' + CesiumUtils.getID(10), url: 'http://www.imapway.cn/mw3dsdk/tile1/tileset.json' }]);
    this.options.tiles3DLayers.forEach(function(tiles3DLayer) {
        var tileset = new Cesium.Cesium3DTileset({
            url: tiles3DLayer.url
        });
        if (LabelUtils.pdValues(tiles3DLayer.color)) {
            tileset.style = new Cesium.Cesium3DTileStyle({
                color: {
                	conditions: [
                	[
                	"${Floor} >= 20",
                	"rgb(120 ,50 ,172)"
                	],
                	[
                	"${floor} >= 15",
                	"rgb(71,222,220)"
                	],
                	[
                	"${floor} >= 10",
                	"rgb(17,79,111)"
                	],
                	[
                	"true",
                	"rgb(20 ,50 ,72)"
                	]
                	]
                }
            });
            tiles3DLayer.height = 35;
        }
        tiles3DLayer.height = Cesium.defaultValue(tiles3DLayer.height, 35);

        tileset.readyPromise.then(zoomToTileset);

        function zoomToTileset() {
            var boundingSphere = tileset.boundingSphere;
            that.viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0, -2.0, 0));
            that.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
            changeHeight(tiles3DLayer.height);
        }

        function changeHeight(height) {
            height = Number(height);
            if (isNaN(height)) {
                return;
            }
            var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
            var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
            var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
            var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
        }
        that.viewer.scene.primitives.add(tileset);
        that.viewer.zoomTo(tileset);
    });
};

Tileset3dLayers.prototype.find = function(url) {
    var tileset3dLayer;
    var collection = this.viewer.scene.primitives._primitives;
    collection.forEach(function(element) {
        if (element instanceof Cesium.Cesium3DTileset) {
            if (element.url === url) {
                tileset3dLayer = element;
            }
        }
    });
    return tileset3dLayer;
};

Tileset3dLayers.prototype.delete = function(url) {
    this.viewer.scene.primitives.remove(this.find(url));
};

Tileset3dLayers.prototype.flyTo = function(url) {
    this.viewer.zoomTo(this.find(url));
};

Tileset3dLayers.prototype.show = function(url) {
    this.find(url).show = !isShow;
};
export default Tileset3dLayers;
