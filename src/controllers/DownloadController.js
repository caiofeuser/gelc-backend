const Download = require("../models/Download");

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

      let docs = await Download.paginate(query, options);

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
      const doc = await Download.findById(id);

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
      let doc = await Download.create({ title, description, url });
      return res.status(201).send(doc);
    } catch (err) {
      return res.status(500).send({ message: "could not save this object" });
    }
  },

  async remove(req, res) {
    const { id } = req.params;

    try {
      let doc = await Download.findByIdAndDelete(id);

      if (!doc) {
        return res.status(404).send({ message: "no documents not found" });
      }

      return res.send();
    } catch (err) {
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },

  async update(req, res) {
    let id = req.params.id;

    delete req.body._id;

    delete req.body.createdAt;

    delete req.body.updatedAt;

    delete req.body.image;

    try {
      let doc = await Download.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!doc) {
        return res.status(404).send({ message: "no documents not found" });
      }

      return res.send(doc);
    } catch (err) {
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },
};
