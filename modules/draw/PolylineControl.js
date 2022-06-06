import { Cesium } from '@dc-modules/namespace'
var PolylineControl = {
    typename: "polyline",
    startDraw: function (dataSource, attribute) {
        var entityattr = this.attribute2Entity(attribute);

        var entity = dataSource.entities.add({
            //name: 'Entity ' + arrEntity.length,
            polyline: entityattr,
            attribute: attribute
        });

        return entity;
    },
    attribute2Entity: function (attribute, entityattr) {
        attribute=attribute||{};
        attribute.style=attribute.style||{};
        if (entityattr == null) {
            entityattr = {
                followSurface: true,
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
                case "lineType":    //跳过扩展其他属性的参数
                case "color":
                case "opacity":
                case "outline":
                case "outlineWidth":
                case "outlineColor":
                case "outlineOpacity":
                    break;
            }
        }

        var color = new Cesium.Color.fromCssColorString(attribute.style.color || "#FFFF00")
                            .withAlpha(Number(attribute.style.opacity || 1.0));

        switch (attribute.style.lineType) {
            default:
            case "solid"://实线 
                if (attribute.style.outline) {
                    //存在衬色时
                    entityattr.material = new Cesium.PolylineOutlineMaterialProperty({
                        color: color,
                        outlineWidth: Number(attribute.style.outlineWidth || 1.0),
                        outlineColor: new Cesium.Color.fromCssColorString(attribute.style.outlineColor || "#FFFF00")
                            .withAlpha(Number(attribute.style.outlineOpacity || attribute.style.opacity || 1.0))
                    });
                } else {
                    entityattr.material = color;
                }
                break;
            case "dash"://虚线
                if (attribute.style.outline) {
                    //存在衬色时
                    entityattr.material = new Cesium.PolylineDashMaterialProperty({
                        dashLength:attribute.style.dashLength ||attribute.style.outlineWidth || 16.0,
                        color: color,
                        gapColor:new Cesium.Color.fromCssColorString(attribute.style.outlineColor || "#FFFF00")
                            .withAlpha(Number(attribute.style.outlineOpacity || attribute.style.opacity || 1.0))
                    })
                } else {
                    entityattr.material = new Cesium.PolylineDashMaterialProperty({
                        dashLength:attribute.style.dashLength || 16.0,
                        color: color
                    })
                }
            
                break;
            case "glow"://发光线
                entityattr.material = new Cesium.PolylineGlowMaterialProperty({
                    glowPower:attribute.style.glowPower || 0.1,
                    color: color
                })
                break;
            case "arrow"://箭头线
                entityattr.material = new Cesium.PolylineArrowMaterialProperty(color)
                break;
                
                
        }




        return entityattr;
    },
    getEditor: function (dataSource, entity, options) {
        return new _Editor(dataSource, entity, options);
    },
    setPositions: function (entity, positions) {
        entity.polyline.positions.setValue(positions);
    },
    getPositions: function (entity) {
        return entity.polyline.positions._value;
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

export default PolylineControl;