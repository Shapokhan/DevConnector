const express = require('express');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const router = express.Router();

const User = require('../../models/Users');

//Post public route api/users  to register User

router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Enter valid email').isEmail(),
    check('password', 'Password should be min 5 character').isLength({ min: 5 })
], async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User Already Exist' }] });
        }
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        user = new User({
            name, email, password, avatar
        })
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        console.log(`User has been registered successfuly`);
        res.send('User has been registered successfuly');

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

module.exports = router;