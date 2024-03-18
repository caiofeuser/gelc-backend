const Image = require("../models/Image");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

module.exports = {
  // recuperar imagens registradas
  async index(req, res) {
    let { page = 1 } = req.query;

    try {
      const docs = await Image.paginate({}, { page, limit: 10 });

      if (!docs || docs.length === 0) {
        return res.status(404).send({ message: "no documents not found" });
      }

      return res.send(docs);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },

  // salvar nova imagem
  async store(req, res) {
    let { tomodel, to } = req.params;
    let { alt } = req.body;
    let { filename } = req.file;

    if (!filename) {
      fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .send({ message: "there are problems with the data sent" });
    }

    if (req.file.size > 2072576) {
      fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .send({ message: "there are problems with the data sent" });
    }

    let ext = path.extname(filename);

    if (ext !== ".png" && ext !== ".jpeg" && ext !== ".jpg") {
      fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .send({ message: "there are problems with the data sent" });
    }

    let name = path.basename(filename, ext);
    filename = `${name}.jpg`;

    let toModel = "";
    let resolution = {};

    let { _id: authParticipantId, permission: authParticipantPermission } =
      req.jwt;

    switch (tomodel) {
      case "info":
        if (authParticipantPermission !== "master") {
          fs.unlinkSync(req.file.path);
          return res.status(403).send({ message: "forbidden" });
        }

        toModel = "Info";
        resolution = { width: 768, height: 576 };
        break;

      case "participant":
        if (authParticipantId != to) {
          fs.unlinkSync(req.file.path);
          return res.status(403).send({ message: "forbidden" });
        }

        toModel = "Participant";
        resolution = { width: 263, height: 280 };
        break;

      case "project":
        let { coordinator, secondCoordinator } = await mongoose
          .model("Project")
          .findById(to)
          .select("coordinator secondCoordinator");

        if (
          authParticipantId != coordinator &&
          authParticipantId != secondCoordinator &&
          authParticipantPermission !== "master"
        ) {
          fs.unlinkSync(req.file.path);
          return res.status(403).send({ message: "forbidden" });
        }

        toModel = "Project";
        resolution = { width: 200, height: 200 };
        break;

      case "post":
        let { author } = await mongoose
          .model("Post")
          .findById(to)
          .select("author");
        if (
          authParticipantId != author &&
          authParticipantPermission !== "master"
        ) {
          fs.unlinkSync(req.file.path);
          return res.status(403).send({ message: "forbidden" });
        }

        toModel = "Post";
        resolution = { width: 768, height: 386 };
        break;

      case "download":
        if (authParticipantPermission !== "master") {
          fs.unlinkSync(req.file.path);
          return res.status(403).send({ message: "forbidden" });
        }

        toModel = "Download";
        resolution = { width: 200, height: 200 };
        break;

      case "tool":
        if (authParticipantPermission !== "master") {
          fs.unlinkSync(req.file.path);
          return res.status(403).send({ message: "forbidden" });
        }

        toModel = "Tool";
        resolution = { width: 200, height: 200 };
        break;

      default:
        fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .send({ message: "there are problems with the data sent" });
        break;
    }

    try {
      let fileData = await sharp(req.file.path)
        .resize(resolution)
        .jpeg({ quality: 65 })
        .toBuffer();
      let url = `data:image/jpeg;base64,${fileData.toString("base64")}`;
      let image = await Image.create({ url, alt, to, toModel });
      fs.unlinkSync(req.file.path);
      image.to = undefined;
      image.toModel = undefined;
      return res.status(201).send(image);
    } catch (err) {
      console.log(err);
      fs.unlinkSync(req.file.path);
      return res.status(500).send({ message: "could not save this object" });
    }
  },

  // remover imagem por meio da identificação
  // remove imagem por meio da identificação
  async remove(req, res) {
    let { id } = req.params;

    let { _id: authParticipantId, permission: authParticipantPermission } =
      req.jwt;

    try {
      let doc = await Image.findById(id).populate("to");

      if (!doc) {
        return res.status(404).send({ message: "no documents not found" });
      }

      switch (doc.toModel) {
        case "Info":
          if (authParticipantPermission !== "master") {
            return res.status(403).send({ message: "forbidden" });
          }
          break;

        case "Participant":
          if (authParticipantId != doc.to._id) {
            return res.status(403).send({ message: "forbidden" });
          }
          break;

        case "Project":
          if (
            authParticipantId != doc.to.coordinator &&
            authParticipantId != doc.to.secondCoordinator &&
            authParticipantPermission !== "master"
          ) {
            return res.status(403).send({ message: "forbidden" });
          }
          break;

        case "Post":
          if (
            authParticipantId != doc.to.author &&
            authParticipantPermission !== "master"
          ) {
            return res.status(403).send({ message: "forbidden" });
          }
          break;

        case "Download":
          if (authParticipantPermission !== "master") {
            return res.status(403).send({ message: "forbidden" });
          }
          break;

        case "Tool":
          if (authParticipantPermission !== "master") {
            return res.status(403).send({ message: "forbidden" });
          }
          break;
      }

      // Remove the document using Mongoose's deleteOne method
      await Image.deleteOne({ _id: id });

      return res.send();
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },

  // atualizar descrição da imagem
  async update(req, res) {
    let { id } = req.params;

    let { alt } = req.body;

    if (!alt) {
      return res
        .status(400)
        .send({ message: "there are problems with the data sent" });
    }

    let { _id: authParticipantId, permission: authParticipantPermission } =
      req.jwt;

    try {
      let doc = await Image.findById(id).populate("to");

      switch (doc.toModel) {
        case "Info":
          if (authParticipantPermission !== "master") {
            return res.status(403).send({ message: "forbidden" });
          }
          break;

        case "Participant":
          if (authParticipantId != doc.to._id) {
            return res.status(403).send({ message: "forbidden" });
          }
          break;

        case "Project":
          if (
            authParticipantId != doc.to.coordinator &&
            authParticipantId != doc.to.secondCoordinator &&
            authParticipantPermission !== "master"
          ) {
            return res.status(403).send({ message: "forbidden" });
          }
          break;

        case "Post":
          if (
            authParticipantId != doc.to.author &&
            authParticipantPermission !== "master"
          ) {
            return res.status(403).send({ message: "forbidden" });
          }
          break;

        case "Download":
          if (authParticipantPermission !== "master") {
            return res.status(403).send({ message: "forbidden" });
          }
          break;

        case "Tool":
          if (authParticipantPermission !== "master") {
            return res.status(403).send({ message: "forbidden" });
          }
          break;
      }

      doc.alt = alt;

      await doc.save();

      res.send(doc);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },
};
