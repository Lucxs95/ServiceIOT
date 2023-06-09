const express = require('express');
const app = express();
const port = 3000;
const {MongoClient} = require('mongodb');
const mqtt = require('mqtt');

app.use(express.json());


app.post('/login', async (req, res) => {
    try {
        const lat = req.body.lat;
        const lon = req.body.lon;
        const idu = req.body.idu;
        const idswp = req.body.idswp;

        const data = await getDataFromMongoDBByIduAndIdswp("logsClient", idu, idswp);

        if (data.length > 0) {
            console.log(data);

            const existingData = data[0];
            if (existingData.lat !== lat || existingData.lon !== lon) {
                await updateDataIntoMongoDB(idu, idswp, lat, lon, "logsClient");
                console.log('Données mises à jour');
            } else {
                console.log('Les données sont identiques, aucune mise à jour nécessaire');
            }
        } else {
            await insertDataIntoMongoDB(req.body, "logsClient");
            console.log('Nouvelles données insérées');
        }

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});

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
    const mqttTopic = 'uca/waterbnb/21904022/lucasPool';
    const mqttMessage = JSON.stringify({
        led: {etat: 'on'},
        user: {
            id: clientid,
            idswp: ident,
            lat: 43.5704187,
            lon: 6.9917197
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
                insertDataIntoMongoDB(mqttMessage, "piscines"); // Insérer les données dans MongoDB
                res.sendStatus(200);
            }
            mqttClient.end(); // Déconnectez-vous du broker MQTT après avoir publié le message
        });
    });
});

async function insertDataIntoMongoDB(data, collectionGiven) {
    try {
        const uri = 'mongodb+srv://root:root@cluster0.8bftf0d.mongodb.net/piscines?retryWrites=true&w=majority';
        const client = new MongoClient(uri);
        await client.connect();

        const db = client.db('piscines');
        const collection = db.collection(collectionGiven);

        const result = await collection.insertOne(data); // Insert the parsed data object
        console.log('Données insérées dans MongoDB');
        console.log('ID du document inséré :', result.insertedId);

        client.close();
    } catch (error) {
        console.error('Erreur lors de l\'insertion des données dans MongoDB :', error);
    }
}

async function getDataFromMongoDB(collectionGiven) {
    try {
        const uri = 'mongodb+srv://root:root@cluster0.8bftf0d.mongodb.net/piscines?retryWrites=true&w=majority';
        const client = new MongoClient(uri);
        await client.connect();

        const db = client.db('piscines');
        const collection = db.collection(collectionGiven);

        const result = await collection.find().toArray();
        console.log('Données récupérées de MongoDB');

        client.close();
        return result;
    } catch (error) {
        console.error('Erreur lors de la récupération des données de MongoDB :', error);
    }
}

async function getDataFromMongoDBByIdu(collectionGiven, idu) {
    try {
        const uri = 'mongodb+srv://root:root@cluster0.8bftf0d.mongodb.net/piscines?retryWrites=true&w=majority';
        const client = new MongoClient(uri);
        await client.connect();

        const db = client.db('piscines');
        const collection = db.collection(collectionGiven);

        const query = {idu: idu}; // Define the query to filter by name
        const result = await collection.find(query).toArray();
        console.log('Données récupérées de MongoDB');

        client.close();
        return result;
    } catch (error) {
        console.error('Erreur lors de la récupération des données de MongoDB :', error);
    }
}

async function getDataFromMongoDBByIduAndIdswp(collectionGiven, idu, idswp) {
    try {
        const uri = 'mongodb+srv://root:root@cluster0.8bftf0d.mongodb.net/piscines?retryWrites=true&w=majority';
        const client = new MongoClient(uri);
        await client.connect();

        const db = client.db('piscines');
        const collection = db.collection(collectionGiven);

        const query = {idu: idu, idswp: idswp}; // Définir la requête pour filtrer par idu et idswp
        const result = await collection.find(query).toArray();
        console.log('Données récupérées de MongoDB');

        client.close();
        return result;
    } catch (error) {
        console.error('Erreur lors de la récupération des données de MongoDB :', error);
    }
}

async function updateDataIntoMongoDB(idu, idswp, lat, lon, collectionGiven) {
    try {
        const uri = 'mongodb+srv://root:root@cluster0.8bftf0d.mongodb.net/piscines?retryWrites=true&w=majority';
        const client = new MongoClient(uri);
        await client.connect();

        const db = client.db('piscines');
        const collection = db.collection(collectionGiven);

        const query = {idu: idu, idswp: idswp};
        const update = {
            $set: {
                lat: lat,
                lon: lon
            }
        };

        const result = await collection.updateOne(query, update);
        console.log('Données mises à jour dans MongoDB');
        console.log('Nombre de documents mis à jour :', result.modifiedCount);

        client.close();
    } catch (error) {
        console.error('Erreur lors de la mise à jour des données dans MongoDB :', error);
    }
}

app.get('/data/:collection', async (req, res) => {
    try {
        const collectionGiven = req.params.collection; // Get the collection name from the URL parameter
        const data = await getDataFromMongoDB(collectionGiven);
        res.json(data);
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        res.sendStatus(500);
    }
});

app.get('/data/:collection/:name', async (req, res) => {
    try {
        const collectionGiven = req.params.collection; // Get the collection name from the URL parameter
        const name = req.params.name; // Get the name from the URL parameter
        const data = await getDataFromMongoDBByName(collectionGiven, name);
        res.json(data);
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        res.sendStatus(500);
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});