const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

//responsável, titulo, descricao, imagem, participantes vínculados, data de criação e data de atualização
const ProjectSchema = new mongoose.Schema(
  {
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
    },

    secondCoordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Participant",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// método criado devido a relação com o modelo de participante, adiciona um participante.
ProjectSchema.methods.addParticipant = function (
  participant,
  office = "member"
) {
  switch (office) {
    case "member":
      this.members.addToSet(participant);
      break;
    case "secondcoordinator":
      this.secondCoordinator = participant;
      this.members.addToSet(participant);
      break;
    case "coordinator":
      this.coordinator = participant;
      this.members.addToSet(participant);
      break;
    default:
      return;
      break;
  }
};

// método criado devido a relação com o modelo de participante, remove um participante.
ProjectSchema.methods.rmParticipant = function (participant) {
  this.members.pull(participant._id);

  if (this.coordinator === participant._id) {
    this.coordinator = undefined;
  }

  if (this.secondCoordinator === participant._id) {
    this.secondCoordinator = undefined;
  }
};

// método criado devido a relação com o modelo de imagem, adiciona uma imagem.
ProjectSchema.methods.addImage = function (image) {
  this.image = image._id;
};

// método criado devido a relação com o modelo de imagem, adiciona a imagem.
ProjectSchema.methods.rmImage = function () {
  this.image = undefined;
};

// função que deve ser executada após um projeto ser removido
ProjectSchema.post("remove", async function (doc) {
  try {
    let { members } = await doc.populate("members").execPopulate();

    for (let member of members) {
      try {
        member.rmProject(doc);
        await member.save();
      } catch (err) {
        continue;
      }
    }
  } finally {
    return;
  }
});

ProjectSchema.plugin(mongoosePaginate);

ProjectSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Project", ProjectSchema);
