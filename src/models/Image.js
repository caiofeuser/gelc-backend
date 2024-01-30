const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// modelo do cadastro para imagens
const ImageSchema = new mongoose.Schema({
    
    // nome do arquivo
    url: {
        type: String,
        required: true,
    },

    // descrição da imagem
    alt: {
        type: String,
    },

    // referência para um modelo que utiliza a imagem
    to: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'toModel'
    },

    // modelos que podem ser refereciados.
    toModel: {
        type: String,
        required: true,
        enum:['Info','Participant','Project','Post','Download'],
    }

},{

    id: false,

});


// função que deve ser executada após uma imagem ser criada
ImageSchema.post('save', async function(doc) {

    try {

        let {to} = (await doc.populate('to').execPopulate());
        to.addImage(doc);
        await to.save();
        
    } finally {

        return;
    
    }

});

// função que deve ser executada apoós uma imagem ser removida
ImageSchema.post('remove', async function(doc) {
    
    try {

        let {to} = (await doc.populate('to').execPopulate());
        to.rmImage();
        await to.save();

    } finally {

        return;
    
    }

});

ImageSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Image', ImageSchema);