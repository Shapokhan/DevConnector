const express = require('express');
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Import models
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route Get api/profile/me
//@desc  Get Current user profile
//@access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }
        return res.json(profile); 
    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Server Error');
    }

});

//@route Post api/profile/
//@desc  Create Or Update Current user profile
//@access Private

router.post('/',
    [auth,
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            company,
            location,
            bio,
            status,
            website,
            githubusername,
            skills,
            youtube,
            twitter,
            instagram,
            facebook,
            linkedin
        } = req.body;

        //  Build Profile Object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (location) profileFields.location = location;
        if (website) profileFields.website = website;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        // Build Social Object
        profileFields.social = {}
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (youtube) profileFields.social.youtube = youtube;

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                // Update Profile
                profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
                return res.json(profile);
            }

            // Create Profile
            profile = new Profile(profileFields);
            profile.save();
            return res.json(profile);

        } catch (error) {
            console.log(error.message);
            return res.status(500).send('Server Error');
        }
    })



//@route Get api/profile/
//@desc  Get all Profile
//@access Public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        return res.json(profiles);

    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Server Error');
    }
})


//@route Get api/profile/user/user_id
//@desc  Get user profile against specific id
//@access Private

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) return res.json({ msg: 'Profile not found' });

        return res.json(profile);

    } catch (error) {
        if (error.kind == 'ObjectId') {
            return res.json({ msg: 'Profile not found' });
        }
        console.log(error.message);
        return res.status(500).send('Server Error');
    }
})

//@route Delete api/profile/
//@desc  Delete User, Profile, Post
//@access Private


router.delete('/', auth, async (req, res) => {
    try {
        console.log('You are at delete profile api');
        console.log(req.user.id);
        // Delete Profile
        await Profile.findOneAndRemove({ user: req.user.id });
        console.log('Profile deleted')
        //  Delete User
        await User.findOneAndRemove({ _id: req.user.id });
        return res.json({ msg: 'User deleted' });
    } catch (error) {
        console.log(error.message)
        return res.status(500).send('Server Error');
    }
})


//@route Put api/profile/experience
//@desc  Add Profile Experience
//@access Private

router.put('/experience', [
    auth,
    [
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From Date is required').not().isEmpty()
    ]
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }


        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.experience.unshift(newExp);
            await profile.save();
            return res.json(profile);

        } catch (error) {
            console.log(error.message)
            return res.status(500).send('Server Error');
        }
    })

//@route Delete api/profile/experience/exp_id
//@desc  Delete Profile Experience
//@access Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // Get Remove Index

        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);

    } catch (error) {
        console.log(error.message)
        return res.status(500).send('Server Error');
    }
})

//@route Put api/profile/education
//@desc  Add Profile Education
//@access Private

router.put('/education', [
    auth,
    [
        check('school', 'School is required').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('fieldofstudy', 'Field of study is required').not().isEmpty(),
        check('from', 'From Date is required').not().isEmpty(),
    ]
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }


        try {
            const profile = await Profile.findOne({ user: req.user.id });
            profile.education.unshift(newEdu);
            await profile.save();
            return res.json(profile);

        } catch (error) {
            console.log(error.message)
            return res.status(500).send('Server Error');
        }
    })

//@route Delete api/profile/education/edu_id
//@desc  Delete education from profile
//@access Private

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });

        // Get Remove Index

        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);

    } catch (error) {
        console.log(error.message)
        return res.status(500).send('Server Error');
    }
})


module.exports = router;