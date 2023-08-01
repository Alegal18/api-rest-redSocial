// Importar dependencias
const connection = require('./database/connection')
const express = require('express')
const cors = require('cors') 

console.log('API NODE arrrancada')
// Conexion a bbdd
connection();

// Crear servidor node
const app = express();
const puerto = 3900;

// configurar cors
app.use(cors())

//Convertir los datos del body a objeto json
app.use(express.json())
app.use(express.urlencoded({extended: true}));

//Cargar configurar rutas
const UserRoutes = require('./routes/user')
const PublicationRoutes = require('./routes/publication')
const FollowRoutes = require('./routes/follow')

app.use('/api/user', UserRoutes);
app.use('/api/publication', PublicationRoutes);
app.use('/api/follow', FollowRoutes)

//Poner servidor a escuchar peticiones http
app.listen(puerto, ()=>{
    console.log('Corriendo servidor: ', puerto)
})