const Project = require('../models/Project');

module.exports = {
    
	async index(req,res) {

		let { page=1, search, public=false } = req.query;

		try {

			let options = {

				page,
				populate:[
					{path:'members',select:'email profile.name profile.lastname'},
					{path:'image',select:'-to -toModel'}
				],
				limit:4
			
			};

			if(public) {
                options.select = '-description';
            }

			let query = search ? { $text:{ $search:search } }:{};

			let docs = await Project.paginate(query,options);

			if (!docs || docs.length === 0) {
				return res.status(404).send({ message: 'no documents not found' });
			}

			return res.send(docs);

		} catch(err) {
            
			return res.status(500).send({ message: 'unable to retrieve data' });

		}

	},

	
	async select(req,res) {

		const id = req.params.id;

		try {

			const doc = await Project.findById(id).populate('image').populate('coordinator secondCoordinator members','profile.name profile.lastname email');

			if (!doc) {
				return res.status(404).send({ message: 'no documents not found' });
			}

			return res.send(doc);

		} catch (err) {

			return res.status(500).send({ message: 'unable to retrieve data' });

		}

	},

	async store(req, res) {

		let {title, description} = req.body;

		if(!title || !description) {
			
			return res.status(400).send({message: 'there are problems with the data sent'});
		
		}

		try {

			let doc = await Project.create({title, description});
			return res.status(201).send(doc);


		} catch (err) {

			return res.status(500).send({ message: 'could not save this object' });

		}

	},

	async remove(req,res) {

		const {id} = req.params;

		try {

			let doc = await Project.findById(id);

			if (!doc) {
				return res.status(404).send({ message: 'no documents not found' });
			}

			if(doc.coordinator || doc.secondCoordinator) {

				let {_id:authParticipantId, permission: authParticipantPermission} = req.jwt;

				if(authParticipantId != doc.coordinator && authParticipantId != doc.secondCoordinator && authParticipantPermission != 'master') {

					return res.status(403).send({message:'forbidden'});

				}

			}

			await doc.remove();

			return res.send();

		} catch(err) {

			return res.status(500).send({message:'unable to retrieve data'});

		}

	},

	async update(req, res) {

		let id = req.params.id;

		try {

			let doc = await Project.findById(id);

			if (!doc) {
				return res.status(404).send({ message: 'no documents not found' });
			}

			if(doc.coordinator || doc.secondCoordinator) {

				let {_id:authParticipantId, permission: authParticipantPermission} = req.jwt;

				if(authParticipantId != doc.coordinator && authParticipantId != doc.secondCoordinator && authParticipantPermission != 'master') {

					return res.status(403).send({message:'forbidden'});

				}

			}

			if(req.body.title) {
				doc.title = req.body.title;
			}

			if(req.body.description) {
				doc.description = req.body.description;
			}

			await doc.save();

			doc = await doc.populate('image','-to -toModel').execPopulate();

			return res.send(doc);

		} catch(err) {

			return res.status(500).send({message:'unable to retrieve data'});

		}

	}


};