const express = require('express');
const auth = require('../../middleware/auth');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Import Models

const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

//@route Post api/posts
//@desc  Create Post
//@access Private

router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await User.findById(req.user.id).select('-password');
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })
        const post = await newPost.save();
        return res.json(post);

    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Server Error');
    }
})


//@route Get api/posts
//@desc  Get all posts
//@access Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        return res.json(posts);
    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Server Error');
    }
})

//@route Get api/posts/:id
//@desc  Get post by id
//@access Private
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post Not Found' });
        }
        return res.json(post);
    } catch (error) {
        console.log(error.message);

        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post Not Found' });
        }
        return res.status(500).send('Server Error');
    }
})

//@route Delete api/posts/:id
//@desc  Delete post by id
//@access Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post Not Found' });
        }
        // Check if users own this post
        // post.user if object id and req.user.id is string so convert post.uset to string as well
        console.log(post.user.toString());
        console.log(req.user.id);
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User Not authorized' })
        }
        await post.remove();

        return res.json({ msg: 'Post removed' });
    } catch (error) {
        console.log(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post Not Found' });
        }
        return res.status(500).send('Server Error');
    }
})

//@route PUT api/posts/like/:id
//@desc  Like a post
//@access Private

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // if post has already been like by user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: 'Post Already like' });
        }
        post.likes.unshift({ user: req.user.id });

        await post.save();

        return res.json(post.likes);

    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Server Error');
    }
})

//@route PUT api/posts/unlike/:id
//@desc  Like a post
//@access Private

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // if post has already been like by user
        // if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
        //     return res.status(400).json({ msg: 'Post has not yet been liked' });
        // }

        // Get romve index 
        const removeIndex = post.likes.map(like => like.user.toString).indexOf(req.user.id);
        console.log(removeIndex);

        post.likes.splice(removeIndex, 1);

        await post.save();

        return res.json(post.likes);

    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Server Error');
    }
})


//@route Post api/posts/comments/:id
//@desc  Comment on post
//@access Private

router.post('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);
        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }
        post.comments.unshift(newComment);
        await post.save();

        return res.json(post.comments);

    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Server Error');
    }
})


//@route Delete api/posts/comments/:id/:comment_id
//@desc  Delete comment of post
//@access Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        // Pull out comment from post 
        const comment = await post.comments.find(comment => comment.id === req.params.comment_id);

        // Make sure comment exist
        if (!comment) {
            return res.status(404).res.json({ msg: 'Comment Does not exist' });
        }
        // check the user who delete the comment is actually the user who made this comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Get romve index 
        const removeIndex = post.comments.map(comment => comment.user.toString).indexOf(req.user.id);
        
        post.comments.splice(removeIndex, 1);

        await post.save();

        return res.json(post.comments);


    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Server Error');
    }
})

module.exports = router;