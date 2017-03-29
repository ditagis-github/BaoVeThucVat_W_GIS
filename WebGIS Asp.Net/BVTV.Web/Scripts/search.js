function addSearchEvent(domID,resultFormDomId,counterResultFormDomId,feature,arrAttribute,selectProperty) {
    $("'#"+domID+"'").click(function (e) {
        var where = "1=1";

        arrAttribute.forEach(function (value, index) {
            if (value.dom.trim().length > 0) {
                where += " AND "+value.property+"LIKE N'%" + value.dom+ "%'";
            }
        });

        if (where == "1=1") {
            alert("Vui lòng nhập thông tin tìm kiếm");
            return;
        }

        $(".loading").css("display", "inline-block");
        document.getElementById(resultFormDomId).innerHTML = "";
        document.getElementById(counterResultFormDomId).innerHTML = "";
        var query = new Query();
        query.returnGeometry = true;
        query.outFields = ["*"];
        query.where = where;
        feature.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (results) {
            //alert(results.length);
            var html = "";
            if (results.length > 0) {
                for (var i = 0 ; i < results.length ; i++) {
                    var feat = results[0];
                    var attr = feat.attributes;

                    html += "<tr>  <td>  <span alt='" + attr[selectProperty[0]] + "' class='viewdata'>" + attr[selectProperty[1]] + " </span></td> </tr>";

                }

                document.getElementById(resultFormDomId).innerHTML = html;
                document.getElementById(counterResultFormDomId).innerHTML = results.length;

            }

            $(".loading").css("display", "none");

        });

    });


    //$(btnExcelId).click(function (e) {
    //    var where = "1=1";

    //    arrAttribute.forEach(function (value, index) {
    //        if (value.dom.trim().length > 0) {
    //            where += " AND "+value.property+"LIKE N'%" + value.dom+ "%'";
    //        }
    //    });

    //    if (where == "1=1") {
    //        alert("Vui lòng nhập thông tin tìm kiếm");
    //        return;
    //    }

    //    $(".loading").css("display", "inline-block");
    //    document.getElementById(resultFormDomId).innerHTML = "";
    //    document.getElementById(counterResultFormDomId).innerHTML = "";
    //    var query = new Query();
    //    query.returnGeometry = true;
    //    query.outFields = ["*"];
    //    query.where = where;

    //    var fieldList = SuDungDatTrong.fields;

    //    var htmlTable = "<table> <tr><th colspan='" + fieldList.length + "'>" + feature.name + "</th></tr> <tr> ";
    //    for (var i = 0 ; i < fieldList.length ; i++) {
    //        htmlTable += "<th> " + fieldList[i].alias + " </th>";
    //    }
    //    htmlTable += "</tr>";


    //    feature.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (results) {
    //        //alert(results.length);
    //        var html = "";
    //        if (results.length > 0) {
    //            for (var i = 0 ; i < results.length ; i++) {
    //                var feat = results[0];
    //                var attr = feat.attributes;

    //                html += "<tr>  <td>  <span alt=" + attr["MaDN"] + " class='viewdata'>" + attr["Ten"] + " </span></td> </tr>";

    //            }

    //            document.getElementById(resultFormDomId).innerHTML = html;
    //            document.getElementById(counterResultFormDomId).innerHTML = results.length;

    //            htmlTable += "<tr>";
    //            for (var y = 0 ; y < fieldList.length; y++) {
    //                htmlTable += "<td> " + attr[fieldList[y].name] + " </td>";
    //            }
    //            htmlTable += " </tr>";
    //            htmlTable += "</table>";

    //            // alert(htmlTable);
    //            // nếu có data thì load excel
    //            var ua = window.navigator.userAgent;
    //            var msie = ua.indexOf('MSIE ');
    //            var trident = ua.indexOf('Trident/');
    //            var edge = ua.indexOf('Edge/');

    //            if (msie > 0 || trident > 0 || edge > 0) {
    //                if (window.navigator.msSaveBlob) {
    //                    var blob = new Blob([htmlTable], {
    //                        type: "application/csv;charset=utf-8;"
    //                    });
    //                    navigator.msSaveBlob(blob, 'BaoCaoExcel.xls');
    //                }
    //            }
    //            else {
    //                var url = 'data:application/vnd.ms-excel,' + encodeURIComponent(htmlTable);
    //                location.href = url
    //            }
    //            // end load excel
    //        }
    //        else {

    //            // nếu ko có data thì thông báo
    //            alert("Không có dữ liệu để xuất thông tin ra file excel.");

    //        }

    //        $(".loading").css("display", "none");

    //    });

    //});


    $("'#"+resultFormDomId+"'").on("click", "span.viewdata", function () {
        var value = $(this).attr('alt');
        viewPoint((selectProperty[0]+" = '" + value + "'"), feature);
    });
}


function viewPoint(value, layer) {
    var query = new Query();
    query.returnGeometry = true;
    query.outFields = ["*"];
    query.where = value;
    layer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (results) {
        if (results.length > 0) {
            var feat = results[0];
            var point = feat.geometry;
            // var graphic1 = new esri.Graphic(point, ptSymbol1);

            var pt = new Point(point.x, point.y, map.spatialReference);
            if (pt) {
                var extent = new Extent((point.x + 40), (point.y + 40), (point.x - 40), (point.y - 40), map.spatialReference);
                var stateExtent = extent.expand(5.0);
                map.setExtent(stateExtent);
            }
        }
    });
}

function viewPolygon(value, layer) {
    var query = new Query();
    query.returnGeometry = true;
    query.outFields = ["*"];
    query.where = value;
    layer.selectFeatures(query, FeatureLayer.SELECTION_NEW, function (results) {
        if (results.length > 0) {
            var feat = results[0];
            var point = feat.geometry;
            // var graphic1 = new esri.Graphic(point, ptSymbol1);
            var stateExtent = point.getExtent().expand(8.0);
            map.setExtent(stateExtent);
        }
    });
}