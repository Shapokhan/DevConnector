const express = require('express');

const router = express.Router();

//get public route api/auth 

router.get('/', (req, res) => {
    res.send('Auth route')
})

module.exports = router;