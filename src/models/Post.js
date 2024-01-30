const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');


// modelo de postagem
const PostSchema = new mongoose.Schema({
    
    // autor da postagem
    author: {
    	type: mongoose.Schema.Types.ObjectId,
    	ref: 'Participant'
    },

    // título da postagem
    title: {
    	type:String,
    	required: true
    },

    // descrição
    description: {
    	type: String,
    	required: true
    },
    
    // imagem principal
    image: {
    	type: mongoose.Schema.Types.ObjectId,
    	ref: 'Image'
    },
    
    // conteúdo em markdown
    content: {
    	type:String,
    	required: true
    },

    accepted: {
        type: Boolean,
        required: true,
        default: false
    }

},{
    // data da publicação
    timestamps: true,
});

// método criado devido a relação com o modelo de imagem, adiciona uma imagem.
PostSchema.methods.addImage = function(image) {
    
    this.image = image._id;

}

// método criado devido a relação com o modelo de imagem, remove a imagem.
PostSchema.methods.rmImage = function() {

    this.image = undefined;

}

// método criado devido a relação com o modelo de participante, adiciona uma participante como autor.
PostSchema.methods.addAuthor = function(participant) {
    
    this.author = participant._id;

}

// método criado devido a relação com o modelo de participante, remove participante como autor.
PostSchema.methods.rmAuthor = function() {

    this.author = undefined;

}

// função que deve ser executada após uma postagem ser removida
PostSchema.post('remove', async function(doc) {
    
    try {

        let {author} = (await doc.populate('author').execPopulate());
        author.rmPost(doc);
        await author.save();

    } finally {

        return;
    
    }

});

PostSchema.index({'title':'text','description':'text','content':'text'});

PostSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', PostSchema);