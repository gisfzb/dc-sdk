/*
 * @Author: your name
 * @Date: 2020-03-27 09:38:24
 * @LastEditTime: 2020-04-16 11:47:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \map3d-designer-sdk\Source\Map\Layers\BaseImageryLayers.js
 */

const { Cesium } = DC.Namespace


var defaultOptions = []
function BaseImageryLayers(viewer, options) {
    this.options = Cesium.defaultValue(options, defaultOptions);
    this.viewer = viewer;
    this.createBaseImageryLayers();
}

// eslint-disable-next-line no-undef
Object.defineProperties(BaseImageryLayers.prototype, {
    /**
     * Gets the parent container.
     * @memberof Geocoder.prototype
     *
     * @type {Element}
     */
    container: {
        get: function() {
            return this._container;
        }
    }
});
BaseImageryLayers.prototype.createBaseImageryLayers = function() {
    var that = this;
    if (this.options.length > 0) { this.viewer.imageryLayers.removeAll(); }
    // let newOptis = []
    // newOptis = that.options
    this.options.forEach(function(layer) {
        var imageryProvider = null;
        switch (layer.type) {
            case "ArcGisMapServerImageryProvider":
                imageryProvider = new Cesium.ArcGisMapServerImageryProvider(layer);
                break;
            case "MapboxImageryProvider":
                imageryProvider = new Cesium.MapboxImageryProvider(layer);
                break;
            case "UrlTemplateImageryProvider":
                imageryProvider = new Cesium.UrlTemplateImageryProvider(layer);
                break;
            default:
                break;
        }
        if (imageryProvider != null) that.viewer.imageryLayers.add(new Cesium.ImageryLayer(imageryProvider, layer));
    });;
};
/**
 * 根据index获取底图对象
 */
BaseImageryLayers.prototype.getBaseImageryLayer = function(index) {
    return this.viewer.imageryLayers.get(index);
};
/**
 * 根据底图index更新底图
 */
BaseImageryLayers.prototype.updateBaseImageryLayer = function(index, option) {
    //扩展修改色调等
    var layer = this.viewer.imageryLayers.get(index);
    layer.show = Cesium.defaultValue(option.show, true);
    layer.brightness = Cesium.defaultValue(option.brightness, 1);
    layer.contrast = Cesium.defaultValue(option.contrast, 1);
    layer.hue = Cesium.defaultValue(option.hue, 0);
    layer.saturation = Cesium.defaultValue(option.saturation, 1);
    layer.gamma = Cesium.defaultValue(option.gamma, 1);
    layer.alpha = Cesium.defaultValue(option.alpha, 1);
};

BaseImageryLayers.prototype.getOptions = function() {
    return this.options;
};
export default BaseImageryLayers;
