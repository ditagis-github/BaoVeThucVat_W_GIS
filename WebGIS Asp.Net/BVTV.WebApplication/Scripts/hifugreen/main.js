(function ($) {
"use strict";

/*--
	Hero Slider
-----------------------------------*/
$('#hero-slider').nivoSlider({
    prevText: '<span>T</span><i class="zmdi zmdi-long-arrow-left"></i>',
    nextText: '<span>P</span><i class="zmdi zmdi-long-arrow-right"></i>',
    controlNav: false,
    effect: 'boxRainGrow',
    pauseTime: 5000,
});

/*--
	Scroll Up
-----------------------------------*/
$.scrollUp({
	easingType: 'linear',
	scrollSpeed: 900,
	animation: 'fade',
	scrollText: '<i class="zmdi zmdi-chevron-up"></i>',
});
/*--
	Wow js
-----------------------------------*/
new WOW().init();
    


})(jQuery);	