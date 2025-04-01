const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const dotenv = require('dotenv').config();

const app = express();
const port = 5000 || process.env.PORT1 || process.env.PORT2 ;

app.use(cors());
app.use(express.json());

app.post("/predict", (req, res) => {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms)) {
        return res.status(400).json({ error: "Invalid symptoms input" });
    }

    // Spawn Python process
    const pythonProcess = spawn("python", ["recomended.py", JSON.stringify(symptoms)]);

    let resultData = "";
    pythonProcess.stdout.on("data", (data) => {
        resultData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error("Error:", data.toString());
    });

    pythonProcess.on("close", (code) => {
        if (code === 0) {
            try {
                const response = JSON.parse(resultData);
                res.json(response);
            } catch (error) {
                res.status(500).json({ error: "Error parsing model response" });
            }
        } else {
            res.status(500).json({ error: "Python script execution failed" });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
