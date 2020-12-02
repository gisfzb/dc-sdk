/*
 * @Author: your name
 * @Date: 2020-04-22 16:07:39
 * @LastEditTime: 2020-04-22 16:27:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \map3d-designer-sdk\Source\Map\CustomElements\CustomElements.js
 */
const { Cesium } = DC.Namespace

function CustomElements() {
    var negativeRootTwoOverThree = -Math.sqrt(2.0) * 10;
    var negativeOneThird = 1.0 * 10;
    var rootSixOverThree = Math.sqrt(6.0) * 10;

    //四面体的四个顶点
    var positions = new Float64Array(4 * 3);

    // position 0
    positions[0] = 0.0;
    positions[1] = 0.0;
    positions[2] = -3.0 * 10;

    // position 1
    positions[3] = 0.0;
    positions[4] = (2.0 * Math.sqrt(2.0)) * 10;
    positions[5] = negativeOneThird;

    // position 2
    positions[6] = -rootSixOverThree;
    positions[7] = negativeRootTwoOverThree;
    positions[8] = negativeOneThird;

    // position 3
    positions[9] = rootSixOverThree;
    positions[10] = negativeRootTwoOverThree;
    positions[11] = negativeOneThird;

    var attributes = new Cesium.GeometryAttributes({
        position: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: 3,
            values: positions
        })
    });

    //顶点索引
    var indices = new Uint16Array(4 * 3);

    // back triangle
    indices[0] = 0;
    indices[1] = 1;
    indices[2] = 2;

    // left triangle
    indices[3] = 0;
    indices[4] = 2;
    indices[5] = 3;

    // right triangle
    indices[6] = 0;
    indices[7] = 3;
    indices[8] = 1;

    // bottom triangle
    indices[9] = 2;
    indices[10] = 1;
    indices[11] = 3;

    //包围球
    var boundingSphere = new Cesium.BoundingSphere(new Cesium.Cartesian3(0.0, 0.0, 0.0), 1.0);

    var geometry = Cesium.GeometryPipeline.computeNormal(new Cesium.Geometry({
        attributes: attributes,
        indices: indices,
        primitiveType: Cesium.PrimitiveType.TRIANGLES,
        boundingSphere: boundingSphere
    }));

    this.attributes = geometry.attributes;
    this.indices = geometry.indices;
    this.primitiveType = geometry.primitiveType;
    this.boundingSphere = geometry.boundingSphere;
    this.boundingSphere = Cesium.BoundingSphere.fromVertices(positions);
}

export default CustomElements;
