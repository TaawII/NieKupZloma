var express = require('express');
var router = express.Router();
var homeController = require('../controllers/homeController')

router.get('/', homeController.GetIndex)
router.get('/toyota', homeController.GetToyota)
router.get('/ford', homeController.GetFord)
router.get('/porsche', homeController.GetPorsche)
router.get('/lamborghini', homeController.GetLamborghini)
module.exports = router;
