const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ToolSchema = new mongoose.Schema(
  {
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
      required: true,
    },

    // imagem associada ao download
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
  },
  {
    timestamps: true,
  }
);

// método criado devido a relação com o modelo de imagem, remove a imagem.
ToolSchema.methods.addImage = function (image) {
  this.image = image._id;
};

// método criado devido a relação com o modelo de imagem, adiciona a imagem.
ToolSchema.methods.rmImage = function () {
  this.image = undefined;
};

ToolSchema.plugin(mongoosePaginate);

ToolSchema.index({ title: "text", description: "text" });

mongoose.model("Tool", ToolSchema);
module.exports = mongoose.model("Tools", ToolSchema);

// Path: src/models/Tools.js
