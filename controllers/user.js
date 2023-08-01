const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require("../service/jwt")
const mongoosePaginate = require('mongoose-pagination')
const fs = require("fs")
const path = require("path")



// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        menssage: " mensaje desde controllers/users.js",
        usuario: req.user
    });
}

//Registro de usuarios
const register = async (req, res) => {

    // Recoger datos de la peticion
    let params = req.body;

    // Comprobar que me llegaron bien + valiadacion

    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: 'error',
            mensaje: "Faltan datos por enviar",

        });
    }

    // Control usuarios duplicados
    try {

        const existingUser = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() }
            ]
        }).exec()

        if (existingUser && existingUser.length >= 1) {

            return res.status(200).json({
                status: 'success',
                messague: "El usuario ya existe",

            });
        }
    } catch (error) {
        return res.status(500).json({
            status: "Error",
            messague: "Error en la consulta de usuarios"
        })
    }
    // Cifrar contraseña
    let pwd = await bcrypt.hash(params.password, 10);
    params.password = pwd;

    // Crear objeto de usuario
    let user_to_save = new User(params)

    // Guardar usuario en la base de datos 
    user_to_save.save()
        .then((userStored) => {
            return res.status(200).json({
                status: 'success',
                User: userStored,
                mensaje: 'Usuario creado con exito'
            });
        })
        .catch((error) => {
            return res.status(400).json({
                status: 'error',
                mensaje: 'Error al guardar el usuario: ' + error.message
            });
        });

}

const login = (req, res) => {
    //Recoger parametros del body
    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).send({
            status: 'error',
            mensaje: 'Faltan datos por enviar'
        })
    }

    //Buscar en la bbdd si existe
    User.findOne({ email: params.email })
        // .select({password: 0})
        .then((user) => {

            let pwd = bcrypt.compareSync(params.password, user.password)

            if (!pwd) {
                return res.status(400).send({
                    status: 'error',
                    mensaje: 'No te has indentificado correctamente'
                })
            }

            // Conseguir token
            const token = jwt.createToken(user);

            // Devolver datos del usuario
            return res.status(200).send({
                status: "success",
                mensaje: "Te has identificado correctamente",
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick
                },
                token
            })

        })
        .catch((error) => {
            return res.status(400).send({
                status: 'error',
                mensaje: 'No existe el usuario:'
            });
        });

    // 

}

const profile = (req, res) => {
    //Recibir el parametro del id de usuario por url
    const id = req.params.id;

    User.findById(id).select({ password: 0, role: 0 })
        .then((userProfile) => {
            return res.status(200).json({
                status: 'success',
                User: userProfile,
            });
        })
        .catch((error) => {
            return res.status(404).send({
                status: 'error',
                mensaje: 'El usuario no existe o hay un error: '
            });
        });

}

const list = (req, res) => {

    // Controlar en que pagina estamos
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    page = parseInt(page)

    // Consulta con mongoose paginate
    let itemPerPage = 5;
    User.find().sort('_id').paginate(page, itemPerPage)
        .then((users) => {


            if (!users) {
                return res.status(404).send({
                    status: 'error',
                    mensaje: 'No hay usuarios disponibles '
                });
            }
            // Devolver el resultado (posteriormente info de follow)

            return res.status(200).json({
                status: 'success',
                users,
                page,
                itemPerPage,
                pages: false
            });
        })
        .catch((error) => {
            return res.status(500).send({
                status: 'error',
                mensaje: 'Error en la consulta'
            });
        });

}

const update = async(req, res) => {
    // Recoge info del usuario a actualizar
    let userIdentity = req.user;
    let userToUpdate = req.body;
    

    //Eliminar campos sobrantes

    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.imagen;

    //Comprobar si ya existe el usuario
    
    try {        

        const users = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() }
            ]
        }) 
               
        let userIsset = false;
        users.forEach(user => {            
            if(user && user._id != userIdentity.id) userIsset = true;
        });
        
        if (userIsset) {

            return res.status(200).json({
                status: 'success',
                message: "El usuario ya existe",
            });
        }
        // Cifrar contraseña
        if(userToUpdate.password){
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        }
        // Buscar y actualizar
     User.findByIdAndUpdate({_id: userIdentity.id}, userToUpdate, {new: true})
     .then((userToUpdate)=> {              
         return res.status(200).send({
             status: 'success',
             mensaje: 'Metodo de actualizar usuario',        
             user: userToUpdate
         });      

     })
     .catch((error) => {
        return res.status(500).json({
            status: "Error",
            message: "Error al actualizar el usuario"
        })
    })    
    } catch (error) {
        return res.status(500).json({
            status: "Error",
            messague: "Error en la consulta de usuarios"
        })
    }     

}

const upload = (req, res) => {
    // Recoger el fichero de imagen y comprobar si existe
    if(!req.file){
        return res.status(404).send({
            status: 'error',
            mensaje: 'Peticion no incluye imagen',                    
        });      
    }
    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    //Sacar la extencion del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    //Comprobar la extension
    if(extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        //Borrar archivo subido
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);
        //Devolver respuesta negativa
        return res.status(400).send({
            status: "error",
            mesage: "Extension del fichero invalida"
        })
    }

    //Si es correcto guardar imagen en bbdd
    User.findByIdAndUpdate({_id: req.user.id}, {image: req.file.filename}, {new: true})
    .then((userUpdated)=> {        
        return res.status(200).send({
            status: 'success',
            user: userUpdated,
            file: req.file                          
        });
        
    })
    .catch((error)=> {
        return res.status(500).json({
            status: "Error",
            message: "Error al subir el avatar",            
        })
    })   

}

const avatar = (req, res)=>{
    //Sacar el parametro de la url
    const file = req.params.file

    //Montar el path real de la imagen
    const filePath = "./uploads/avatars/"+file;

    //Comprobar si existe
    fs.stat(filePath, (error, exists)=> {
        if(!exists){
            return res.status(400).send({
                status:"error",
                message: "No existe la imagen"
            })
        }
        //Devolver un archivo
        return res.sendFile(path.resolve(filePath))
    })
}

// Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar
}