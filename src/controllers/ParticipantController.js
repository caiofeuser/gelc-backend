const Participant = require("../models/Participant");

module.exports = {
  // Listar usuários salvos no banco de dados
  async index(req, res) {
    let { page = 1, search, public = false } = req.query;

    try {
      let options = {
        populate: { path: "profile.image", select: "-to -toModel" },
        page,
        limit: 4,
      };

      if (public) {
        options.select = "-profile.bio";
      }

      let query = search ? { $text: { $search: search } } : {};

      if (public) {
        query.$and = [
          { profile: { $exists: true } },
          { "profile.image": { $exists: true } },
        ];
      }

      const docs = await Participant.paginate(query, options);

      if (!docs || docs.length === 0) {
        return res.status(404).send({ message: "No documents found" });
      }

      return res.send(docs);
    } catch (err) {
      console.error(err);
      return res.status(500).send({ message: "Unable to retrieve data" });
    }
  },

  // Selecionar usuário específico por meio da identificação
  async select(req, res) {
    const id = req.params.id;

    try {
      const doc = await Participant.findById(id)
        .populate("projects", "title image")
        .populate("profile.image", "-to -toModel");

      if (!doc) {
        return res.status(404).send({ message: "No document found" });
      }

      return res.send(doc);
    } catch (err) {
      console.error(err);
      return res.status(500).send({ message: "Unable to retrieve data" });
    }
  },

  // Salvar novo usuário
  async store(req, res) {
    let { email, password, permission, office } = req.body;

    if (!email || !password || !permission || !office) {
      return res
        .status(400)
        .send({ message: "There are problems with the data sent" });
    }

    try {
      let participant = await Participant.create({
        email,
        password,
        permission,
        office,
      });

      participant.password = undefined;
      participant.permission = undefined;

      return res.status(201).send(participant);
    } catch (err) {
      console.error(err);
      return res.status(500).send({ message: "Could not save this object" });
    }
  },

  // Remover usuário por meio da identificação
  async remove(req, res) {
    const { id } = req.params;

    let { permission: authParticipantPermission } = req.jwt;

    try {
      let doc = await Participant.findById(id).select("+permission");

      if (!doc) {
        return res.status(404).send({ message: "No document found" });
      }

      if (doc.permission === "master") {
        return res.status(403).send({ message: "Forbidden" });
      }

      if (
        doc.permission === "teacher" &&
        authParticipantPermission === "teacher"
      ) {
        return res.status(403).send({ message: "Forbidden" });
      }

      await Participant.deleteOne({ _id: id });

      return res.send();
    } catch (err) {
      console.error(err);
      return res.status(500).send({ message: "Unable to retrieve data" });
    }
  },

  // Atualizar registro de membro
  // async update(req, res) {
  //   let id = req.params.id;
  //   let { _id: authParticipantId } = req.jwt;

  //   console.log(req.body);

  //   try {
  //     // Use findByIdAndUpdate to directly update and get the updated document
  //     let doc = await Participant.findByIdAndUpdate(
  //       id,
  //       req.body,
  //       { new: true } // Return the modified document rather than the original
  //     );

  //     if (!doc) {
  //       return res.status(404).send({ message: "No document found" });
  //     }

  //     await doc.save();

  //     doc.populate([{ path: "profile.image", select: "-to -toModel" }]);

  //     return res.send(doc);
  //   } catch (err) {
  //     console.error(err);
  //     return res.status(500).send({ message: "Unable to retrieve data" });
  //   }
  // },
  async update(req, res) {
    let id = req.params.id;
    let { _id: authParticipantId } = req.jwt;
    console.log(req.body);
    try {
      // Fetch the participant document
      let doc = await Participant.findById(id).populate("profile.image");

      if (!doc) {
        return res.status(404).send({ message: "No document found" });
      }

      // Update profile data if present in request body
      if (req.body.profile) {
        // Merge existing profile data with updated profile data
        doc.profile = { ...doc.profile, ...req.body.profile };
      }

      // Check if there's an image update in the request body
      if (req.body.profile && req.body.profile.image) {
        // If an image is being updated, update the image reference in the profile
        doc.profile.image = req.body.profile.image;
      }

      // Save the updated document
      await doc.save();

      // Return the updated document
      return res.send(doc);
    } catch (err) {
      console.error(err);
      return res.status(500).send({ message: "Unable to retrieve data" });
    }
  },
};
