const Info = require("../models/Info");
const Image = require("../models/Image");

module.exports = {
  async select(req, res) {
    try {
      let info = await Info.findOne().populate("image", "-to -toModel");

      if (!info || info === null) {
        info = await Info.create({});
      }

      res.send(info);
    } catch (err) {
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },

  async update(req, res) {
    delete req.body._id;

    try {
      const info = await Info.findOneAndUpdate({}, req.body, {
        new: true,
        runValidators: true,
      }).populate("image");

      console.log(info._id);
      
      // Find the image document referenced in the `to` field of the current `Info` document
      const image = await Image.findOne({ to: info._id, toModel: "Info" });
      // console.log(image);
      if (image) {
        // Register the found image document in the current `Info` document
        info.image = image;
        await info.save();
      }

      res.send(info);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },
};
