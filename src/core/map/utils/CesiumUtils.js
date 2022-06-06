/*
 * @Author: your name
 * @Date: 2020-03-25 16:02:58
 * @LastEditTime: 2020-04-16 19:09:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \map3d-designer-sdk\Source\Utils\CesiumUtils.js
 */

const { Cesium } = DC.Namespace

// eslint-disable-next-line no-unused-vars
function CesiumUtils() {
}

CesiumUtils.getID = function(length) {
    return Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);
};

CesiumUtils.parabolaEquation = function(options, resultOut) {
    //方程 y=-(4h/L^2)*x^2+h h:顶点高度 L：横纵间距较大者
    var h = options.height && options.height > 200 ? options.height : 200;
    var L = Math.abs(options.pt1.lon - options.pt2.lon) > Math.abs(options.pt1.lat - options.pt2.lat) ? Math.abs(options.pt1.lon - options.pt2.lon) : Math.abs(options.pt1.lat - options.pt2.lat);
    var num = options.num && options.num > 50 ? options.num : 50;
    var result = [];
    var dlt = L / num;
    if (Math.abs(options.pt1.lon - options.pt2.lon) > Math.abs(options.pt1.lat - options.pt2.lat)) {//以lon为基准
        var delLat = (options.pt2.lat - options.pt1.lat) / num;
        if (options.pt1.lon - options.pt2.lon > 0) {
            dlt = -dlt;
        }
        for (var j = 0; j < num; j++) {
            var tempH1 = h - Math.pow((-0.5 * L + Math.abs(dlt) * j), 2) * 4 * h / Math.pow(L, 2);
            var lon1 = options.pt1.lon + dlt * j;
            var lat1 = options.pt1.lat + delLat * j;
            result.push([lon1, lat1, tempH1]);
        }
    } else {//以lat为基准
        var delLon = (options.pt2.lon - options.pt1.lon) / num;
        if (options.pt1.lat - options.pt2.lat > 0) {
            dlt = -dlt;
        }
        for (var i = 0; i < num; i++) {
            var tempH = h - Math.pow((-0.5 * L + Math.abs(dlt) * i), 2) * 4 * h / Math.pow(L, 2);
            var lon = options.pt1.lon + delLon * i;
            var lat = options.pt1.lat + dlt * i;
            result.push([lon, lat, tempH]);
        }
    }
    if (resultOut !== undefined) {
        resultOut = result;
    }
    return result;
};

CesiumUtils.getCesiumColor = function(ColorArr) {
    var r = ColorArr[0];
    var g = ColorArr[1];
    var b = ColorArr[2];
    var a = ColorArr[3];
    return new Cesium.Color(r, g, b, a);
};

CesiumUtils.randomNum = function(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        default:
            return 0;
    }
};

CesiumUtils.pdValues = function(params) {
    if (params !== null && typeof params !== 'undefined' && params !== {}) {
        return true;
    }
    return false;
};

CesiumUtils.loadJson = function(url, callback) {
    var request = new XMLHttpRequest();
    request.open('get', url);
    request.send(null);
    request.onload = function() {
        if (request.status === 200) {
            var json = JSON.parse(request.responseText);
            callback(json);
        }
    };
};

export default CesiumUtils;
