import { Cesium } from '@dc-modules/namespace'
var EllipsoidControl = {
    typename: "ellipsoid",
    startDraw: function (dataSource, attribute) {
        var entityattr = this.attribute2Entity(attribute);

        var entity = dataSource.entities.add({
            //name: 'Entity ' + arrEntity.length,
            ellipsoid: entityattr,
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
                fill: true
            };
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
                case "widthRadii":
                case "heightRadii":
                    break;
                case "outlineColor":    //边框颜色
                    entityattr.outlineColor = new Cesium.Color.fromCssColorString(value || "#FFFF00")
                        .withAlpha(attribute.style.outlineOpacity || attribute.style.opacity || 1.0);
                    break;
                case "color":       //填充颜色
                    entityattr.material = new Cesium.Color.fromCssColorString(value || "#FFFF00")
                            .withAlpha(Number(attribute.style.opacity || 1.0));
                    break;
                case "extentRadii":    //球体长宽高半径
                    var extentRadii = attribute.style.extentRadii || 100;
                    var widthRadii = attribute.style.widthRadii || 100;
                    var heightRadii = attribute.style.heightRadii || 100;
                    entityattr.radii = new Cesium.Cartesian3(extentRadii, widthRadii, heightRadii);
                    break;
            }
        }


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


export default EllipsoidControl;