const express = require('express');

const router = express.Router();

//get public route api/posts 

router.get('/', (req, res) => {
    res.send('Posts route')
})

module.exports = router;