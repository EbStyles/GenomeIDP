// This script flattens the questions.json file to extract all indexable questions
// Then for each profession JSON file (assumed loaded as an array of objects `professions`),
// it finds the indices of low-variance questions from that full question set and stores them.

import fs from 'fs';

// Load the full question set (questions.json)
const questionsData = JSON.parse(fs.readFileSync('./frontend/public/data/questions.json'));

// Flatten question array, skipping "Career Values"
const flattenedQuestions = [];
questionsData.sections.forEach(section => {
  if (section.type === 'question' && section.key !== 'Career Values') {
    section.content.forEach(q => flattenedQuestions.push(q));
  }
});

// Map to quickly find index by text
const questionIndexMap = new Map();
flattenedQuestions.forEach((q, idx) => {
  questionIndexMap.set(q.trim(), idx + 1); // +1 to make it 1-indexed
});

// Prepare result object
const professionIndices = {};

// Path to JSON career files
const careerFiles = fs.readdirSync('./public/data/careers');

careerFiles.forEach(file => {
  if (file.endsWith('.json')) {
    const professionName = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(`./public/data/careers/${file}`));

    const indices = data.map(entry => {
      const i = questionIndexMap.get(entry.question.trim());
      return i !== undefined ? i : null;
    }).filter(i => i !== null);

    professionIndices[professionName] = indices;
  }
});

// Write to new JSON file
fs.writeFileSync('./public/data/low_variance_indices.json', JSON.stringify(professionIndices, null, 2));

console.log('✅ low_variance_indices.json created!');
