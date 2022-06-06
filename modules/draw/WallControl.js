import { Cesium } from '@dc-modules/namespace'
var WallControl = {
    typename: "wall",
    startDraw: function (dataSource, attribute) {
        var entityattr = this.attribute2Entity(attribute);

        var entity = dataSource.entities.add({
            //name: 'Entity ' + arrEntity.length,
            wall: entityattr,
            attribute: attribute
        });

        return entity;
    },
    attribute2Entity: function (attribute, entityattr) {
        attribute=attribute||{};
        attribute.style=attribute.style||{};

        if (!entityattr) {
            entityattr = {
                fill: true,
                minimumHeights: [],
                maximumHeights: [],
                positions: new _DynamicProperty([])
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
                    entityattr.outlineColor = new Cesium.Color.fromCssColorString(value || "#FFFF00")
                        .withAlpha(attribute.style.outlineOpacity || attribute.style.opacity || 1.0);
                    break;
                case "color":   //填充颜色
                    entityattr.material = new Cesium.Color.fromCssColorString(value || "#FFFF00")
                            .withAlpha(Number(attribute.style.opacity || 1.0));
                    break;
            }
        }

        //如果未设置任何material，设置默认颜色
        if (entityattr.material == null) {
            entityattr.material = Cesium.Color.fromRandom({
                minimumGreen: 0.75,
                maximumBlue: 0.75,
                alpha: Number(attribute.style.opacity || 1.0)
            });
        }

        return entityattr;
    },
    getEditor: function (dataSource, entity, options) {
        return new _Editor(dataSource, entity, options);
    },
    setPositions: function (entity, position) {
        entity.wall.positions = new _DynamicProperty(position);

        if (entity.wall.maximumHeights && entity.wall.minimumHeights) {
            for (var i = 0; i < position.length; i++) {
                var carto = Cesium.Cartographic.fromCartesian(position[i]);
                entity.wall.minimumHeights._value[i] = Number(carto.height);
                entity.wall.maximumHeights._value[i] = Number(carto.height) + Number(entity.attribute.style.extrudedHeight);
            }
        }
    },
    getPositions: function (entity) {
        return entity.wall.positions._value;
    },

    setMaximumHeights: function (entity, maximumHeights) {
        entity.wall.maximumHeights = new _DynamicProperty(maximumHeights);
    },
    getMaximumHeights: function (entity) {
        return entity.wall.maximumHeights._value;
    },
    setMinimumHeights: function (entity, minimumHeights) {
        entity.wall.minimumHeights = new _DynamicProperty(minimumHeights);
    },
    getMinimumHeights: function (entity) {
        return entity.wall.minimumHeights._value;
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

export default WallControl;