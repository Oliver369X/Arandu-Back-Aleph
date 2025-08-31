import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken"; 
import {obtenerUsuarioPorSuCorreo} from "../../components/user/user.models.js";

export const verifyToken = async (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY_TOKEN)
  } catch (error) {
    return null
  }
}

export const loginUser = async (req, res) => {
    let { email, password } = req.body;
    email = email?.toLowerCase().trim(); 
    console.log(email)
    const result = await obtenerUsuarioPorSuCorreo(email)
   
    if (!!!result) {
      return res.status(201).json({ message: "El usuario no se encontro!" , success:false}); // Not Found
    }
    try {
      const checkPassword = await bcrypt.compare(password, result.password);
 
      if (!checkPassword) {
        return res.status(201).json({ message: "contrasena incorrecta!" ,  success:false}); // Unauthorized
      } 

      // Get user roles for token
      const userRoles = result.userRoles || [];
      const roles = userRoles.map(ur => ur.role.name);
   

      const token = jwt.sign(
        { 
          id: result.id,
          email: result.email, 
          name: result.name,
          isPremium: result.isPremium,
          roles: roles
        },
        process.env.SECRET_KEY_TOKEN, 
        {
          expiresIn: "24h",
        }
      );
      // Formatear los datos del usuario para el frontend
      const userData = {
        id: result.id,
        name: result.name,
        email: result.email,
        image: result.image,
        bio: result.bio,
        roles: roles, // ← ✅ Array de strings: ["teacher"]
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      };

      return res.status(200).json({
             message: "inicio de sesión con éxito!", 
             token ,
             success:true , 
             data: userData // ← ✅ Datos formateados
            });

    } catch (error) {
      return res.status(500).json({ message: error.message ,success:false}); // Internal Server Error
    }
  };
  