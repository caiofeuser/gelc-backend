const Project = require("../models/Project");

module.exports = {
  async index(req, res) {
    console.log("index");
    let { page = 1, search, public = false } = req.query;

    try {
      let options = {
        page,
        populate: [
          { path: "members", select: "email profile.name profile.lastname" },
          { path: "image", select: "-to -toModel" },
        ],
        limit: 4,
      };

      if (public) {
        options.select = "-description";
      }

      let query = search ? { $text: { $search: search } } : {};

      let docs = await Project.paginate(query, options);

      if (!docs || docs.length === 0) {
        return res.status(404).send({ message: "no documents not found" });
      }

      return res.send(docs);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },

  async select(req, res) {
    console.log("select");
    const id = req.params.id;

    try {
      const doc = await Project.findById(id)
        .populate("image")
        .populate(
          "coordinator secondCoordinator members",
          "profile.name profile.lastname email"
        );

      if (!doc) {
        return res.status(404).send({ message: "no documents not found" });
      }

      return res.send(doc);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },

  async store(req, res) {
    console.log("store");
    let { title, description, image } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .send({ message: "there are problems with the data sent" });
    }

    try {
      let doc = await Project.create({
        title,
        description,
        image: image || null,
      });
      return res.status(201).send(doc);
    } catch (err) {
      console.log(err);
      console.log(err);
      return res.status(500).send({ message: "could not save this object" });
    }
  },

  async remove(req, res) {
    console.log("remove");
    const { id } = req.params;

    try {
      let doc = await Project.findById(id);

      if (!doc) {
        return res.status(404).send({ message: "no documents not found" });
      }

      if (doc.coordinator || doc.secondCoordinator) {
        let { _id: authParticipantId, permission: authParticipantPermission } =
          req.jwt;

        if (
          authParticipantId != doc.coordinator &&
          authParticipantId != doc.secondCoordinator &&
          authParticipantPermission != "master"
        ) {
          return res.status(403).send({ message: "forbidden" });
        }
      }

      await Project.deleteOne({ _id: id }); // Delete the project document using the model

      return res.send();
    } catch (err) {
      console.log(err);
      console.log(err); // Log the error for debugging purposes
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },

  async update(req, res) {
    console.log("update");
    let id = req.params.id;
    console.log(req.body);

    try {
      let doc = await Project.findById(id);

      if (!doc) {
        return res.status(404).send({ message: "no documents not found" });
      }

      if (doc.coordinator || doc.secondCoordinator) {
        let { _id: authParticipantId, permission: authParticipantPermission } =
          req.jwt;

        if (
          authParticipantId != doc.coordinator &&
          authParticipantId != doc.secondCoordinator &&
          authParticipantPermission != "master"
        ) {
          return res.status(403).send({ message: "forbidden" });
        }
      }

      if (req.body.title) {
        doc.title = req.body.title;
      }

      if (req.body.description) {
        doc.description = req.body.description;
      }

      if (req.body.image) {
        doc.image = req.body.image;
      }

      await doc.save();

      doc.populate([
        { path: "image", select: "-to -toModel" },
        { path: "members", select: "email profile.name profile.lastname" },
      ]);

      return res.send(doc);
    } catch (err) {
      console.log(err);
      console.log(err);
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },
};
