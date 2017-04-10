require([
                "esri/Map",
                "esri/views/MapView",
                "esri/layers/MapImageLayer",
                "esri/layers/FeatureLayer",
                "esri/Graphic",
                "esri/widgets/Expand",
                "esri/widgets/Home",
                "esri/geometry/Extent",
                "esri/Viewpoint",
                "esri/symbols/SimpleMarkerSymbol",
                "esri/core/watchUtils",
                "dojo/on",
                "dojo/dom",
                "dojo/domReady!"
],
    function (
        Map, MapView, MapImageLayer, FeatureLayer, Graphic, Expand,
        Home, Extent, Viewpoint, SimpleMarkerSymbol, watchUtils,
        on, dom
    ) {

        var featureLayer, editExpand, searchExpand;

        // feature edit area domNodes
        var editArea, attributeEditing, inputDescription,
            inputUserInfo, updateInstructionDiv;

        var map = new Map({
            basemap: "streets"
        });

        var baseMap = new MapImageLayer({
            url: "http://112.78.4.175:6080/arcgis/rest/services/Basemap_BaoVeThucVat/MapServer",
            title: "Lớp dữ liệu Bình Dương"
        });
        map.add(baseMap);



        var view = new MapView({
            container: "map",
            map: map,
            zoom: 13, // Sets the zoom level based on level of detail (LOD)
            center: [106.688166, 11.172618], // Sets the center point of view in lon/lat
        });
        console.log(view.zoom);

        //Create new doanhNhgiep FeatureLayer connect with Arcgis Services
        featureLayer = new FeatureLayer("http://112.78.4.175:6080/arcgis/rest/services/BaoVeThucVat_ChuyenDe/FeatureServer/0", {
            mode: FeatureLayer.MODE_ONDEMAND,
            outFields: ["*"],
            title: "Doanh nghiệp"
        });
        map.add(featureLayer);
        setupEditing();
        setupView();

        function addLayer(lyr) {
            featureLayer = lyr;
            map.add(lyr);
        }

        function applyEdits(params) {
            unselectFeature();
            var promise = featureLayer.applyEdits(params);
            editResultsHandler(promise);
        }

        // *****************************************************
        // applyEdits promise resolved successfully
        // query the newly created feature from the featurelayer
        // set the editFeature object so that it can be used
        // to update its features.
        // *****************************************************
        function editResultsHandler(promise) {
            promise
                .then(function (editsResult) {
                    var extractObjectId = function (result) {
                        return result.objectId;
                    };

                    // get the objectId of the newly added feature
                    if (editsResult.addFeatureResults.length > 0) {
                        var adds = editsResult.addFeatureResults.map(
                            extractObjectId);
                        newIncidentId = adds[0];

                        selectFeature(newIncidentId);
                    }
                })
                .otherwise(function (error) {
                    console.log("===============================================");
                    console.error("[ applyEdits ] FAILURE: ", error.code, error.name,
                        error.message);
                    console.log("error = ", error);
                });
        }

        // *****************************************************
        // listen to click event on the view
        // 1. select if there is an intersecting feature
        // 2. set the instance of editFeature
        // 3. editFeature is the feature to update or delete
        // *****************************************************
        view.on("click", function (evt) {
            unselectFeature();
            view.hitTest(evt.screenPoint).then(function (response) {
                if (response.results.length > 0 && response.results[0].graphic) {

                    var feature = response.results[0].graphic;
                    selectFeature(feature.attributes[featureLayer.objectIdField]);

                    inputDescription.value = feature.attributes[
                        "MaDoanhNghiep"];
                    inputUserInfo.value = feature.attributes[
                        "NguoiDaiDienDoanhNghiep"];
                    attributeEditing.style.display = "block";
                    updateInstructionDiv.style.display = "none";
                }
            });
        });

        // *****************************************************
        // select Feature function
        // 1. Select the newly created feature on the view
        // 2. or select an existing feature when user click on it
        // 3. Symbolize the feature with cyan rectangle
        // *****************************************************
        function selectFeature(objectId) {
            // symbol for the selected feature on the view
            var selectionSymbol = SimpleMarkerSymbol({
                color: [0, 0, 0, 0],
                style: "square",
                size: '40px',
                outline: {
                    color: [0, 255, 255, 1],
                    width: "3px"
                }
            });
            var query = featureLayer.createQuery();
            query.where = featureLayer.objectIdField + " = " + objectId;

            featureLayer.queryFeatures(query).then(function (results) {
                if (results.features.length > 0) {
                    editFeature = results.features[0];
                    editFeature.symbol = selectionSymbol;
                    view.graphics.add(editFeature);
                }
            });
        }

        // *****************************************************
        // hide attributes update and delete part when necessary
        // *****************************************************
        function unselectFeature() {
            attributeEditing.style.display = "none";
            updateInstructionDiv.style.display = "block";

            inputDescription.value = null;
            inputUserInfo.value = null;
            view.graphics.removeAll();
        }

        // *****************************************************
        // add homeButton and expand widgets to UI
        // *****************************************************
        function setupView() {
            // set home buttone view point to initial extent
            var homeButton = new Home({
                view: view
            });
            view.ui.add(homeButton, "top-left");

            //expand widget
            editExpand = new Expand({
                expandIconClass: "esri-icon-edit",
                expandTooltip: "Expand Edit",
                expanded: true,
                view: view,
                content: editArea
            });
            view.ui.add(editExpand, "top-right");
            searchExpand = new Expand({
                expandIconClass: "esri-icon-search",
                expandTooltip: "Expand Edit",
                expanded: false,
                view: view,
                content: dom.byId("searchArea")
            });
            view.ui.add(searchExpand, "top-right");


        }

        // *****************************************************
        // set up for editing
        // *****************************************************
        function setupEditing() {
            // input boxes for the attribute editing
            editArea = dom.byId("editArea");
            updateInstructionDiv = dom.byId("updateInstructionDiv");
            attributeEditing = dom.byId("featureUpdateDiv");
            inputDescription = dom.byId("inputDescription");
            inputUserInfo = dom.byId("inputUserInfo");

            // *****************************************************
            // btnUpdate click event
            // update attributes of selected feature
            // *****************************************************
            on(dom.byId("btnUpdate"), "click", function (evt) {
                if (editFeature) {
                    editFeature.attributes["MaDoanhNghiep"] = inputDescription.value;
                    editFeature.attributes["NguoiDaiDienDoanhNghiep"] = inputUserInfo.value;

                    var edits = {
                        updateFeatures: [editFeature]
                    };

                    applyEdits(edits);
                }
            });

            // *****************************************************
            // btnAddFeature click event
            // create a new feature at the click location
            // *****************************************************
            on(dom.byId("btnAddFeature"), "click", function () {
                unselectFeature();
                on.once(view, "click", function (event) {
                    event.stopPropagation();

                    if (event.mapPoint) {
                        point = event.mapPoint.clone();
                        point.z = undefined;
                        point.hasZ = false;

                        newIncident = new Graphic({
                            geometry: point,
                            attributes: {}
                        });

                        var edits = {
                            addFeatures: [newIncident]
                        };

                        applyEdits(edits);

                        // ui changes in response to creating a new feature
                        // display feature update and delete portion of the edit area
                        attributeEditing.style.display = "block";
                        updateInstructionDiv.style.display = "none";
                        dom.byId("map").style.cursor = "auto";
                    } else {
                        console.error("event.mapPoint is not defined");
                    }
                });

                // change the view's mouse cursor once user selects
                // a new incident type to create
                dom.byId("map").style.cursor = "crosshair";
                editArea.style.cursor = "auto";
            });

            // *****************************************************
            // delete button click event. ApplyEdits is called
            // with the selected feature to be deleted
            // *****************************************************
            on(dom.byId("btnDelete"), "click", function () {
                var edits = {
                    deleteFeatures: [editFeature]
                };
                applyEdits(edits);
            });

            // *****************************************************
            // watch for view LOD change. Display Feature editing
            // area when view.zoom level is 14 or higher
            // otherwise hide the feature editing area
            // *****************************************************
            view.then(function () {
                watchUtils.whenTrue(view, "stationary", function () {
                    console.log(view.zoom);
                    if (editExpand) {
                        if (view.zoom <= 13) {
                            editExpand.domNode.style.display = "none";
                        } else {
                            editExpand.domNode.style.display = "block";
                        }
                    }
                });
            });
        }

        function handleLayerLoadError(err) {
            console.log("Layer failed to load: ", err);
        }
    });
