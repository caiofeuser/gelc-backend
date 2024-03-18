const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-paginate-v2");

// Dados pessoais do participante
const ProfileSchema = new mongoose.Schema({
  // Nome do participante
  name: {
    type: String,
    // required: true,
  },

  // Sobrenome do participante
  lastname: {
    type: String,
    // required: true,
  },

  // Endereço do currículo na plataforma Lattes
  lattes: {
    type: String,
    // required: true,
  },

  // Descrição do usuário
  bio: {
    type: String,
    // required: true,
  },

  // Avatar do membro
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Image",
  },
});

// Modelo do cadastro para participantes
const ParticipantSchema = new mongoose.Schema(
  {
    // Email
    email: {
      type: String,
      // required: true,
      unique: true,
      lowercase: true,
    },

    // Senha do usuário
    password: {
      type: String,
      // required: true,
      select: false,
    },

    passwordResetToken: {
      type: String,
      // required: false,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // Nível de permissões, o de maior nível é o master
    permission: {
      type: String,
      enum: ["student", "teacher", "master"],
      // required: true,
      default: "student",
      select: false,
    },

    // Função ou cargo do membro
    office: {
      type: String,
      // required: true,
    },

    // Projetos
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],

    // Postagens criadas
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    // Dados pessoais
    profile: {
      type: ProfileSchema, // Updated to use the ProfileSchema
      unique: false,
    },
  },
  {
    // Data do registro
    timestamps: true,
  }
);

// Função para salvar a senha como um hash
ParticipantSchema.pre("save", async function (next) {
  if (this.password) {
    let hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
  }
  next();
});

// Método criado devido a relação com o modelo de projeto, adiciona um projeto
ParticipantSchema.methods.addProject = function (project) {
  this.projects.addToSet(project._id);
};

// Método criado devido a relação com o modelo de projeto, remove um projeto
ParticipantSchema.methods.rmProject = function (project) {
  this.projects.pull(project._id);
};

// Método criado devido a relação com o modelo de imagem, remove a imagem
ParticipantSchema.methods.addImage = function (image) {
  this.profile.image = image._id;
};

// Método criado devido a relação com o modelo de imagem, adiciona a imagem
ParticipantSchema.methods.rmImage = function () {
  this.profile.image = undefined;
};

// Método criado devido a relação com o modelo de postagem, adiciona um post
ParticipantSchema.methods.addPost = function (post) {
  this.posts.addToSet(post._id);
};

// Método criado devido a relação com o modelo de postagem, remove um post
ParticipantSchema.methods.rmPost = function (post) {
  this.posts.pull(post._id);
};

// Função que deve ser executada após um participante ser removido
ParticipantSchema.post("remove", async function (doc) {
  try {
    let { projects, posts } = await doc
      .populate("projects")
      .populate("posts")
      .execPopulate();
    for (let project of projects) {
      try {
        project.rmParticipant(doc);
        await project.save();
      } catch (err) {
        continue;
      }
    }
    for (let post of posts) {
      try {
        post.rmAuthor(doc);
        await post.save();
      } catch (err) {
        continue;
      }
    }
  } finally {
    return;
  }
});

ParticipantSchema.plugin(mongoosePaginate);

ParticipantSchema.index({
  email: "text",
  "profile.name": "text",
  "profile.lastname": "text",
  "profile.bio": "text",
});

module.exports = mongoose.model("Participant", ParticipantSchema);
