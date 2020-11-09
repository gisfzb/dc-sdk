const { Cesium } = DC.Namespace

import CesiumUtils from '../utils/CesiumUtils';

function GeojsonLayers(viewer, options) {
    this.viewer = viewer;
    this.options = options;
    this.options.geojsonLayers = Cesium.defaultValue(this.options.geojsonLayers, [{ id: 'geojson' + CesiumUtils.randomNum(10), url: 'http://www.imapway.cn/mw3dsdk/Geojson/hchb.json' }]);
}

//添加geojson
GeojsonLayers.prototype.add = function() {
    var that = this;
    this.options.geojsonLayers.forEach(function(geojson) {
        var url = geojson.url;
        var id = geojson.id;

        Cesium.GeoJsonDataSource.load(url,{clampToGround:true}).then(function(dataSource) {
            that.viewer.dataSources.add(dataSource);
        });
        // CesiumUtils.loadJson(url, function(json) {
        //     json.features.forEach(function(feature) {
        //         var geojsonfeature;
        //         switch (feature.geometry.type) {
        //             case 'Polygon':
        //                 geojsonfeature = that.creatPolygonPrimitive(feature);
        //                 break;
        //         }
        //         if (geojsonfeature) {
        //             that.viewer.scene.primitives.add(geojsonfeature);
        //         }
        //     });
        // });
    });
};

GeojsonLayers.prototype.creatPolygonPrimitive = function(feature) {
    this.coordinatesArrayToCartesianArray = function(coordinates, crsFunction) {
        var positions = new Array(coordinates.length);
        for (var i = 0; i < coordinates.length; i++) {
            positions[i] = crsFunction(coordinates[i]);
        }
        return positions;
    };
    this.defaultCrsFunction = function(coordinates) {
        return Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1]);
    };
    var coordinates = feature.geometry.coordinates;
    if (coordinates.length === 0 || coordinates[0].length === 0) {
        return;
    }
    var crsFunction = this.defaultCrsFunction;
    var holes = [];
    for (var i = 1, len = coordinates.length; i < len; i++) {
        holes.push(new Cesium.PolygonHierarchy(this.coordinatesArrayToCartesianArray(coordinates[i], crsFunction)));
    }

    var positions = coordinates[0];
    var polygonWithHole = new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(this.coordinatesArrayToCartesianArray(positions, crsFunction), holes)
    });

    var polygonGeometry = Cesium.PolygonGeometry.createGeometry(polygonWithHole);

    var polygonPrimitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: polygonGeometry
        }),
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround: true,
            material: new Cesium.Material({
                fabric: {
                    type: 'Water',
                    uniforms: {
                        normalMap: Cesium.buildModel('Assets/Textures/waterNormals.jpg'),
                        frequency: 10000.0,
                        animationSpeed: 0.01,
                        amplitude: 50
                    }
                }
            })
        }),
        asynchronous: false,
        show: true
    });
    return polygonPrimitive;
};

export default GeojsonLayers;
