const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');


const ToolsSchema = new mongoose.Schema({

    // título do download
    title: {
        type: String,
        required: true,
        unique: true,
    },

    // descrição do download
    description: {
        type: String,
        required: true,
    },

    // enderço do arquivo.
    url: {
        type: String,
        required: true
    },

    // imagem associada ao download
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    }

}, {
    timestamps: true
});

// método criado devido a relação com o modelo de imagem, remove a imagem.
ToolsSchema.methods.addImage = function(image) {
    this.image = image._id;
}

// método criado devido a relação com o modelo de imagem, adiciona a imagem.
ToolsSchema.methods.rmImage = function() {
    this.image = undefined;
}

ToolsSchema.plugin(mongoosePaginate);

ToolsSchema.index({'title':'text','description':'text'});

module.exports = mongoose.model('Tools', ToolsSchema);

// Path: src/models/Tools.js