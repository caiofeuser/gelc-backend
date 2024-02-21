const express = require("express");

// importar controladores
const PostController = require("./controllers/PostController");
const InfoController = require("./controllers/InfoController");
const ImageController = require("./controllers/ImageController");
const ParticipantController = require("./controllers/ParticipantController");
const ProjectController = require("./controllers/ProjectController");
const ProjectSubscriptionController = require("./controllers/ProjectSubscriptionController");
const AuthController = require("./controllers/AuthController");
const DownloadController = require("./controllers/DownloadController");
const ToolsController = require("./controllers/ToolsController");
// importar middlewares
const authMiddlewares = require("./middlewares/auth");
const uploadMiddlewares = require("./middlewares/upload");

//configurando o express para o funcionamento das rotas
const routes = new express.Router();

// rotas para manipular as informações presentes no site
routes.get("/info", InfoController.select);
routes.put(
  "/info",
  authMiddlewares.validation,
  authMiddlewares.permission("master"),
  InfoController.update
);

// rotas para manipular as imagens utilizadas pelo sistema
routes.post(
  "/image/:tomodel/:to",
  authMiddlewares.validation,
  authMiddlewares.permission("student"),
  uploadMiddlewares.single("file"),
  ImageController.store
);
routes.get("/image", ImageController.index);
routes.delete(
  "/image/:id",
  authMiddlewares.validation,
  authMiddlewares.permission("student"),
  ImageController.remove
);
routes.put(
  "/image/:id",
  authMiddlewares.validation,
  authMiddlewares.permission("student"),
  ImageController.update
);

// rotas para o controle de participantes
routes.get("/participant", ParticipantController.index);
routes.post(
  "/participant",
  authMiddlewares.validation,
  authMiddlewares.permission("teacher"),
  ParticipantController.store
);
routes.delete(
  "/participant/:id",
  authMiddlewares.validation,
  authMiddlewares.permission("teacher"),
  ParticipantController.remove
);
routes.put(
  "/participant/:id",
  authMiddlewares.validation,
  authMiddlewares.permission("student"),
  ParticipantController.update
);
routes.get("/participant/:id", ParticipantController.select);

// rotas para o controle de projetos
routes.get("/project", ProjectController.index);
routes.get("/project/:id", ProjectController.select);
routes.delete(
  "/project/:id",
  authMiddlewares.validation,
  authMiddlewares.permission("teacher"),
  ProjectController.remove
);
routes.put(
  "/project/:id",
  authMiddlewares.validation,
  authMiddlewares.permission("teacher"),
  ProjectController.update
);
routes.post(
  "/project",
  authMiddlewares.validation,
  authMiddlewares.permission("teacher"),
  ProjectController.store
);

routes.post(
  "/project/:projectid/:office/:participantemail",
  authMiddlewares.validation,
  authMiddlewares.permission("teacher"),
  ProjectSubscriptionController.store
);
routes.delete(
  "/project/:projectid/:participantemail",
  authMiddlewares.validation,
  authMiddlewares.permission("teacher"),
  ProjectSubscriptionController.remove
);

//rotas para o controle de posts
routes.get("/post", PostController.index);
routes.get("/post/:id", PostController.select);
routes.post(
  "/post",
  authMiddlewares.validation,
  authMiddlewares.permission("student"),
  PostController.store
);
routes.put(
  "/post/:id",
  authMiddlewares.validation,
  authMiddlewares.permission("student"),
  PostController.update
);
routes.delete(
  "/post/:id",
  authMiddlewares.validation,
  authMiddlewares.permission("master"),
  PostController.remove
);

// rotas para o controle de downloads
routes.get("/download", DownloadController.index);
routes.get("/download/:id", DownloadController.select);
routes.delete(
  "/download/:id",
  authMiddlewares.validation,
  authMiddlewares.permission("master"),
  DownloadController.remove
);
routes.put(
  "/download/:id",
  authMiddlewares.validation,
  authMiddlewares.permission("master"),
  DownloadController.update
);
routes.post(
  "/download",
  authMiddlewares.validation,
  authMiddlewares.permission("master"),
  DownloadController.store
);

routes.get("/tools", ToolsController.index);
routes.get("/tools/:id", ToolsController.select);
routes.delete(
  "/tools/:id",
  authMiddlewares.validation,
  authMiddlewares.permission("master"),
  ToolsController.remove
);
routes.put(
  "/tools/:id",
  authMiddlewares.validation,
  authMiddlewares.permission("master"),
  ToolsController.update
);
routes.post(
  "/tools",
  authMiddlewares.validation,
  authMiddlewares.permission("master"),
  ToolsController.store
);

routes.post("/auth", AuthController.login);
routes.post("/auth/forgotpassword", AuthController.forgotPassword);
routes.post("/auth/resetpassword", AuthController.resetPassword);

module.exports = routes;
