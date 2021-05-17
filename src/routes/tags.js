const auth = require('../middleware/auth.js'),
      express = require('express'),
      router = express.Router(),
      mongoose = require('mongoose'),
      {Tag, validateTag} = require('../models/tag.js');

// create tag
router.post('/', auth, async (req, res) => {

    const {error} = validateTag(req.body);
    if (error) {
        // log error
        console.log('JOI: ', error);
        // return 400
        return res.status(400).send(error);
    }

    let  newTag = await Tag.create(req.body);
    res.status(201).send(newTag);
})


// create several tags
router.post('/many', auth, async (req, res) => {

    let tags = req.body;

    tags.forEach(tag => {
        let {error} = validateTag(tag);
        if (error) {
            // log error
            console.log('JOI: ', error);
            // return 400
            return res.status(400).send(error);
        }
    })

    let  newTags = await Tag.insertMany(tags);
    res.status(201).send(newTags);
})



// get tags
router.get('/', auth, async(req, res) => {
    const query = req.query ? req.query : {};

    let tags = await Tag.find(query).select({tag:1, type:1}).sort({label:1, tag:1});
    if (!tags) {return res.status(404).send('No tags found!')}

    res.status(200).send(tags);
})



// delete tag
router.delete('/:tagid', auth, async (req, res) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.tagid)) return res.status(400).send('Invalid tag Id');

    let deletedTag = await Tag.findByIdAndDelete(req.params.tagid);
    if(!deletedTag) return res.status(404).send('No such tag!');
    res.status(200).send('Tag sucessfully deleted');
});



module.exports = router;
