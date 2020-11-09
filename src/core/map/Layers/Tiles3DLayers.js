const { Cesium } = DC.Namespace

var defaultOptions = [];
function Tiles3DLayers(viewer, options) {
    this.options = Cesium.defaultValue(options, defaultOptions);
    this.viewer = viewer;
    this.createTiles3DLayers();
}
Tiles3DLayers.prototype.getOptions = function() {
    return this.options;
};

Tiles3DLayers.prototype.createTiles3DLayers = function() {
    var that = this;
    // if(this.options.length>0)this.viewer.imageryLayers.removeAll();
    this.options.forEach(function(layer) {
        that.addTile3DLayer(layer);

    });
};
Tiles3DLayers.prototype.addTile3DLayer = function(layer) {
    var that = this;
    var tileset = new Cesium.Cesium3DTileset({
        url: Cesium.IonResource.fromAssetId(layer.url)
    });

    that.viewer.scene.primitives.add(tileset);
    tileset.readyPromise.then(function(tileset) {
        tileset.asset.id = layer.id;
        that.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.5, -0.2, tileset.boundingSphere.radius * 4.0));
    });
    that.viewer.zoomTo(tileset);
};
/**
 * 根据ID获取图层
 */
Tiles3DLayers.prototype.getTile3DLayer = function(id) {
    var that = this;
    var layer = null;
    that.viewer.scene.primitives._primitives.forEach(function(item) {
        if (item.isCesium3DTileset) {
            if (item.asset.id == id) {
                layer = item;
            }
        }
    });
    return layer;
};
/**
 * 根据ID缩放到对应图层范围
 */
Tiles3DLayers.prototype.zoomTo = function(id) {
    var that = this;
    var tileset = that.getTile3DLayer(id);
    if (tileset) {
        that.viewer.zoomTo(tileset);
    } else {
        console.log("找不到对应的3DTiles");
    }
};
export default Tiles3DLayers;
