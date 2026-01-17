// Password Hashing Utility
// Uses bcryptjs for secure password hashing and verification

import bcrypt from 'bcryptjs'

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

export const verifyPassword = async (plain: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(plain, hash)
}
