//Importar dependencias
const jwt = require("jwt-simple")
const moment = require("moment")

// Importar claves secretas

const libjwt = require("../service/jwt")
const secret = libjwt.secret

// Middleware de autenticacion

exports.auth = (req, res, next) => {

    //Comprobar si llega la cabecera de auth
    if(!req.headers.authorization){
        return res.status(403).send({
            status: 'error',
            message: "La peticion no tiene la cabecera de autenticacion"
        })
    }
    // Limpiar el token
    let token = req.headers.authorization.replace(/['"]+/g, '');
    
    //Decodificar token

    try {
        let payload = jwt.decode(token, secret)

        //Comprobar la expiracion del token

        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                status: 'error',
                message: "Token expirado",
                
            })
        }
        // Agrega datos del ususario al request
        req.user = payload;
        
    }catch(error) {
        return res.status(404).send({
            status: 'error',
            message: "Token invalido",
            error
        })
    }
    

    //Pasar a ejecucion de accion
    next()
} 