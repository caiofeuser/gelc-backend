const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = {
  validation(req, res, next) {
    if (req.headers.authorization) {
      try {
        let [pre, token] = req.headers.authorization.split(" ");

        if (pre !== "Bearer") {
          return res.status(401).send({ message: "bad token" });
        } else {
          req.jwt = jwt.verify(token, config.jwt.SECRET);
          next();
          return;
        }
      } catch (err) {
        return res.status(403).send({ message: "forbidden access" });
      }
    }

    return res.status(401).send({ message: "authentication required" });
  },

  permission(minRequiredPermission) {
    let level = (permission) => {
      switch (permission) {
        case "student":
          return 1;
          break;

        case "teacher":
          return 2;
          break;

        case "master":
          return 3;
          break;

        default:
          return 0;
          break;
      }
    };

    return (req, res, next) => {
      let minRequiredPermissionLevel = level(minRequiredPermission);

      let participantPermissionLevel = level(req.jwt.permission);

      if (participantPermissionLevel >= minRequiredPermissionLevel) {
        next();
        return;
      } else {
        return res.status(403).send({ message: "insufficient privileges" });
      }
    };
  },
};
