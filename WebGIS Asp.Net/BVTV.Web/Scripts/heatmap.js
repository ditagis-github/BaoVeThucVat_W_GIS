function heatmap() {
    formatMagnitude = function (value, key, data) {
        return number.format(value, {
            places: 1,
            locale: "en-us"
        });
    };

    var infoTemplate = new InfoTemplate("Attributes",
        "Name: ${Name}<br>Magnitude: ${Magnitude:formatMagnitude}");


    var heatmapFeatureLayer = new FeatureLayer(serviceURL, heatmapFeatureLayerOptions);

    var blurCtrl = document.getElementById("blurControl");
    var maxCtrl = document.getElementById("maxControl");
    var minCtrl = document.getElementById("minControl");
    var valCtrl = document.getElementById("valueControl");

    var heatmapRenderer = new HeatmapRenderer({
        field: "PhamViAnhHuong",
        blurRadius: blurCtrl.value,
        maxPixelIntensity: maxCtrl.value,
        minPixelIntensity: minCtrl.value
    });

    heatmapFeatureLayer.setRenderer(heatmapRenderer);
    map.addLayer(heatmapFeatureLayer);

    /** Add event handlers for interactivity **/

    var sliders = document.querySelectorAll(".blurInfo p~input[type=range]");
    var addLiveValue = function (ctrl) {
        var val = ctrl.previousElementSibling.querySelector("span");
        ctrl.addEventListener("input", function (evt) {
            val.innerHTML = evt.target.value;
        });
    };
    for (var i = 0; i < sliders.length; i++) {
        addLiveValue(sliders.item(i));
    }

    blurCtrl.addEventListener("change", function (evt) {
        var r = +evt.target.value;
        if (r !== heatmapRenderer.blurRadius) {
            heatmapRenderer.blurRadius = r;
            heatmapFeatureLayer.redraw();
        }
    });
    maxCtrl.addEventListener("change", function (evt) {
        var r = +evt.target.value;
        if (r !== heatmapRenderer.maxPixelIntensity) {
            heatmapRenderer.maxPixelIntensity = r;
            heatmapFeatureLayer.redraw();
        }
    });
    minCtrl.addEventListener("change", function (evt) {
        var r = +evt.target.value;
        if (r !== heatmapRenderer.minPixelIntensity) {
            heatmapRenderer.minPixelIntensity = r;
            heatmapFeatureLayer.redraw();
        }
    });
    // --------------------------------------------------------------------
    // When check / uncheck the control for the HeatmapRenderer field,
    // we will leave the blurRadius and the minPixelIntensity values the
    // same. However we will adjust the maxPixelIntensity value so it
    // spreads the colors across the range of magnitude values. For your
    // own dataset, you will need to experiment to find what looks good
    // based upon the level of geography when you display the heatmap
    // and the values in your dataset.
    // --------------------------------------------------------------------
    valCtrl.addEventListener("change", function (evt) {
        var chk = evt.target.checked;
        if (!chk) {
            document.getElementById("maxValue").innerHTML = 21;
            maxCtrl.value = 21;
            heatmapRenderer.maxPixelIntensity = 21;
        } else {
            document.getElementById("maxValue").innerHTML = 250;
            maxCtrl.value = 250;
            heatmapRenderer.maxPixelIntensity = 250;

        }
        heatmapRenderer.field = (chk) ? "PhamViAnhHuong" : null;
        heatmapFeatureLayer.redraw();
    });
}
