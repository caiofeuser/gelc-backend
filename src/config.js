// objeto que guarda informações sobre configurações do sistema
module.exports = {
  app: {
    PORT: process.env.PORT || 3333,
    URL: process.env.URL || "http://localhost:3333",
  },

  mongo: {
    URL:
      process.env.DBURL ||
      "mongodb+srv://admin:admin@cluster0.ozqkntq.mongodb.net/",
  },

  jwt: {
    SECRET: process.env.JWTSECRET || "ufersa",
    TOKEN_EXP_TIME: process.env.TOKEN_EXP_TIME || 3600,
  },

  email: {
    SERVICE: process.env.EMAILSERVICE || "gmail",
    USER: process.env.EMAILUSER,
    PASS: process.env.EMAILPASS,
  },

  cors: {
    WHITE:
      process.env.CORSWHITE ||
      "http://localhost:3000" ||
      "gelc-frontend.vercel.app" ||
      "www.gelc.com.br",
  },
};
