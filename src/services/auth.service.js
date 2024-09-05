import * as authRepository from "../repository/auth.repository.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

export async function signUp(nome, senha) {
  const existingUser = await authRepository.findUserByName(nome); 
  if (existingUser) {
    const error = new Error("Nome de usuário já cadastrado!");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(senha, 10);
  await authRepository.createUser(nome, hashedPassword); 
}

export async function signIn(nome, senha) {
  const user = await authRepository.findUserByName(nome); 
  if (!user) {
    const error = new Error("Usuário não cadastrado!");
    error.status = 404;
    throw error;
  }

  const isPasswordCorrect = await bcrypt.compare(senha, user.senha);
  if (!isPasswordCorrect) {
    const error = new Error("Senha incorreta!");
    error.status = 401;
    throw error;
  }

  const token = uuid();
  await authRepository.createSession(token, user.id);

  console.log("Usuário logado com sucesso, ID do usuário:", user.id);
  return { token, userId: user.id, username: user.nome }; 
}

export async function logout(userId, token) {
  await authRepository.logoutUser(userId, token);
}