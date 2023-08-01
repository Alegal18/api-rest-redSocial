// Importar modelo
const Follow = require('../models/follow');
const User = require('../models/user');
const mongoosePaginate = require('mongoose-pagination')




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
    //Recoger id de usuario identificado
    const userId = req.user.id;
    

    //Recoger id del usuario que sigo y quiero dejar de seguir
    const followedId = req.params.id;
    

    //Finde de las coincidencias y hacer un remove

    Follow.find({
        "user": userId,
        "followed": followedId
    }).deleteOne()
    .then((followDeleted) => {
        return res.status(200).json({
            status: "success",        
            message: "Follow eliminado correctamente"
        });
    })
    .catch((error) => {
        return res.status(500).json({
            status: 'error',
            mensaje: 'No se has dejado de seguir al usuario'
        });
    });    
}

//Accion listado de usuarios que cualquier usuario esta siguiendo (siguiendo)
const following = (req, res)=> {
    //Sacar el id del usuario identificado
    let userId = req.user.id;

    //Comprobar si me llega el id por parametro en url
    if(req.params.id) userId = req.params.id;
    

    // Comprobar si me llega la pagina, si no la pagina sera 1
    let page = 1;
    if(req.params.page) page = req.params.page;   

    // Usuarios por pagina que quiero mostrar
    let itemPerPage = 5;

    //Find a follow, popular datos de los usuarios y paginar con mongoose paginate
    Follow.find({ user: userId })
    .countDocuments() // Count total documents matching the query
    .then((total) => {
      Follow.find({ user: userId })
        .populate('user', '-password -role -__v') // Exclude fields from the 'user' object
        .populate('followed', '-password -role -__v') // Exclude fields from the 'followed' object
        .paginate(page, itemPerPage)
        .then((follows) => {
          return res.status(200).json({
            status: 'success',
            message: 'Listado de usuarios que estoy siguiendo',            
            follows,
            total,
            pages: Math.ceil(total/itemPerPage)
          });
        })
        .catch((error) => {
          return res.status(500).json({
            status: 'error',
            mensaje: 'No se pudo obtener lista de usuarios',
          });
        });
    })
    .catch((error) => {
      return res.status(500).json({
        status: 'error',
        mensaje: 'Error al contar los documentos',
      });
    });
}

    // Follow.find({user:userId}).populate("user followed", "-password -role -__v").paginate(page, itemPerPage)
    // .then((follows) => {
    //     return res.status(200).json({
    //         status: "success",        
    //         message: "Listado de usuarios que estoy siguiendo",
    //         follows                                    
    //     });
    // })
    // .catch((error) => {
    //     return res.status(500).json({
    //         status: 'error',
    //         mensaje: 'No se pudo obtener lista de usuarios'
    //     });
    // });    

    

//Accion listado de usuarios que siguen a cualquier otro usuario(soy seguido)
const followers = (req, res)=> {
    return res.status(200).json({
        status: "success",        
        message: "Listado de usuarios que me siguen"
    });
}


// Exportar acciones
module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}