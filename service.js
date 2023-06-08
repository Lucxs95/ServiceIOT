const express = require('express');
const app = express();
const port = 3000;
const { MongoClient } = require('mongodb');
const mqtt = require('mqtt');

app.use(express.json());

// Route pour recevoir les requêtes POST
app.post('/publish', (req, res) => {
    // Récupérer les données envoyées dans la requête
    const data = req.body;

    // Faites ici ce que vous voulez avec les données
    // Par exemple, vous pouvez les afficher dans la console
    console.log('Données reçues :', data);

    // Répondre à la requête avec un statut 200 (OK)
    res.sendStatus(200);
});

app.get('/open', (req, res) => {
    // Récupérer les données envoyées dans la requête
    const ident = req.query.idswp;
    const clientid = req.query.idu;

    // Publier un message MQTT pour contrôler la LED
    const mqttBroker = 'mqtt://mqtt.eclipseprojects.io:1883';
    const mqttTopic = 'uca/iot/led';
    const mqttMessage = JSON.stringify({
        led: { etat: 'on' },
        user: {
            id: clientid,
            idswp: ident
        }
    }); // Message JSON avec l'état de la LED

    const mqttClient = mqtt.connect(mqttBroker);

    mqttClient.on('connect', () => {
        console.log('Connecté au broker MQTT');
        mqttClient.publish(mqttTopic, mqttMessage, err => {
            if (err) {
                console.error('Erreur lors de la publication du message MQTT :', err);
                res.sendStatus(500);
            } else {
                console.log('Message MQTT publié avec succès');
                insertDataIntoMongoDB(mqttMessage); // Insérer les données dans MongoDB
                res.sendStatus(200);
            }
            mqttClient.end(); // Déconnectez-vous du broker MQTT après avoir publié le message
        });
    });
});

async function insertDataIntoMongoDB(data) {
    try {
        const parsedData = JSON.parse(data); // Parse the data string into an object
        const uri = 'mongodb+srv://root:root@cluster0.8bftf0d.mongodb.net/piscines?retryWrites=true&w=majority';
        const client = new MongoClient(uri);
        await client.connect();

        const db = client.db('piscines');
        const collection = db.collection('piscines');

        const result = await collection.insertOne(parsedData); // Insert the parsed data object
        console.log('Données insérées dans MongoDB');
        console.log('ID du document inséré :', result.insertedId);

        client.close();
    } catch (error) {
        console.error('Erreur lors de l\'insertion des données dans MongoDB :', error);
    }
}

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});