const express = require('express');

const router = express.Router();

//get public route api/users 

router.get('/', (req, res) => {
    res.send('Users route')
})

module.exports = router;