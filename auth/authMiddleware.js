import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

//Secret para guardar no token
const SECRET = process.env.JWT_AUTH;

function authMiddleware(req, res, next) {
  // Aqui faz uma requisição no header da aplicação
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ erro: "Token não fornecido!" });
  }

  //Armazena a string do header e armazena em um array e depois pega somente o token da requisição.
  const token = auth.split(" ")[1];

  try {
    //Decodifica o token e faz a verificação se o token é válido.
    const decoded = jwt.verify(token, SECRET);
    //Seta os dados no user.
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ erro: "Token Inválido" });
  }
}

export default authMiddleware;
