const Tool = require("../models/Tool");

module.exports = {
  async index(req, res) {
    let { page = 1, search } = req.query;

    try {
      let options = {
        page,
        populate: { path: "image", select: "-to -toModel" },
        limit: 4,
      };

      let query = search ? { $text: { $search: search } } : {};

      let docs = await Tool.paginate(query, options);

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
    const id = req.params.id;

    try {
      const doc = await Tool.findById(id).populate([
        { path: "image", select: "-to -toModel" },
      ]);
      // doc.populate([{ path: "image", select: "-to -toModel" }]);

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
    let { title, description, url, image } = req.body;

    if (!title || !description || !url) {
      return res
        .status(400)
        .send({ message: "there are problems with the data sent" });
    }

    try {
      let doc = await Tool.create({
        title,
        description,
        url,
        image: image || null,
      });
      return res.status(201).send(doc);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "could not save this object" });
    }
  },

  async remove(req, res) {
    const { id } = req.params;

    try {
      let doc = await Tool.findByIdAndDelete(id);

      if (!doc) {
        return res.status(404).send({ message: "no documents not found" });
      }

      // Envie uma resposta indicando que o documento foi removido com sucesso
      return res.status(200).send({ message: "document removed successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "could not delete this object" });
    }
  },

  async update(req, res) {
    console.log("put");
    console.log(req.body);
    let id = req.params.id;
    try {
      let doc = await Tool.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!doc) {
        return res.status(404).send({ message: "no documents found" });
      }

      await doc.save();

      doc.populate([{ path: "image", select: "-to -toModel" }]);

      return res.status(200).send(doc);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "could not update this object" });
    }
  },
};
