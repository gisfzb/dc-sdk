import { Cesium } from '@dc-modules/namespace'
var PointControl = {
    typename: "point",
    startDraw: function (dataSource, attribute) {
        var entityattr = this.attribute2Entity(attribute);

        var entity = dataSource.entities.add({
            point: entityattr,
            attribute: attribute
        });

        return entity;
    },
    attribute2Entity: function (attribute, entityattr) {
        attribute=attribute||{};
        attribute.style=attribute.style||{};
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
                case "opacity":     //跳过扩展其他属性的参数
                case "outlineOpacity":
                case "scaleByDistance_near":
                case "scaleByDistance_nearValue":
                case "scaleByDistance_far":
                case "scaleByDistance_farValue":
                case "distanceDisplayCondition_far":
                case "distanceDisplayCondition_near":
                    break;
                case "outlineColor":    //边框颜色
                    entityattr.outlineColor = new Cesium.Color.fromCssColorString(value || "#FFFF00")
                        .withAlpha(attribute.style.outlineOpacity || attribute.style.opacity || 1.0);
                    break;
                case "color":   //填充颜色
                    entityattr.color = new Cesium.Color.fromCssColorString(value || "#FFFF00")
                            .withAlpha(Number(attribute.style.opacity || 1.0));
                    break;
                case "scaleByDistance":   //是否按视距缩放
                    if (value) {
                        entityattr.scaleByDistance = new Cesium.NearFarScalar(
                            Number(attribute.style.scaleByDistance_near || 1000),
                            Number(attribute.style.scaleByDistance_nearValue || 1.0),
                            Number(attribute.style.scaleByDistance_far || 1000000),
                            Number(attribute.style.scaleByDistance_farValue || 0.1));
                    } else {
                        entityattr.scaleByDistance = null;
                    }
                    break;
                case "distanceDisplayCondition":   //是否按视距显示
                    if (value) {
                        entityattr.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(
                            Number(attribute.style.distanceDisplayCondition_near || 0),
                            Number(attribute.style.distanceDisplayCondition_far || 100000));
                    } else {
                        entityattr.distanceDisplayCondition = null;
                    }
                    break;
            }
        }



        //无边框时，需设置宽度为0
        if (!attribute.style.outline)
            entityattr.outlineWidth = 0.0;

        return entityattr;
    },
    getEditor: function (dataSource, entity, options) {
        return new _Editor(dataSource, entity, options);
    },
    setPositions: function (entity, position) {
        entity.position = new _DynamicProperty(position);
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


export default PointControl;