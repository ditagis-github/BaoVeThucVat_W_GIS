define([
    "esri/geometry/support/webMercatorUtils",

    "esri/geometry/Polyline",
    "esri/Graphic",
    "esri/symbols/SimpleMarkerSymbol",

    "ditagis/support/Editing",
    "ditagis/support/GeometryUtil",
    "esri/geometry/geometryEngineAsync",
    "esri/geometry/SpatialReference"
], function (webMercatorUtils, Polyline, Graphic, SimpleMarkerSymbol, editingSupport, geometryUtil,
    geometryEngineAsync, SpatialReference) {
        'use strict';
        return class {
            constructor(view, layer) {
                this.view = view;
                this.layer = layer;
                this.attributes = {};
            }
            getPositionPaths(gPaths) {
                let paths = [];
                for (let gP of gPaths) {
                    paths.push(gP[0]);
                }
                let i = gPaths.length;
                let j = gPaths[i - 1].length;
                paths.push(gPaths[i - 1][j - 1])
                return paths;
            }
            async getTwoPointLength(line) {
                // const points = geometryUtil.convertPathsToPoints(line),
                //     point1 = points[0], point2 = points[1];
                // var res = await geometryEngineAsync.distance(point1, point2, "kilometers");
                var distance = await geometryEngineAsync.geodesicLength(new Polyline({
                    paths: line,
                    spatialReference: new SpatialReference(102100)
                }), 'kilometers');
                //làm tròn
                distance = Math.round(distance * 10000) / 10000;
                return distance;
            }
            async getPoLylineLength(gPaths) {
                var chieudaichitiets = [];
                for (let index in gPaths) {
                    chieudaichitiets.push(await this.getTwoPointLength(gPaths[index]));
                }
                return chieudaichitiets;
            }
            /**
             * Kiểm tra điểm {geometry} có tồn tại đối tượng Thiết bị truyền dẫn
             * @param {Point} geometry 
             * @return true: có tồn tại thiết bị truyền dẫn
             */
            isThietBiTruyenDan(geometry) {
                return new Promise((resolve, reject) => {
                    const tbtdLayer = this.view.map.getLayer(constName.THIETBITRUYENDAN);
                    tbtdLayer.queryFeatures({ geometry: geometry }).then(numFeatures => {
                        resolve(numFeatures.features.length > 0) //neu ton tai thiet bi truyen dan tai vi tri {geometry}
                    });
                });
            }
            /**
            * Lấy thông tin xã phường, thị trấn, tên người tạo, thời gian tạo
            * Nếu layer là Hệ thống truyền dẫn viễn thông thì:
            * phải lấy chiều dài chi tiết
            * Kiểm tra thiết bị truyền dẫn tại mỗi vị trí đặt hệ thống, nếu có thì thêm thêm TB như mẫu 5
            */
            async getAttributes(geometry) {

                const pathsArr = geometry.paths;
                let paths = this.getPositionPaths(pathsArr);
                /**
                 * lấy chiều dài chi tiết của từng đoạn polyline
                 */
                let detailLineLength = await this.getPoLylineLength(pathsArr);

                var totalLineLength = detailLineLength.reduce((a, b) => a + b, 0);//lấy tổng chiều dài thông qua chiều dài chi tiết của từng đoạn

                let xaPhuongAttr = [];
                var diaban = '',
                    loaicongtrinh = '';
                let pathsToPoints = geometryUtil.convertPathsToPoints(paths);
                /**
                 * Phần chi tiết cho từng loại layerisThietBiTruyenDan
                 */
                //HỆ THỐNG TRUYỀN DẪN VIỄN THÔNG
                if (this.layer.name === constName.HETHONGTRUYENDANVIENTHONG) {
                    let detailLineLengthString = ''
                    for (let index in detailLineLength) {
                        //mỗi lần chạy sẽ tạo ra được một đường (1)-(2):{chiều dài chi tiết hiện tại}
                        detailLineLengthString += `(${parseInt(index) + 1}) - (${parseInt(index) + 2}): ${detailLineLength[index]} km \r\n`;
                    }

                    for (var index = 0, count = 1; index < pathsToPoints.length; index++ , count++) {
                        var point = pathsToPoints[index];
                        //lấy thông tin xã huyện ở vị trí {point}
                        const xaHuyen = await editingSupport.getLocationInfo(point);
                        diaban += `(${count}) ${xaHuyen.XaPhuong}/${xaHuyen.HuyenTP}`;
                        //nếu tại {point} có tồn tại thiết bị truyền dẫn thì thêm TB vào sau
                        //ví dụ (1) Phường 1/Quận 1 - Phường2/Quận 2 (TB)
                        if (await this.isThietBiTruyenDan(point)) {
                            diaban += " (TB)"
                        }
                        diaban += '\r\n';

                        if (count < paths.length - 1)
                            loaicongtrinh += `(${count + 1}) - (${count + 2}): \r\n`;
                    }
                    this.attributes["ChieuDaiChiTiet"] = detailLineLengthString;
                    this.attributes["DiaBan"] = diaban;
                    this.attributes["LoaiCongTrinh"] = loaicongtrinh;
                }

                //lấy thông tin cập nhật gồm người tạo và thời gian tạo
                const createdInfo = await editingSupport.getCreatedInfo(this.view);
                for (let i in createdInfo) {
                    this.attributes[i] = createdInfo[i];
                }

                this.attributes["TongChieuDai"] = totalLineLength;

                return this.attributes;
            }
        }

    });