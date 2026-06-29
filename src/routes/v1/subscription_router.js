const express = require('express');
const { isLoggedIn } = require('../../middlewares/auth_middleware');

const router = express.Router();

//All subscription routes require a valied JWT - user already has one
//from completeSignup, so this screen sits right after signup, before
// (or instead of) BiometricSetup, depending on the app's nav order.
router.use(isLoggedIn);




module.exports = router;