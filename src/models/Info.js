const mongoose = require('mongoose');

// modelo que representa as informações presentes nas páginas do site
const InfoSchema = new mongoose.Schema({

	// número de publicações
	publicationsNumber: {
		type: Number,
		min: 0,
		default: 0,
		required: true,
	},

	// número de projetos
	projectsNumber: {
		type: Number,
		min: 0,
		default: 0,
		required: true,
	},

	// número de prêmios
	awardsNumber: {
		type: Number,
		min: 0,
		default: 0,
		required: true,
	},

	// email do site
	email: {
		type: String,
		default: 'gelc@gmail.com',
		required: true,
		lowercase: true
	},

	// telefone de contato
	phone: {
		type: String,
		default: '99999-9999',
		required: true,
	},

	// image do grupo
	image: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Image'
	}

});

// método criado devido a relação com o modelo de imagem, remove a imagem.
InfoSchema.methods.addImage = function(image) {
	this.image = image._id;
}

// método criado devido a relação com o modelo de imagem, adiciona a imagem.
InfoSchema.methods.rmImage = function() {
	this.image = undefined;
}

module.exports = mongoose.model('Info',InfoSchema);