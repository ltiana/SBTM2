const auth = require('../middleware/auth.js'),
      express = require('express'),
      router = express.Router(),
      mongoose = require('mongoose'),
      {Tag} = require('../models/tag.js'),
      {Charter, validateCharter, validateSession} = require('../models/charter.js');

// create
router.post('/', auth, async (req, res) => {

    let charter = req.body;
    console.log(charter)

    charter.createdBy = req.user._id;

    let  newCharter = await Charter.create(charter);
    res.status(201).send(newCharter);

});

// read all non-deleted charters created by any user
// TODO search
// TODO pagination
router.get('/all', auth, async (req, res) => {

    let allCharters = await Charter.find().populate('createdBy', 'loginInfo.username -_id').populate('createdBy','username');
    if(!allCharters) return res.status(500).send('Could not fetch charters');
    res.status(200).send(allCharters);

})

router.get('/active', auth, async (req, res) => {

    let allCharters = await Charter.find({deleted: false})
        .populate('createdBy','username')
        .populate('updatedBy','username')
        .populate('areas')
        .populate('triggers')
        .populate('dataFiles','fileName, fileSize, fileType')
        .sort({created: -1});
    if(!allCharters) return res.status(500).send('Could not fetch charters');
    res.status(200).send(allCharters);

})

router.get('/deleted', auth, async (req, res) => {

    let allCharters = await Charter.find({deleted: true}).populate('createdBy','username')
        .populate('createdBy','username')
        .populate('updatedBy','username')
        .populate('areas')
        .populate('triggers');
    if(!allCharters) return res.status(500).send('Could not fetch charters');
    res.status(200).send(allCharters);

})


router.get('/:id', auth, async (req, res) => {

    let foundCharter = await Charter.findById(req.params.id)
        .populate('createdBy','username')
        .populate('updatedBy','username')
        .populate('areas')
        .populate('triggers');


    if(!foundCharter) return res.status(404).send('Invalid charter ID');
    res.status(200).send(foundCharter);
})

// update
router.patch('/:id', auth, async (req, res) => {

    let changes = req.body;

    changes.updated = Date.now();
    changes.updatedBy = req.user._id;

    let updatedCharter = await Charter.findOneAndUpdate({_id: req.params.id, deleted: false}, {$set: changes }, {new: true});
    if(!updatedCharter) return res.status(404).send('No such charter');
    res.status(200).send(updatedCharter);

})

//restore
router.patch('/restore/:id', auth, async (req, res) => {
    let restoredCharter = await Charter.findOneAndUpdate({_id: req.params.id}, {$set: {deleted: false}}, {new: true});
    if(!restoredCharter) return res.status(404).send('No such charter');
    res.status(200).send(restoredCharter);
});


//delete
router.delete('/:id', auth, async (req, res) => {
    let deletedCharter = await Charter.findOneAndUpdate({_id: req.params.id}, {$set: {deleted: true}}, {new: true});
    if(!deletedCharter) return res.status(404).send('No such charter');
    res.status(200).send('Charter was deleted');
});

// all required fields are added automatically on pressing Start session
router.post('/:charterId/session', auth, async (req, res) => {

    let newSession = {
        status: {
            statusName: 'To Do',
            date: Date.now()
        },
        notes: '',
        bugs: '',
        issues: '',
        version: [],
        environment: [],
        references: [],
        dataFiles: []
    };

    newSession.tester = {
        id: mongoose.Types.ObjectId(req.user._id),
        username: req.user.username
    };
    newSession.createdBy = {
        id: mongoose.Types.ObjectId(req.user._id),
        username: req.user.username
    };


    let  updatedCharter = await Charter.findOneAndUpdate({_id:req.params.charterId, deleted: false}, {$push: {sessions: newSession}, $set: {status: "In Progress"}});
    if(!updatedCharter) return res.status(404).send('No such charter');
    res.status(201).send(updatedCharter);

});

//update session
router.patch('/:charterId/session/:sessionId', auth, async (req, res) => {

    let changes = {};
    const changedProperties = Object.entries(req.body);
    for(const [key, value] of changedProperties) {
        changes["sessions.$." + key] = value;
    }

    console.log(changes)

    let  updatedCharter = await Charter.findOneAndUpdate({_id:req.params.charterId, "sessions._id": req.params.sessionId}, {$set:changes}, {new: true});

    if(!updatedCharter) return res.status(404).send('No such charter or session');
    res.status(201).send(updatedCharter);

});

//delete session permanently
router.delete('/:charterId/session/:sessionId', auth, async (req, res) => {

    let charterWithoutSession = await Charter.findOneAndUpdate({_id: req.params.charterId}, {$pull: {sessions:{_id: req.params.sessionId}}}, {new: true});
    if(!charterWithoutSession) return res.status(404).send('No such charter or session');
    res.status(200).send('Charter was deleted');

})

//delete session




module.exports = router;
