const { Cesium } = DC.Namespace
import BaseLabel from './BaseLabel'
import CesiumUtils from '../utils/CesiumUtils';
import LabelUtils from './LabelUtils'
import CustomElements from '../CustomGeometrys/CustomElements.js';

class TaperLabel extends BaseLabel {
    constructor(viewer) {
        super(viewer)
        this.viewer = viewer;     
    }

    //创建实体
    _create(options, getCreateID){
        let viewer = this._viewer;
        let id = Cesium.defaultValue(options.id, CesiumUtils.getID(10));
        
        if (id.indexOf('billboard') >= 0) {
            id = id.substring(9);
        }
        let text = Cesium.defaultValue(options.text, '请输入:');
        let size = Cesium.defaultValue(options.size, 3);
        let color = Cesium.defaultValue(options.color, 'rgba(94, 170, 241, 1)');
        let position = Cesium.defaultValue(options.position, [108.933337, 34.26178, 200]);
        let isChange = Cesium.defaultValue(options.isChange, true);
        getCreateID = Cesium.defaultValue(getCreateID, function() {});
        let scene = viewer.scene;
        let ellipsoid = viewer.scene.globe.ellipsoid;

        //添加标签6的canvas
        let canvas = LabelUtils.createHiDPICanvas(100, 50, 25);
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 100, 50);
        ctx.strokeStyle = color;
        ctx.font = '6px 微软雅黑';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        let str = text.length;
        let roll = Math.ceil(str / 14) <= 3 ? Math.ceil(str / 14) : 3;
        let rolladd = 1;
        while (rolladd <= roll) {
            ctx.fillText(text.substring((rolladd - 1) * 14, rolladd * 14), 50, 25 + (rolladd - 1) * 7);
            rolladd++;
        }

        //添加billboard
        let entitys = this._viewer.entities.add({
            description: { heights: position[2], color: color, text: text, size: size },
            id: 'billboard' + id,
            position: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]),
            billboard: {
                image: canvas,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                scale: size,
                width: 50,
                height: 25,
                sizeInMeters: isChange
            },
            cylinder: {
                length: 600 + position[2],
                topRadius: 200,
                bottomRadius: 200,
                material: new Cesium.Color(1, 1, 1, 0.005),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });

        //添加实体1
        let instance = new Cesium.GeometryInstance({
            id: 'billboard' + id + 'instance1',
            geometry: new CustomElements(),
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(position[0], position[1], position[2]))),
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.5, 0.8, 1, 0.5))
            }
        });

        //添加实体2
        let instance2 = new Cesium.GeometryInstance({
            id: 'billboard' + id + 'instance2',
            geometry: Cesium.GeometryPipeline.toWireframe(new CustomElements()),
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(position[0], position[1], position[2]))),
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 1.0, 0.0, 1))
            }
        });

        //添加实体
        let testPrimitive = new Cesium.Primitive({
            geometryInstances: instance,
            appearance: new Cesium.PerInstanceColorAppearance({
                flat: true,
                fabric: {
                    type: 'Wood',
                    uniforms: {
                        lightWoodColor: new Cesium.Color(0.7, 0.4, 0.1, 1.0),
                        darkWoodColor: new Cesium.Color(0.3, 0.1, 0.0, 1.0),
                        ringFrequency: 4.0,
                        grainFrequency: 18.0
                    }
                }
            }),
            asynchronous: false
        });

        //添加实体的边框
        let testPrimitive2 = new Cesium.Primitive({
            geometryInstances: instance2,
            appearance: new Cesium.PerInstanceColorAppearance({
                flat: true
            }),
            asynchronous: false
        });

        scene.primitives.add(testPrimitive);
        scene.primitives.add(testPrimitive2);

        let testPrimitiveRotate = 0;
        scene.postRender.addEventListener(function() {
            testPrimitiveRotate += 2;
            if (testPrimitiveRotate > 360) {
                testPrimitiveRotate = 0;
            }

            //将billboard的position动态给旋转的实体
            let newPosition = LabelUtils.transCoordinate(viewer, entitys.position.getValue(0), entitys.description.getValue(0).heights - 10 >= 50 ? entitys.description.getValue(0).heights - 10 : 50);

            let m = Cesium.Transforms.eastNorthUpToFixedFrame(newPosition);

            Cesium.Matrix4.multiplyByUniformScale(m, (entitys.description.getValue(0).size * 1.0 / 3.0) || 1.0, m);
            //RotateX为旋转角度，转为弧度再参与运算
            let m1 = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(testPrimitiveRotate));

            //矩阵计算m
            Cesium.Matrix4.multiplyByMatrix3(m, m1, m);

            //赋值
            testPrimitive.modelMatrix = m;
            testPrimitive2.modelMatrix = m;
        });

        let st = {
            id: entitys.id,
            position: position
        };
        getCreateID(st);
    }

    //更新实体
    _update(option){
        let viewer = this._viewer;
        // let option = this.options;
        if (LabelUtils.pdValues(option)) {
            if (LabelUtils.pdValues(option.id)) {
                let entity = viewer.entities.getById(option.id);
                if (LabelUtils.pdValues(entity)) {
                    if (LabelUtils.pdValues(option.color)) {
                        let text = option.text ? option.text : entity.description.getValue().text;
                        let canvas2 = LabelUtils.updateCanvas6(text, option.color);
                        entity.billboard.image.setValue(canvas2);
                        entity.description.getValue().color = option.color;
                    }
                    if (LabelUtils.pdValues(option.text)) {
                        let color = option.color ? option.color : entity.description.getValue().color;
                        let canvas = LabelUtils.updateCanvas6(option.text, color);
                        entity.billboard.image.setValue(canvas);
                        entity.description.getValue().text = option.text;
                    }
                    if (LabelUtils.pdValues(option.height)) {
                        let cartesian = entity.position._value;
                        let cartesian2 = LabelUtils.transCoordinate(viewer, cartesian, option.height);
                        entity.position._value = cartesian2;
                        entity.description.getValue().heights = option.height;
                    }
                    if (LabelUtils.pdValues(option.size)) {
                        entity.billboard.scale = option.size;
                        entity.description.getValue().size = option.size;
                    }
                }
            }
        }
    }
}
export default TaperLabel

