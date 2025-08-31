import express from "express";
import {
  getRoles,
  getRolPorId,
  getRolPorNombre,
  postRol,
  putRol,
  deleteRol,
  getUsuariosConRol,
  getRolesActivos,
  getRolesPorPermisos
} from "./role.controllers.js";

const router = express.Router();

router.get("/", getRoles);
router.get("/activos", getRolesActivos);
router.get("/permisos", getRolesPorPermisos);
router.get("/nombre/:name", getRolPorNombre);
router.get("/usuarios/:roleId", getUsuariosConRol);
router.get("/:id", getRolPorId);
router.post("/", postRol);
router.put("/", putRol);
router.delete("/:id", deleteRol);

export default router; 