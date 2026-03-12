const express = require('express');
const app = express();

app.get('/test', (req, res) => {
    const file = "C:\\Windows\\System32\\drivers\\etc\\hosts"; // A file that always exists
    console.log("Sending:", file);
    res.sendFile(file, (err) => {
        if (err) {
            console.error("1. Rootless Error:", err.message);
            // Try with root configuration?
            res.sendFile(file, { root: '/' }, (err2) => {
                if (err2) console.error("2. Root Error:", err2.message);
            });
        }
    });
});
app.listen(3006, () => console.log('started on 3006'));
