const config = require("../config");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Participant = require("../models/Participant");
const mailer = require("../modules/mailer");

module.exports = {
  async login(req, res) {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: "invalid email or password" });
    }

    try {
      // console.log(email, password)

      let participant = await Participant.findOne({ email }).select(
        "+password +permission"
      );
      if (!participant) {
        return res.status(401).send({ message: "email not found" });
      }
      if(await bcrypt.compare(password, participant.password)) {
        // if(password === participant.password) {
        let { _id, permission } = participant;
        let token = jwt.sign({ _id, permission }, config.jwt.SECRET, {
          expiresIn: config.jwt.TOKEN_EXP_TIME,
        });
        res.status(201).send({ _id, permission, accessToken: token });
      } else {
        return res.status(401).send({ message: "wrong password" });

      }
    } catch (err) {
      return res
        .status(500)
        .send({ message: "a problem was encountered on the server" });
    }
  },

  async forgotPassword(req, res) {
    let { email } = req.body;

    try {
      let participant = await Participant.findOne({ email });

      if (!participant) {
        return res.status(400).send({ message: "email not found" });
      }

      let token = crypto.randomBytes(20).toString("hex");
      const now = new Date();
      now.setHours(now.getHours() + 1);

      await Participant.findByIdAndUpdate(participant.id, {
        $set: {
          passwordResetToken: token,
          passwordResetExpires: now,
        },
      });

      mailer.sendMail(
        {
          to: email,
          from: "gelc@gmail.com",
          subject: "GELC - Recuperação de senha",
          html: `<p>Esqueceu sua senha de acesso? utilize esse token para redefini-la: <strong>${token}</strong></p>`,
        },
        (err) => {
          if (err) {
            return res
              .status(400)
              .send({ message: "cannot send forgot password email" });
          }

          return res.send();
        }
      );
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .send({ message: "error on forgot password, try again" });
    }
  },

  async resetPassword(req, res) {
    let { email, token, password } = req.body;

    try {
      let participant = await Participant.findOne({ email }).select(
        "+passwordResetToken +passwordResetExpires"
      );

      if (!participant) {
        return res.status(400).send({ message: "email not found" });
      }

      if (token !== participant.passwordResetToken) {
        return res.status(400).send({ message: "bad token" });
      }

      let now = new Date();

      if (now > participant.passwordResetExpires) {
        return res
          .status(400)
          .send({ message: "token expired, generate a new one" });
      }

      participant.password = password;

      await participant.save();

      return res.send();
    } catch (err) {
      return res
        .status(500)
        .send({ message: "cannot reset password, try again" });
    }
  },
};
