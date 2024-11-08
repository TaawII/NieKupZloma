var express = require('express');
var router = express.Router();
var carController = require('../controllers/carController')

router.get('/', carController.GetAllCar)
router.get('/add', carController.AddCarForm)
router.get('/select', carController.GetSelectedCar)
router.get('/editImage/:id', carController.EditCarImageForm)
router.get('/edit/:id', carController.EditCarForm)
router.get('/json', carController.ShowJSON)
router.get('/xml', carController.ShowXML)
router.get('/txt', carController.SaveTXT)
router.get('/:id', carController.ShowCar)


router.post('/add', carController.AddCar)
router.post('/editImage/:id', carController.EditCarImage)
router.post('/edit/:id', carController.EditCar)
  

module.exports = router;
