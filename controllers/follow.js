// Importar modelo
const Follow = require('../models/follow');
const User = require('../models/user')




// Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        menssage: " mensaje desde controllers/users.js"
    });
}

const save = (req, res)=> {
    //Conseguir datos por body
    const params = req.body;

    //Sacar el id del usuario identificado
    const identity = req.user;

    //Crea objeto con modelo de follow
    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    })
    userToFollow.save()
    .then((followStored) => {
        return res.status(200).json({
            status: "success",        
            identity: req.user,
            follow: followStored
        });
    })
    .catch((error) => {
        return res.status(500).json({
            status: 'error',
            mensaje: 'No se ha podido seguir al usuario'
        });
    });    
}

//Accion de borrar un follow (accion dejar de seguir)
const unfollow = (req, res)=> {
    return res.status(200).json({
        status: "success",        
        identity: req.user,        
    });
}


// Exportar acciones
module.exports = {
    pruebaFollow,
    save,
    unfollow
}