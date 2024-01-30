const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const mongoosePaginate = require('mongoose-paginate-v2');

// dados pessoais do participante
const ProfileSchema = new mongoose.Schema({

    // nome do participante
    name: {
        type:String,
        required: true,
    },
    
    // sobrenome do participante
    lastname: {
        type:String,
        required: true,
    },

    // endereço do currículo na plataforma Lattes
    lattes: {
        type:String,
        required: true,
    },

    // descrição do usuário
    bio: {
        type: String,
        required: true,
    },

    // avatar do membro
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
    }

});


// modelo do cadastro para participantes
const ParticipantSchema = new mongoose.Schema({

    // email
    email: {
    	type: String,
    	required: true,
        unique: true,
        lowercase: true,
    },

    // senha do usuário
    password: {
        type: String,
        required: true,
        select: false,
    },

    passwordResetToken: {
        type: String,
        required: false,
        select: false,
    },

    passwordResetExpires: {
        type: Date,
        select: false,
    },
    // nível de permissões, o de maior nível é o master
    permission: {
    	type: String,
        enum: ['student','teacher','master'],
    	required: true,
        default: 'student',
        select: false,
    },

    // função ou cargo do membro
    office: {
    	type: String,
    	required: true,
    },

    // projetos
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],

    // postagens criadas
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],

    // dados pessoais
    profile: {
        type:ProfileSchema,
        unique:false,
    },

},{
    // data do registro
    timestamps: true,
});

// função para salvar a senha como um hash
ParticipantSchema.pre('save',async function(next) {

    if(this.password) {
        let hash = await bcrypt.hash(this.password,10);
        this.password = hash;
    }
    
    next();

});

// método criado devido a relação com o modelo de projeto, adiciona um projeto.
ParticipantSchema.methods.addProject = function(project) {
    
    this.projects.addToSet(project._id);

}

// método criado devido a relação com o modelo de projeto, remove um projeto.
ParticipantSchema.methods.rmProject = function(project) {
    
    this.projects.pull(project._id);

}

// método criado devido a relação com o modelo de imagem, remove a imagem.
ParticipantSchema.methods.addImage = function(image) {
    
    this.profile.image = image._id;

}

// método criado devido a relação com o modelo de imagem, adiciona a imagem.
ParticipantSchema.methods.rmImage = function() {

    this.profile.image = undefined;

}

// método criado devido a relação com o modelo de postagem, adiciona um post.
ParticipantSchema.methods.addPost = function(post) {
    
    this.posts.addToSet(post._id);

}

// método criado devido a relação com o modelo de postagem, remove um post.
ParticipantSchema.methods.rmPost = function(post) {
    
    this.posts.pull(post._id);

}

// função que deve ser executada após um participante ser removido
ParticipantSchema.post('remove', async function(doc) {

    try {

        let {projects,posts} = (await doc.populate('projects').populate('posts').execPopulate());
        
        for(let project of projects) {
            
            try {
            
                project.rmParticipant(doc);
                await project.save();
            
            } catch(err) {
            
                continue;
            
            }
        }

        for(let post of posts) {
            
            try {
            
                post.rmAuthor(doc);
                await post.save();
            
            } catch(err) {
            
                continue;
            
            }
        }

    } finally {

        return;
    
    }

});

ParticipantSchema.plugin(mongoosePaginate);

ParticipantSchema.index({'email':'text','profile.name':'text','profile.lastname':'text','profile.bio':'text'});

module.exports = mongoose.model('Participant', ParticipantSchema);