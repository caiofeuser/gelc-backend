const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// modelo do cadastro para downloads
const DownloadSchema = new mongoose.Schema({
    
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
DownloadSchema.methods.addImage = function(image) {
    this.image = image._id;
    // console.log(this.image);
}

// método criado devido a relação com o modelo de imagem, adiciona a imagem.
DownloadSchema.methods.rmImage = function() {
    this.image = undefined;
}

DownloadSchema.plugin(mongoosePaginate);

DownloadSchema.index({'title':'text','description':'text'});

module.exports = mongoose.model('Download', DownloadSchema);