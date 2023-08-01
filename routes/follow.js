const express = require('express')
const router = express.Router();
const FollowController = require('../controllers/follow')
const check = require("../middlewares/auth")


//Definir rutas
router.get('/prueba-follow', FollowController.pruebaFollow);
router.post('/save', check.auth, FollowController.save)
router.delete('/unfollow', check.auth, FollowController.unfollow)

module.exports = router