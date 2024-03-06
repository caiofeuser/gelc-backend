const Post = require("../models/Post");

module.exports = {
  async index(req, res) {
    let { page = 1, search, public = false } = req.query;

    try {
      let options = {
        page,
        sort: { createdAt: -1, updatedAt: -1 },
        populate: [
          { path: "author", select: "email" },
          { path: "image", select: "-to -toModel" },
        ],
        limit: 4,
      };

      if (public) {
        options.select = "-content -author";
      }

      let query = search ? { $text: { $search: search } } : {};

      if (public) {
        query.accepted = true;
      }

      let docs = await Post.paginate(query, options);

      if (!docs || docs.length === 0) {
        return res.status(404).send({ message: "no documents not found" });
      }

      return res.send(docs);
    } catch (err) {
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },

  async select(req, res) {
    const id = req.params.id;

    try {
      const doc = await Post.findById(id)
        .populate("author", "email profile")
        .populate("image", "-to -toModel");

      if (!doc) {
        return res.status(404).send({ message: "no documents not found" });
      }

      return res.send(doc);
    } catch (err) {
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },

  async store(req, res) {
    let { title, description, content, image } = req.body;

    let author = { _id: req.jwt._id };

    if (!author || !title || !description || !content) {
      return res
        .status(400)
        .send({ message: "there are problems with the data sent" });
    }

    try {
      let doc = await Post.create({
        title: title,
        description: description,
        content: content,
        image: image || null,
      });
      doc.addAuthor(author);
      await doc.save();
      let { author: participant } = await doc.populate("author").execPopulate();
      participant.addPost(doc);
      await participant.save();
      return res.status(201).send(doc);
    } catch (err) {
      return res.status(500).send({ message: "could not save this object" });
    }
  },

  async remove(req, res) {
    const { id } = req.params;

    try {
      let doc = await Post.findById(id);

      if (!doc) {
        return res.status(404).send({ message: "no documents not found" });
      }

      if (doc.author) {
        let { _id: authParticipantId, permission: authParticipantPermission } =
          req.jwt;

        if (
          doc.author != authParticipantId &&
          authParticipantPermission !== "master"
        ) {
          return res.status(403).send({ message: "forbidden" });
        }
      }

      await doc.remove();

      return res.send();
    } catch (err) {
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },

  async update(req, res) {
    let id = req.params.id;
  
    try {
      let doc = await Post.findById(id);
  
      if (!doc) {
        return res.status(404).send({ message: "no documents not found" });
      }
  
      let { _id: authParticipantId, permission: authParticipantPermission } = req.jwt;
  
      if (doc.author != authParticipantId && authParticipantPermission !== "master") {
        return res.status(403).send({ message: "forbidden" });
      }
  
      if (req.body.title) {
        doc.title = req.body.title;
      }
  
      if (req.body.description) {
        doc.description = req.body.description;
      }
  
      if (req.body.content) {
        doc.content = req.body.content;
      }
  
      if (req.body.accepted && authParticipantPermission === "master") {
        doc.accepted = req.body.accepted;
      }
  
      if (req.body.image) {
        doc.image = req.body.image;
      }
  
      await doc.save();
  
      // Use an array of objects to populate multiple fields
      doc.populate([
        { path: "author", select: "email profile" },
        { path: "image", select: "-to -toModel" },
      ])
  
      return res.send(doc);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },
  
};
