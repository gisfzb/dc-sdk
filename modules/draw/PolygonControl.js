import { Cesium } from '@dc-modules/namespace'
var PolygonControl = {
    typename: "polygon",
    startDraw: function (dataSource, attribute) {
        var entityattr = this.attribute2Entity(attribute);

        var entity = dataSource.entities.add({
            //name: 'Entity ' + arrEntity.length,
            polygon: entityattr,
            attribute: attribute
        });

        return entity;
    },
    attribute2Entity: function (attribute, entityattr) {
        attribute=attribute||{};
        attribute.style=attribute.style||{};
        if (entityattr == null) {
            entityattr = {
                fill: true,
                classificationType: Cesium.ClassificationType.BOTH,
                hierarchy: new _DynamicProperty([])
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
                    break;
                case "outlineColor":    //边框颜色
                    entityattr.outlineColor = new Cesium.Color.fromCssColorString(value || attribute.style.color  || "#FFFF00")
                        .withAlpha(attribute.style.outlineOpacity || attribute.style.opacity || 1.0);
                    break;
                case "color":   //填充颜色
                    entityattr.material = new Cesium.Color.fromCssColorString(value || "#FFFF00")
                            .withAlpha(Number(attribute.style.opacity || 1.0));
                    break;
                case "extrudedHeight":  //高度 
                    var maxHight = _drawutils.getMaxHeightForPositions(entityattr.hierarchy._value);
                    entityattr.extrudedHeight = Number(value) + maxHight;
                    break;
                case "clampToGround"://贴地
                    entityattr.perPositionHeight =  !value;
                    break;
            }
        }

        //如果未设置任何material，默认设置随机颜色
        if (attribute.style.color == null) {
            entityattr.material = Cesium.Color.fromRandom({
                minimumGreen: 0.75,
                maximumBlue: 0.75,
                alpha: Number(attribute.style.opacity || 1.0)
            });
        }

        return entityattr;
    },
    getEditor: function (dataSource, entity, options) {
        if (entity.polygon.extrudedHeight) {
            return new _Editor1(dataSource, entity, options);
        } else {
            return new _Editor2(dataSource, entity, options);
        }
    },
    setPositions: function (entity, position) {
        entity.polygon.hierarchy = new _DynamicProperty(position);
        if (entity.attribute.style.extrudedHeight) {
            //存在extrudedHeight高度设置时
            var maxHight = _drawutils.getMaxHeightForPositions(position);
            entity.polygon.extrudedHeight = maxHight + Number(entity.attribute.style.extrudedHeight);
        }
    },
    getPositions: function (entity) {
        var arr = entity.polygon.hierarchy._value;

        if (arr.positions && this.isArray(arr.positions))
            return arr.positions;
        return arr;
    },
    isArray: function (obj) {
        return (typeof obj == 'object') && obj.constructor == Array;
    },
    getCoordinates: function (entity) {
        var positions = this.getPositions(entity);
        var coordinates = _drawutils.getCoordinates(positions);
        return coordinates;
    },
    toGeoJSON: function (entity) {
        var coordinates = this.getCoordinates(entity);

        if (coordinates.length > 0) {
            var first = coordinates[0];
            var last = coordinates[coordinates.length - 1];
            if (first[0] != last[0] || first[1] != last[1] || first[2] != last[2]) {
                coordinates.push(first);
            }
        }

        return {
            type: "Feature",
            properties: entity.attribute,
            geometry: {
                type: "Polygon",
                coordinates: [coordinates]
            }
        };
    }

};

export default PolygonControl;