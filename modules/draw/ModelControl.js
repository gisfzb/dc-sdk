import { Cesium } from '@dc-modules/namespace'
var ModelControl = {
    typename: "model",
    startDraw: function (dataSource, attribute) {
        var entityattr = this.attribute2Entity(attribute);

        var entity = dataSource.entities.add({
            model: entityattr,
            attribute: attribute
        });

        return entity;
    },
    attribute2Entity: function (attribute, entityattr) {
        attribute = attribute || {};
        attribute.style = attribute.style || {};
        if (entityattr == null) {
            //默认值
            entityattr = {
            }
        }

        //Style赋值值Entity
        for (var key in attribute.style) {
            var value = attribute.style[key];
            switch (key) {
                default:    //直接赋值
                    entityattr[key] = value;
                    break;
                case "silhouette":    //跳过扩展其他属性的参数
                case "silhouetteColor":
                case "silhouetteAlpha":
                case "silhouetteSize":
                case "fill":
                case "color":
                case "opacity":
                    break;
                case "modelUrl": //模型uri
                    entityattr.uri = value;
                    break;
            }
        }




        //轮廓
        if (attribute.style.silhouette) {
            entityattr.silhouetteColor = new Cesium.Color.fromCssColorString(attribute.style.silhouetteColor || "#FFFFFF")
                .withAlpha(Number(attribute.style.silhouetteAlpha || 1.0));
            entityattr.silhouetteSize = Number(attribute.style.silhouetteSize || 1.0);
        } else
            entityattr.silhouetteSize = 0.0;

        //透明度、颜色
        var opacity = attribute.style.hasOwnProperty('opacity') ? Number(attribute.style.opacity) : 1;
        if (attribute.style.fill)
            entityattr.color = new Cesium.Color.fromCssColorString(attribute.style.color || "#FFFFFF").withAlpha(opacity);
        else
            entityattr.color = new Cesium.Color.fromCssColorString("#FFFFFF").withAlpha(opacity);


        return entityattr;
    },
    attribute2Model: function (attribute, model) {
        //角度控制
        var heading = Cesium.Math.toRadians(Number(model.attribute.style.heading || 0.0));
        var pitch = Cesium.Math.toRadians(Number(model.attribute.style.pitch || 0.0));
        var roll = Cesium.Math.toRadians(Number(model.attribute.style.roll || 0.0));
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);

        if (model.orientation) {
            model.orientation = Cesium.Transforms.headingPitchRollQuaternion(model.position._value, hpr);
        }
    },
    getEditor: function (dataSource, entity, options) {
        return new _Editor(dataSource, entity, options);
    },
    setPositions: function (entity, position) {
        entity.position = new _DynamicProperty(position);
        var heading = Cesium.Math.toRadians(Number(entity.attribute.style.heading || 0.0));
        var pitch = Cesium.Math.toRadians(Number(entity.attribute.style.pitch || 0.0));
        var roll = Cesium.Math.toRadians(Number(entity.attribute.style.roll || 0.0));
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        entity.orientation = Cesium.Transforms.headingPitchRollQuaternion(entity.position._value, hpr);
    },
    getPositions: function (entity) {
        return [entity.position._value];
    },
    getCoordinates: function (entity) {
        var positions = this.getPositions(entity);
        var coordinates = _drawutils.getCoordinates(positions);
        return coordinates;
    },
    toGeoJSON: function (entity) {
        var coordinates = this.getCoordinates(entity);

        return {
            type: "Feature",
            properties: entity.attribute,
            geometry: { type: "Point", coordinates: coordinates[0] }
        };
    }
};


export default ModelControl;