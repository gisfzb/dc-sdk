const { Cesium } = DC.Namespace
import BaseLabel from './BaseLabel'
import { DivIcon} from '../../overlay'
import { MouseEventType } from '../../event';
import CesiumUtils from '../utils/CesiumUtils'
import LabelUtils from './LabelUtils';
import ElliposidFadeMaterialProperty from '../utils/ElliposidFadeMaterial'

class ChartLabel extends BaseLabel {
    constructor(viewer){
        super(viewer)
        this.viewer = viewer;    
    }
    _create(options, getCreateID){
        let viewer = this.viewer;
        let id = Cesium.defaultValue(options.id, CesiumUtils.getID(10));
        if (id.indexOf('billboard') >= 0) {
            id = id.substring(9);
        }
        let text = Cesium.defaultValue(options.text, '请输入:');
        let height = Cesium.defaultValue(options.height, 150);
        let size = Cesium.defaultValue(options.size, 5);
        let color = Cesium.defaultValue(options.color, 'rgba(94, 170, 241, 1)');
        let panColor = Cesium.defaultValue(options.panColor, 'rgba(94, 170, 241, 1)');
        panColor = LabelUtils.paseRgba(panColor, 'GLH');
        let background = Cesium.defaultValue(options.background, 'background1');
        let position = Cesium.defaultValue(options.position, [108.933337, 34.26178, 200]);
        let isChange = Cesium.defaultValue(options.isChange, true);
        getCreateID = Cesium.defaultValue(getCreateID, function() {});

        let backgroundPicture;
        switch (background) {
            case 'background1':
                backgroundPicture = Cesium.buildModuleUrl('images/videoBorad.png');
                break;
            case 'background2':
                backgroundPicture = Cesium.buildModuleUrl('Images/labelbackground1.png');
                break;
            case 'background3':
                backgroundPicture = Cesium.buildModuleUrl('Images/labelbackground2.png');
                break;
            default:
                backgroundPicture = Cesium.buildModuleUrl('Images/videoBorad.png');
                break;
        }

        let img = new Image();
        img.src = backgroundPicture;
        img.onload = function(){

            let canvas = LabelUtils.createHiDPICanvas(100, 50, 25);
            let ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, 100, 50);
            ctx.drawImage(this, 0, 0, 100, 50);
            ctx.textAlign = 'center';
            ctx.strokeStyle = color;
            ctx.font = '6px 微软雅黑';
            ctx.fillStyle = color;
            let str = text.length;
            let roll = Math.ceil(str / 14) <= 3 ? Math.ceil(str / 14) : 3;
            let rolladd = 1;
            while (rolladd <= roll) {
                ctx.fillText(text.substring((rolladd - 1) * 14, rolladd * 14), 50, 25 + (rolladd - 1) * 7);
                rolladd++;
            }
            
            let entitys = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
                name: 'billboard' + id,
                id: 'billboard' + id,
                billboard: {
                    image: canvas,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    scale: size,
                    width: 100,
                    height: 50,
                    sizeInMeters: isChange
                },
                ellipse: {
                    semiMinorAxis: 150,
                    semiMajorAxis: 150,
                    height: position[2] - 100,
                    material: new ElliposidFadeMaterialProperty(CesiumUtils.getCesiumColor(panColor), 4000)
                }
            });

            let st = {
                id: entitys.id,
                position: position
            };
            getCreateID(st);
        }
    }
    _update(option){
  
    }

}
export default ChartLabel

