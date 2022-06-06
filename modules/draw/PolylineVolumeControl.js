import { Cesium } from '@dc-modules/namespace'
var PolylineVolumeControl = {
    typename: "polylineVolume",
    startDraw: function (dataSource, attribute) {
        var entityattr = this.attribute2Entity(attribute);

        var entity = dataSource.entities.add({
            polylineVolume: entityattr,
            attribute: attribute
        });

        return entity;
    },
    attribute2Entity: function (attribute, entityattr) {
        attribute=attribute||{};
        attribute.style=attribute.style||{};
        if (entityattr == null) {
            entityattr = {
                positions: new _DynamicProperty([])
                //positions: new Cesium.ConstantProperty([])
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
                case "radius":
                case "shape":
                    break;
                case "outlineColor":    //边框颜色
                    entityattr.outlineColor = new Cesium.Color.fromCssColorString(value || "#FFFF00")
                        .withAlpha(attribute.style.outlineOpacity || attribute.style.opacity || 1.0);
                    break;
                case "color":   //填充颜色
                    entityattr.material = new Cesium.Color.fromCssColorString(value || "#FFFF00")
                            .withAlpha(Number(attribute.style.opacity || 1.0));
                    break;
            }
        }

        //管道样式 
        attribute.style.radius = attribute.style.radius || 10;
        switch (attribute.style.shape) {
            default:
            case "pipeline":
                entityattr.shape = this._getCorridorShape1(attribute.style.radius);//（厚度固定为半径的1/3）
                break;
            case "circle":
                entityattr.shape = this._getCorridorShape2(attribute.style.radius);
                break;
            case "star":
                entityattr.shape = this._getCorridorShape3(attribute.style.radius);
                break;
        }

        return entityattr;
    },
    //管道形状1【内空管道】 radius整个管道的外半径 
    _getCorridorShape1: function (radius) {
        var hd = radius / 3;
        var startAngle = 0;
        var endAngle = 360;

        var pss = [];
        for (var i = startAngle; i <= endAngle; i++) {
            var radians = Cesium.Math.toRadians(i);
            pss.push(new Cesium.Cartesian2(radius * Math.cos(radians), radius * Math.sin(radians)));
        }
        for (var i = endAngle; i >= startAngle; i--) {
            var radians = Cesium.Math.toRadians(i);
            pss.push(new Cesium.Cartesian2((radius - hd) * Math.cos(radians), (radius - hd) * Math.sin(radians)));
        }
        return pss;
    },
    //管道形状2【圆柱体】 radius整个管道的外半径 
    _getCorridorShape2: function (radius) {
        var startAngle = 0;
        var endAngle = 360;

        var pss = [];
        for (var i = startAngle; i <= endAngle; i++) {
            var radians = Cesium.Math.toRadians(i);
            pss.push(new Cesium.Cartesian2(radius * Math.cos(radians), radius * Math.sin(radians)));
        }
        return pss;
    },
    //管道形状2【星状】 radius整个管道的外半径 ,arms星角的个数（默认6个角）
    _getCorridorShape3: function (radius, arms) {
        var arms = arms || 6;
        var angle = Math.PI / arms;
        var length = 2 * arms;
        var pss = new Array(length);
        for (var i = 0; i < length; i++) {
            var r = (i % 2) === 0 ? radius : radius / 3;
            pss[i] = new Cesium.Cartesian2(Math.cos(i * angle) * r, Math.sin(i * angle) * r);
        }
        return pss;
    },
    getEditor: function (dataSource, entity, options) {
        return new _Editor(dataSource, entity, options);
    },
    setPositions: function (entity, positions) { 
        entity.polylineVolume.positions.setValue(positions);
    },
    getPositions: function (entity) {
        return entity.polylineVolume.positions.getValue();
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
            geometry: {
                type: "LineString",
                coordinates: coordinates
            }
        };
    }

};

export default PolylineVolumeControl