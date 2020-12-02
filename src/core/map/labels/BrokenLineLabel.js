const { Cesium } = DC.Namespace
import BaseLabel from './BaseLabel'
import { MouseEventType } from '../../event';
import CesiumUtils from '../utils/CesiumUtils'
import LabelUtils from './LabelUtils';
import ElliposidFadeMaterialProperty from '../utils/ElliposidFadeMaterial'

class BrokenLineLabel extends BaseLabel {
    constructor(viewer){
        super(viewer)
        this.viewer = viewer
    }

    _create(options, getCreateID){
        let viewer = this.viewer
        let id = Cesium.defaultValue(options.id, CesiumUtils.getID(10));
        if (id.indexOf('billboard') >= 0) {
            id = id.substring(9);
        }

        let text = Cesium.defaultValue(options.text, '请输入:');
        let size = Cesium.defaultValue(options.size, 3);
        let color = Cesium.defaultValue(options.color, 'rgba(94, 170, 241, 1)');
        let position = Cesium.defaultValue(options.position, [108.933337, 34.26178, 0]);
        let isChange = Cesium.defaultValue(options.isChange, false);
        getCreateID = Cesium.defaultValue(getCreateID, function() {});

        let labelDiv = document.createElement('div');
        labelDiv.style.width = '300px';
        labelDiv.style.height = '200px';
        labelDiv.style.position = 'absolute';
        labelDiv.style.pointerEvents = 'none';
        let labelCanvas = LabelUtils.createHiDPICanvas(300, 200,2);
        labelDiv.appendChild(labelCanvas);

        let ctx = labelCanvas.getContext('2d');
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.lineTo(0, 200);
        ctx.lineTo(100, 100);
        ctx.lineTo(200, 100);        
        ctx.stroke();
        ctx.font = '12px console';
        ctx.fillStyle = color;
        ctx.fillText(text, 110, 90);

        let entity = viewer.entities.add({
            name: 'billboard' + id,
            id: 'billboard' + id,
            position: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
            billboard: {
                image: labelCanvas,
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                scale: size,
                width: 75,
                height: 50,
                sizeInMeters: isChange
            }
        });

        var st = {
            id: entity.id,
            position: position
        };

        getCreateID(st);
    }
    _update(option) {
        let viewer = this.viewer;
        if (LabelUtils.pdValues(option)) {
            if (LabelUtils.pdValues(option.id)) {
                let entity = viewer.entities.getById(option.id);
                if (LabelUtils.pdValues(entity)) {
                    if (LabelUtils.pdValues(option.text)) {
                        let canvas1 = LabelUtils.updateCanvas2(option.text, null);
                        entity.billboard._image._value = canvas1;
                    }
                    if (LabelUtils.pdValues(option.color) && LabelUtils.pdValues(option.text)) {
                        let canvas2 = LabelUtils.updateCanvas2(option.text, option.color);
                        entity.billboard._image._value = canvas2;
                    }
                    if (LabelUtils.pdValues(option.height)) {
                        let cartesian = entity.position._value;
                        let cartesian2 = LabelUtils.transCoordinate(viewer, cartesian, option.height);
                        entity.position._value = cartesian2;
                        entity.description = { heights: option.height };
                    }
                }
                if (LabelUtils.pdValues(option.size)) {
                    entity.billboard.scale = option.size;
                }
            }
        }
    }
    

}
export default BrokenLineLabel

