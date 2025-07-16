import CryptoJS from "crypto-js";

export const encryption = async(data,key)=>{
    var ciphertext = CryptoJS.AES.encrypt(
      "data",
      process.env.ENCRYPTION_KEY
    ).toString();
    return ciphertext
}

export const decryption = (data,key)=>{
  try{
    var text = CryptoJS.AES.decrypt(data, process.env.ENCRYPTION_KEY);
    if(text.sigBytes>0){
      const decryptData = text.toString(CryptoJS.enc.Utf8);
      return decryptData
    }
  }catch(error){
    throw new Error("decryption failed Invalid Key");
  }
}