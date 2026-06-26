const Form = require('../models/formModel');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const matchUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const form = await Form.findOne({ user: userId });
        if (!form) {
            return res.status(404).json({ error: "Form not found for user" });
        }

        const userResponses = form.responses.filter(section => section.section !== "Career Values");

        let allAnswers = [];
        userResponses.forEach(section => {
            const answersArray = Array.from(section.answers.values());
            allAnswers = allAnswers.concat(answersArray);
        });

        const rScriptPath = path.join(__dirname, '..', 'data', 'match.R');
        const jsonInput = JSON.stringify(allAnswers);
        const rscriptBin = process.env.RSCRIPT_PATH || 'Rscript';

        console.log("✅ Sending to R script:", jsonInput);
        console.log("✅ Using Rscript binary:", rscriptBin);
        console.log("✅ Using R script path:", rScriptPath);

        const R = spawn(
            rscriptBin,
            ['--vanilla', rScriptPath, jsonInput],
            { cwd: path.join(__dirname, '..', 'data') }
        );

        let resultData = '';
        let errorData = '';

        R.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        R.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        R.on('close', (code) => {
            if (code !== 0) {
                console.error("❌ R Script stderr:", errorData);
                return res.status(500).json({
                    error: "R script failed to run.",
                    details: errorData
                });
            }

            try {
                const resultJson = JSON.parse(resultData);
                console.log("✅ R Script Result:", resultJson);
                res.status(200).json(resultJson);
            } catch (e) {
                console.error("❌ Failed to parse R script output:", resultData);
                res.status(500).json({
                    error: "Failed to parse R script output.",
                    details: resultData
                });
            }
        });

        R.on('error', (err) => {
            console.error("❌ Failed to start R process:", err);
            res.status(500).json({
                error: "Failed to start R process.",
                details: err.message
            });
        });

    } catch (error) {
        console.error("❌ Backend Error:", error);
        res.status(500).json({ error: "Server error during matching" });
    }
};

const matchUser2 = async (req, res) => {
    try {
        const userId = req.user._id;

        const form = await Form.findOne({ user: userId });
        if (!form) {
            return res.status(404).json({ error: "Form not found for user" });
        }

        const fakeProfessions = [
            "Bioinformatics - Clinical / Research",
            "Bioinformatics - Industry",
            "Business of Science / Medicine",
            "Consulting",
            "Further Education - Clinical",
            "Further Education - Research",
            "Lab / Hospital / Academic Administrative Role",
            "Policy",
            "Sales & Marketing",
            "Science Writing, Communication, Education",
            "Variant Analysis - Diagnostic",
            "Variant Analysis - Research",
            "Wet Lab Work - Academic",
            "Wet Lab Work - Industry"
        ];

        const shuffled = fakeProfessions.sort(() => 0.5 - Math.random());
        const selectedProfessions = shuffled.slice(0, 10);

        console.log("✅ Sending simulated matches:", selectedProfessions);

        res.status(200).json({ matches: selectedProfessions });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error during matching" });
    }
};

module.exports = { matchUser, matchUser2 };