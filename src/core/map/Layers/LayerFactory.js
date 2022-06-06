const {Cesium}  = DC.Namespace

import {LayersType} from './LayersType'

import ImagerLayer from './ImagerLayer'
import GeoJsonLayer from '../../layer/GeoJsonLayer'

class LayerFactory{
    constructor(viewer){
        this.viewer = viewer;

        // this.imagerLayer = new ImagerLayer(this.viewer);
    }

    _create(option){
        if (option&&option.type) {
            let type = option.type
            switch (type) {
                case LayersType.IMAGE_LAYER:
                    new ImagerLayer(this.viewer, option.layers)
                    break;
                case LayersType.GEOJSON_LAYER:
                    new GeoJsonLayer('id', '**/**.geojson')
                    break;
                default:
                    break;
            }
        }
    }

    _remove(){

    }
}

export default LayerFactory;