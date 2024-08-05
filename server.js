const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
const cors = require('cors'); // Importar cors

const app = express();
const port = 3000;

// Configuración de cors
app.use(cors());

// Configuración de bodyParser para manejar las solicitudes JSON
app.use(bodyParser.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/Login', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

// Ruta para recibir los datos del formulario
app.post('/submit', async (req, res) => {
    const { user, password, 'g-recaptcha-response': recaptchaResponse } = req.body;

    // Verificar el CAPTCHA
    const secretKey = '6LeD4h4qAAAAALJx-ed5cDI68FBuQqt5OYzE5-RP';  // Reemplaza con tu clave secreta de reCAPTCHA
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;

    try {
        const response = await axios.post(verificationURL);
        const data = response.data;

        if (!data.success) {
            return res.status(400).json({ message: 'Captcha verification failed' });
        }

        // Guardar los datos en la base de datos
        const newUser = new User({ email: user, password: password });
        await newUser.save();

        res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Ruta para servir la página de éxito
app.get('/tabla.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'tabla.html'));  
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
