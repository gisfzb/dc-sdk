const { Cesium } = DC.Namespace

import CesiumUtils from '../utils/CesiumUtils';

var findedGltflayer;
//控制gltf的显示
var isShow = false;

function GltfLayers(viewer, options) {
    this.viewer = viewer;
    this.options = options;
    options.gltfLayers = Cesium.defaultValue(options.gltfLayers, [{ id: 'gltf' + CesiumUtils.getID(10), url: 'https://a.amap.com/jsapi_demos/static/gltf/Duck.gltf', position: [108.942337, 34.26978, 0] }]);
}

GltfLayers.prototype.add = function() {
    var that = this;
    this.options.gltfLayers.forEach(function(gltflayer) {
        var position = gltflayer.position;
        var url = gltflayer.url;
        var id = gltflayer.id;

        var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]));
        that.viewer.scene.primitives.add(
            Cesium.Model.fromGltf({
                id: id,
                url: url,
                modelMatrix: modelMatrix,
                maximumScreenSpaceError: 16
            })
        );
    });
};

GltfLayers.prototype.find = function(id) {
    this.viewer.scene.primitives._primitives.forEach(function(item) {
      // 暂时不知道在循环什么
        if (item instanceof Cesium.Model) {
            if (item.id === id) {
                findedGltflayer = item;
            }
        }
    });
    if (findedGltflayer) {
        return findedGltflayer;
    }
};

GltfLayers.prototype.delete = function(id) {
    this.viewer.scene.primitives.remove(this.find(id));
};

GltfLayers.prototype.show = function(id) {
    this.find(id).show = !isShow;
};

GltfLayers.prototype.fly = function(id) {
    this.viewer.zoomTo(this.find(id));
};
export default GltfLayers;
