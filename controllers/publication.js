

// Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        menssage: " mensaje desde controllers/users.js"
    });
}

// Exportar acciones
module.exports = {
    pruebaPublication
}