const Project = require("../models/Project");
const Participant = require("../models/Participant");

module.exports = {
  async store(req, res) {
    console.log("store sub");
    let {
      projectid: projectId,
      office,
      participantemail: participantEmail,
    } = req.params;

    if (
      office !== "member" &&
      office !== "secondcoordinator" &&
      office !== "coordinator"
    ) {
      return res
        .status(400)
        .send({ message: "there are problems with the data sent" });
    }

    try {
      let project = await Project.findById(projectId);
      let participant = await Participant.findOne({ email: participantEmail });

      if (!project || !participant) {
        return res
          .status(400)
          .send({ message: "there are problems with the data sent" });
      }

      if (project.coordinator || project.secondCoordinator) {
        let { _id: authParticipantId, permission: authParticipantPermission } =
          req.jwt;

        if (
          authParticipantId != project.coordinator &&
          authParticipantId != project.secondCoordinator &&
          authParticipantPermission != "master"
        ) {
          return res.status(403).send({ message: "forbidden" });
        }
      }

      project.addParticipant(participant, office);
      participant.addProject(project);

      await project.save();
      await participant.save();
      // project = await project
      // .populate("members", "email")
      // .populate("image", "-to -toModel")
      project.populate([
        {
          path: "members",
          select: "email profile.name profile.lastname",
        },
        {
          path: "image",
          select: "-to -toModel",
        },
      ]);

      console.log(project);

      return res.send(project);
    } catch (err) {
      console.log(err);
      return res.status(500).send({ message: "could not save this object" });
    }
  },

  async remove(req, res) {
    console.log("remove sub");
    let { projectid: projectId, participantemail: participantEmail } =
      req.params;

    try {
      let project = await Project.findById(projectId);
      let participant = await Participant.findOne({ email: participantEmail });

      if (!project || !participant) {
        return res
          .status(400)
          .send({ message: "there are problems with the data sent" });
      }

      if (project.coordinator || project.secondCoordinator) {
        let { _id: authParticipantId, permission: authParticipantPermission } =
          req.jwt;

        if (
          authParticipantId != project.coordinator &&
          authParticipantId != project.secondCoordinator &&
          authParticipantPermission != "master"
        ) {
          return res.status(403).send({ message: "forbidden" });
        }
      }

      project.rmParticipant(participant);
      participant.rmProject(project);

      await project.save();
      await participant.save();
      project.populate([
        {
          path: "members",
          select: "email",
        },
        {
          path: "image",
          select: "-to -toModel",
        },
      ]);

      return res.send(project);
    } catch (err) {
      return res.status(500).send({ message: "unable to retrieve data" });
    }
  },
};
