const { execSync } = require('child_process');

try {
    // Install express
    execSync('npm install express');

    // Install mqtt
    execSync('npm install mqtt');

    execSync('npm install mongodb');

    execSync('npm install geolib');

    console.log('Modules installed successfully.');
} catch (error) {
    console.error('Error occurred while installing modules:', error.message);
}
