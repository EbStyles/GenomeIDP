import React from "react";
import questions from "../data/questions.json"; // adjust path if needed

const GenerateIndicesButton = () => {
  const handleGenerate = async () => {
    const careerFiles = [
      "Bioinformatics_-_Clinical_-_Research.json",
      "Bioinformatics_-_Industry.json",
      "Business_of_Science___Medicine.json",
      "Consulting.json",
      "Further_Education_-_Clinical.json",
      "Further_Education_-_Research.json",
      "Lab_-_Hospital_-_Academic_Administrative_Role.json",
      "Policy.json",
      "Sales_&_Marketing.json",
      "Science_Writing,_Communication,_Education.json",
      "Variant_Analysis_-_Diagnostic.json",
      "Variant_Analysis_-_Research.json",
      "Wet_Lab_Work_-_Academic.json",
      "Wet_Lab_Work_-_Industry.json"
    ];

    const normalize = text => text.trim().toLowerCase();

    const allQuestions = [];
    questions.sections.forEach(section => {
      if (section.type === "question" && section.key !== "Career Values") {
        allQuestions.push(...section.content);
      }
    });

    const results = {};

    for (const file of careerFiles) {
      const filepath = `/data/${file}`;
      try {
        const res = await fetch(filepath);
        if (!res.ok) throw new Error();
        const data = await res.json();

        const indices = data.map(entry => {
          const idx = allQuestions.findIndex(
            masterQ => normalize(masterQ) === normalize(entry.question)
          );
          if (idx === -1) {
            console.warn("❌ Question not matched:", entry.question);
          }
          return idx !== -1 ? idx : null;
        }).filter(idx => idx !== null);

        results[file.replace(".json", "")] = indices;
      } catch {
        console.error(`❌ Failed to load ${file}`);
      }
    }

    // Trigger file download
    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "low_variance_indices.json";
    a.click();
  };

  return (
    <button onClick={handleGenerate}>
      📥 Generate Low Variance Indices File
    </button>
  );
};

export default GenerateIndicesButton;
