const express = require('express');
const path = require('path');
const fs = require('fs').promises
const app = express();

const PORT = 80;

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {});