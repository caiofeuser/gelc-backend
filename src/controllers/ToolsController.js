const Tools = require("../models/Tools");

module.exports = {
  async index(req, res) {
    let { page = 1, search } = req.query;

    try {
      let options = {
        page,
        limit: 4,
      };

      let query = search ? { $text: { $search: search } } : {};

      let docs = await Tools.paginate(query, options);

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
      const doc = await Tools.findById(id);

      if (!doc) {
        return res.status(404).send({ message: "no documents not found" });
      }

      return res.send(doc);
    } catch (err) {
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },

  async store(req, res) {
    let { title, description, url } = req.body;

    if (!title || !description || !url) {
      return res
        .status(400)
        .send({ message: "there are problems with the data sent" });
    }

    try {
      let doc = await Tools.create({ title, description, url });
      return res.status(201).send(doc);
    } catch (err) {
      return res.status(500).send({ message: "could not save this object" });
    }
  },

  async remove(req, res) {
    const { id } = req.params;

    try {
      let doc = await Tools.findByIdAndDelete(id);

      if (!doc) {
        return res.status(404).send({ message: "no documents not found" });
      }
    } catch (err) {
      return res.status(500).send({ message: "could not delete this object" });
    }
  },
  async update(req, res) {
    let id = req.params.id;

    delete req.body._id;

    delete req.body.createdAt;

    delete req.body.updatedAt;

    delete req.body.image;

    try {
      let doc = await Tools.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!doc) {
        return res.status(404).send({ message: "no documents not found" });
      }
    } catch (err) {
      return res.status(500).send({ message: "could not update this object" });
    }
  },
};
