import express from "express";
import {
  getUsuarios,
  getUsuariosById,
  getUsuariosByEmail,
  postUsuario,
  actualizarUsuario,
  eliminarUsuario,
  patchContrasena,
  renovarToken,
  asignarRol,
  removerRol
} from "./user.controllers.js";

const router = express.Router();

router.get("/", getUsuarios);
router.get("/email/:email", getUsuariosByEmail);
router.get("/:id", getUsuariosById);
router.post("/", postUsuario);
router.put("/", actualizarUsuario);
router.patch("/password", patchContrasena);
router.patch("/token", renovarToken);
router.post("/assign-rol", asignarRol);
router.delete("/remove-rol", removerRol);
router.delete("/:id", eliminarUsuario);

export default router; 