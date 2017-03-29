$("#tabSearch").click(function () {

    var check = $("#tabSearchControl").hasClass("undisplay");

    if (check) {

        $("#tabMapControl").removeClass("col-md-12");
        $("#tabMapControl").removeClass("col-lg-12");

        $("#tabSearchControl").addClass("col-md-4");
        $("#tabSearchControl").addClass("col-lg-3");

        $("#tabMapControl").addClass("col-md-8");
        $("#tabMapControl").addClass("col-lg-9");


        $("#tabAddDataControl").removeClass("col-md-4");
        $("#tabAddDataControl").removeClass("col-lg-3");

        $("#tabAddDataControl").css("display", "none");
        $("#tabSearchControl").css("display", "inherit");

    }
    else {

        $("#tabSearchControl").removeClass("col-md-4");
        $("#tabSearchControl").removeClass("col-lg-3");

        $("#tabMapControl").removeClass("col-md-8");
        $("#tabMapControl").removeClass("col-lg-9");

        $("#tabMapControl").addClass("col-md-12");
        $("#tabMapControl").addClass("col-lg-12");

        $("#tabSearchControl").css("display", "none");
    }

    map.resize();

});

$("#closeTabSearchControl").click(function () {
    $("#tabSearchControl").removeClass("col-md-4");
    $("#tabSearchControl").removeClass("col-lg-3");

    $("#tabMapControl").removeClass("col-md-8");
    $("#tabMapControl").removeClass("col-lg-9");

    $("#tabMapControl").addClass("col-md-12");
    $("#tabMapControl").addClass("col-lg-12");

    $("#tabSearchControl").css("display", "none");
    map.resize();
});

$("#tabAddData").click(function () {

    var check = $("#tabAddDataControl").hasClass("col-md-4");

    if (check) {

        $("#tabAddDataControl").removeClass("col-md-4");
        $("#tabAddDataControl").removeClass("col-lg-3");

        $("#tabMapControl").removeClass("col-md-8");
        $("#tabMapControl").removeClass("col-lg-9");

        $("#tabMapControl").addClass("col-md-12");
        $("#tabMapControl").addClass("col-lg-12");

        $("#tabAddDataControl").css("display", "none");
    }
    else {

        $("#tabMapControl").removeClass("col-md-12");
        $("#tabMapControl").removeClass("col-lg-12");

        $("#tabAddDataControl").addClass("col-md-4");
        $("#tabAddDataControl").addClass("col-lg-3");

        $("#tabMapControl").addClass("col-md-8");
        $("#tabMapControl").addClass("col-lg-9");


        $("#tabSearchControl").removeClass("col-md-4");
        $("#tabSearchControl").removeClass("col-lg-3");

        $("#tabSearchControl").css("display", "none");
        $("#tabAddDataControl").css("display", "inherit");
    }

    map.resize();

});

$("#closeTabAddDataControl").click(function () {
    $("#tabAddDataControl").removeClass("col-md-4");
    $("#tabAddDataControl").removeClass("col-lg-3");

    $("#tabMapControl").removeClass("col-md-8");
    $("#tabMapControl").removeClass("col-lg-9");

    $("#tabMapControl").addClass("col-md-12");
    $("#tabMapControl").addClass("col-lg-12");

    $("#tabAddDataControl").css("display", "none");
    map.resize();
});