import { Cesium } from '@dc-modules/namespace'
var RectangleControl = {
    typename: "rectangle",
    startDraw: function (dataSource, attribute) {
        var entityattr = this.attribute2Entity(attribute);

        var entity = dataSource.entities.add({
            rectangle: entityattr,
            attribute: attribute
        });

        return entity;
    },
    attribute2Entity: function (attribute, entityattr) {
        attribute=attribute||{};
        attribute.style=attribute.style||{};

        if (!entityattr) {
            var coor = Cesium.Rectangle.fromDegrees(78.654473, 34.878143, 78.654673, 34.878316);
            entityattr = {
                fill: true,
                closeTop: true,
                closeBottom: true,
                coordinates: coor
            }
        }

        //贴地时，剔除高度相关属性
        if (attribute.style.clampToGround) {
            if (attribute.style.hasOwnProperty('height'))
                delete attribute.style.height;
            if (attribute.style.hasOwnProperty('extrudedHeight'))
                delete attribute.style.extrudedHeight;
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
                case "height":
                    entityattr.height = Number(value);
                    if (attribute.style.extrudedHeight)
                        entityattr.extrudedHeight = Number(attribute.style.extrudedHeight) + Number(value);
                    break;
                case "extrudedHeight":
                    entityattr.extrudedHeight = Number(entityattr.height) + Number(value);
                    break;
                case "color":   //填充颜色
                    entityattr.material = new Cesium.Color.fromCssColorString(value || "#FFFF00")
                            .withAlpha(Number(attribute.style.opacity || 1.0));
                    break;
                case "image":   //填充图片
                    entityattr.material =new Cesium.ImageMaterialProperty({
                        image: attribute.style.image,
                        color: new Cesium.Color.fromCssColorString("#FFFFFF")
                            .withAlpha(Number(attribute.style.opacity || 1.0)), 
                    }); 
                    break;
                case "rotation":   //旋转角度 
                    entityattr.rotation = Cesium.Math.toRadians(value);
                    if (!attribute.style.stRotation)
                        entityattr.stRotation = Cesium.Math.toRadians(value);
                    break;
                case "stRotation":
                    entityattr.stRotation = Cesium.Math.toRadians(value);
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
        if (entity.rectangle.extrudedHeight) {
            return new _Editor1(dataSource, entity, options);
        } else {
            return new _Editor2(dataSource, entity, options);
        }
    },
    setPositions: function (entity, position) {
        if (position instanceof Array) {
            position = Cesium.Rectangle.fromCartesianArray(position);
        }
        entity.rectangle.coordinates.setValue(position);// = new _DynamicProperty(position);
    },
    getPositions: function (entity) {
        return entity.rectangle.coordinates;
    },
    getCoordinates: function (entity) {
        var positions = this.getDiagonalPositions(entity);
        var coordinates = _drawutils.getCoordinates(positions);
        return coordinates;
    },
    getDiagonalPositions: function (entity) {
        var rectangle = entity.rectangle.coordinates._value;
        var nw = Cesium.Rectangle.northwest(rectangle);
        var se = Cesium.Rectangle.southeast(rectangle);
        return Cesium.Cartesian3.fromRadiansArray([nw.longitude, nw.latitude, se.longitude, se.latitude]);
    },
    toGeoJSON: function (entity) {
        var coordinates = this.getCoordinates(entity);

        return {
            type: "Feature",
            properties: entity.attribute,
            geometry: {
                type: "MultiPoint",
                coordinates: coordinates
            }
        };
    }
};


export default RectangleControl