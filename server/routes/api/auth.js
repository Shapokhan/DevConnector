const express = require('express');
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');

//get public route api/auth 

router.get('/', auth, async (req, res) => {
    try {
        // we have set req.user in middleware/auth.js and accessing user for which token is assigned
        const user = await User.findById(req.user.id).select('-password');
        res.send(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Server error");
    }
})


//Post public route api/auth  to authenticate User and get token
router.post('/', [
    check('email', 'Enter valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Cridentials' }] });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid Cridentials' }] });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            })

    } catch (err) {
        return res.status(500).json({ errors: [{ msg: err.message }] });
    }
})

module.exports = router;