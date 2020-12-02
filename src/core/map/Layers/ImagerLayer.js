const { Cesium } = DC.Namespace
import BaseLayer from '../../layer/Layer'

class ImagerLayer extends BaseLayer {
    constructor(viewer, options){
        super(viewer, options);
        this.viewer = viewer;

        this.createBaseImageryLayers(options);
    }

    createBaseImageryLayers(options){
        let viewer = this.viewer
        options.forEach(item =>{
            let imageryProvider = null;
            switch (item.type) {
                case "ArcGisMapServerImageryProvider":
                    imageryProvider = new Cesium.ArcGisMapServerImageryProvider(item);
                    break;
                case "MapboxImageryProvider":
                    imageryProvider = new Cesium.MapboxImageryProvider(item);
                    break;
                case "UrlTemplateImageryProvider":
                    imageryProvider = new Cesium.UrlTemplateImageryProvider(item);
                    break;
                default:
                    break;
            }
            if (imageryProvider != null) {
                viewer.imageryLayers.add(new Cesium.ImageryLayer(imageryProvider, item));
            }
        });
    }

    //获取底图对象
    getBaseImageryLayer(index){
        return this.viewer.imageryLayers.get(index);
    }
    updateBaseImageryLayer(index, option){
        let layer = this.viewer.imageryLayers.get(index);
        layer.show = Cesium.defaultValue(option.show, true);
        layer.brightness = Cesium.defaultValue(option.brightness, 1);
        layer.contrast = Cesium.defaultValue(option.contrast, 1);
        layer.hue = Cesium.defaultValue(option.hue, 0);
        layer.saturation = Cesium.defaultValue(option.saturation, 1);
        layer.gamma = Cesium.defaultValue(option.gamma, 1);
        layer.alpha = Cesium.defaultValue(option.alpha, 1);
    }

    getOption(){
        return this.options;
    }
}

export default ImagerLayer;