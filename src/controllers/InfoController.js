const Info = require('../models/Info');

module.exports = {

	async select(req,res) {

		try {

			let info = await Info.findOne().populate('image','-to -toModel');

			if(!info || info ===null) {
				info = await Info.create({});
			}

			res.send(info);

		}catch(err) {

			return res.status(500).send({message:'unable to retrieve data'});

		}

	},

	async update(req,res) {

		delete req.body._id;

		delete req.body.image;

		try {

			const info = await Info.findOneAndUpdate({},req.body,{new:true, runValidators:true}).populate('image');

			res.send(info);

		}catch(err) {

			return res.status(500).send({message:'unable to retrieve data'});

		}

	}

}