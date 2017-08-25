var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.cookies.user);
  res.render('map', { title: 'Hệ thống hạ tầng viễn thông Bình Định'});
});
router.get('/user',function(req,res){
  console.log(req.session.user);
  res.end(req.session.user);
})

module.exports = router;
