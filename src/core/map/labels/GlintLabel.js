const { Cesium } = DC.Namespace
import BaseLabel from './BaseLabel'
import CesiumUtils from '../utils/CesiumUtils'
import LabelUtils from './LabelUtils';
import ElliposidFadeMaterialProperty from './Material/ElliposidFadeMaterial'

class GlintLabel extends BaseLabel {
    constructor(viewer){
        super(viewer);
        this.viewer = viewer;
    }
    _create(options, getCreateID){
        let viewer = this.viewer
        let id = Cesium.defaultValue(options.id, CesiumUtils.getID(10));
        if (id.indexOf('billboard') >= 0) {
            id = id.substring(9);
        }

        let size = Cesium.defaultValue(options.size, 3);
        let position = Cesium.defaultValue(options.position, [108.933337, 34.26178, 0]);
        let text = Cesium.defaultValue(options.text, '90%');
        let color = Cesium.defaultValue(options.color, 'rgba(94, 170, 241, 1)');
        let panColor = Cesium.defaultValue(options.panColor, 'rgba(94, 170, 241, 1)');
        let isChange = Cesium.defaultValue(options.isChange, true);
        panColor = LabelUtils.paseRgba(panColor, 'GLH');
        getCreateID = Cesium.defaultValue(getCreateID, function() { });
    
        let canvas = LabelUtils.createHiDPICanvas(100, 500, 2);
        let ctx = canvas.getContext('2d');
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.lineTo(50, 500);
        ctx.lineTo(50, 400);
        ctx.arc(50, 150, 48, 0.5 * Math.PI, 2.5 * Math.PI);
        ctx.stroke();
        ctx.font = '20px console';
        ctx.fillStyle = color;
        ctx.fillText(text, 25, 155);
        ctx.textAlign = 'center';
        let entity = viewer.entities.add({
            description: { heights: position[2], color: color, text: text },
            name: 'billboard' + id,
            id: 'billboard' + id,
            position: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
            billboard: {
                image: canvas,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                scale: size,
                width: 20,
                height: 100,
                sizeInMeters: isChange
            },
            cylinder: {
                length: 400,
                topRadius: 180,
                bottomRadius: 180,
                material: new Cesium.Color(1, 1, 1, 0.01)
            }, 
            ellipse: {
                semiMinorAxis: 50,
                semiMajorAxis: 50,
                height: position[2],
                material: new ElliposidFadeMaterialProperty(CesiumUtils.getCesiumColor(panColor), 4000)
            }
        });

        let st = {
            id: entity.id,
            position: options.position
        };
        getCreateID(st);
    }
    _update(option){
        let viewer = this.viewer;
        if (LabelUtils.pdValues(option)) {
            if (LabelUtils.pdValues(option.id)) {
                let entity = viewer.entities.getById(option.id);
                if (LabelUtils.pdValues(entity)) {
                    if (LabelUtils.pdValues(option.color) && LabelUtils.pdValues(option.text)) {
                        let canvas2 = LabelUtils.updateCanvas3(option.text, option.color);
                        entity.billboard._image._value = canvas2;
                    }
                    if (LabelUtils.pdValues(option.height)) {
                        let cartesian = entity.position._value;
                        let cartesian2 = LabelUtils.transCoordinate(viewer, cartesian, option.height);
                        entity.position._value = cartesian2;
                        entity.ellipse.height.setValue(option.height);
                        entity.description = { heights: option.height };
                    }
                    if (LabelUtils.pdValues(option.size)) {
                        entity.billboard.scale = option.size;
                    }
                    if (LabelUtils.pdValues(option.panColor)) {
                        option.panColor = LabelUtils.paseRgba(option.panColor, 'GLH');
                        entity.ellipse._material = new ElliposidFadeMaterialProperty(CesiumUtils.getCesiumColor(option.panColor), 4000);
                    }
                }
            }
        }
    }
}
export default GlintLabel

