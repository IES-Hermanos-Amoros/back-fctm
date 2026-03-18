const bcrypt = require("bcrypt") //npm i bcrypt

exports.hashPassword = async(cadenaTextoPlano) => {
    return await bcrypt.hash(cadenaTextoPlano,12)
}

exports.compareLogin = async(cadenaTextoPlano, cadenaCodificada) => {
    const result = await bcrypt.compare(cadenaTextoPlano,cadenaCodificada)
    if(result){
        return true //Contraseñas coinciden
    } else {
        return false //No coinciden
    }
}

exports.validateStrongPassword = (password) => {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._\-#])[A-Za-z\d@$!%*?&._\-#]{8,}$/;

  return strongPasswordRegex.test(password);
};

