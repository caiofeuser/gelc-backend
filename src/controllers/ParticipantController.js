const Participant = require('../models/Participant');


module.exports = {

	// listar usuários salvos no banco de dados
	async index(req, res) {

		let { page=1, search, public=false } = req.query;

		try {

			let options = { 
				
				populate:{ path:'profile.image', select:'-to -toModel'},
				page,
				limit:4

			};

			if(public) {
                options.select = '-profile.bio';
            }

			let query = search ? { $text:{ $search:search } }:{};

			if(public) {
                query.$and = [{profile:{ $exists: true }},{'profile.image':{ $exists: true }}];
            }

			const docs = await Participant.paginate(query,options);

			if (!docs || docs.length === 0) {
				return res.status(404).send({ message: 'no documents not found' });
			}

			return res.send(docs);

		} catch (err) {

			return res.status(500).send({ message: 'unable to retrieve data' });

		}

	},

	// selecionar usuário específico por meio da identificação
	async select(req, res) {

		const id = req.params.id;

		try {

			const doc = await Participant.findById(id).populate('projects','title image').populate('profile.image','-to -toModel');

			if (!doc) {
				return res.status(404).send({ message: 'no documents not found' });
			}

			return res.send(doc);

		} catch (err) {
			console.log(err);
			return res.status(500).send({ message: 'unable to retrieve data' });

		}

	},

	// salvar novo usuário
	async store(req, res) {

		let {email, password, permission, office} = req.body;

		if(!email || !password || !permission || !office) {
			return res.status(400).send({message: 'there are problems with the data sent'});
		}

		try {

			let participant = await Participant.create({email, password, permission, office});

			participant.password = undefined;

			participant.permission = undefined;

			return res.status(201).send(participant);


		} catch (err) {

			return res.status(500).send({ message: 'could not save this object' });

		}

	},

	// remover usuário por meio da identificação

	async remove(req,res) {

		const {id} = req.params;

		let {permission: authParticipantPermission} = req.jwt;


		try {

			let doc = await Participant.findById(id).select('+permission');

			if (!doc) {
				return res.status(404).send({ message: 'no documents not found' });
			}

			if(doc.permission === 'master') {

				return res.status(403).send({message:'forbidden'});

			}

			if(doc.permission === 'teacher' && authParticipantPermission ==='teacher') {

				return res.status(403).send({message:'forbidden'});

			}

			await doc.remove();

			return res.send();

		} catch(err) {

			return res.status(500).send({message:'unable to retrieve data'});

		}

	},

	// atualizar registro de membro
	async update(req, res) {

		let id = req.params.id;

		let {_id:authParticipantId} = req.jwt;

		if(id!==authParticipantId) {

			return res.status(403).send({message:'forbidden'});
		
		}

		try {

			let doc = await Participant.findById(id);

			if (!doc) {
				return res.status(404).send({ message: 'no documents not found' });
			}

			if(req.body.profile) {
				doc.profile = doc.profile?{...doc.profile.toObject(),...req.body.profile}:req.body.profile;
			}

			if(req.body.email) {
				doc.email = req.body.email;
			}

			if(req.body.office) {
				doc.office = req.body.office;
			}

			await doc.save();

			doc = await doc.populate('profile.image','-to -toModel').execPopulate();

			return res.send(doc);

		} catch(err) {
			console.log(err);
			return res.status(500).send({message:'unable to retrieve data'});

		}

	}

};