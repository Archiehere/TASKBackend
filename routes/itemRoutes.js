const express = require('express');
const router = express.Router();
const ItemsController = require('../controller/ItemsController');
const authverifytoken = require('../middleware/authveriftoken');


router.get('/item/:itemId',authverifytoken,ItemsController.getitem)

router.post('/create',authverifytoken,ItemsController.create);

router.put('/update',authverifytoken,ItemsController.updateitem);

router.delete('/delete/:id',authverifytoken,ItemsController.delitem);

module.exports = router;