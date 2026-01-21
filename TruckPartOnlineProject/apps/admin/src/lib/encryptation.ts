import CryptoJS from "crypto-js"

export function encryptData(data: unknown, password: string): string {
  const text = JSON.stringify(data)
  return CryptoJS.AES.encrypt(text, password).toString()
}

export function decryptData(ciphertext: string, password: string): unknown {
  const bytes = CryptoJS.AES.decrypt(ciphertext, password)
  const decrypted = bytes.toString(CryptoJS.enc.Utf8)
  return JSON.parse(decrypted)
}
