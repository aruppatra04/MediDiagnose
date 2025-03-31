const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
