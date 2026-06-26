const mongoose = require('mongoose');

const validSections = [
  'Discipline-specific conceptual knowledge',
  'Discipline-specific practical skills',
  'Communication skills',
  'Professionalism',
  'Ethical and responsible conduct',
  'Discipline Relevant Interests',
  'Professional Communication Interests',
  'Professional Management Interests',
  'Career Values',
  'Skills',
  'Interests',
  'Values'
];

// Nested section schema (as before)
const sectionAnswerSchema = new mongoose.Schema({
  section: { type: String, enum: validSections, required: true },
  answers: {
    type: Map,
    of: {
      type: Number,
      min: 1,
      max: 5
    },
    required: true
  }
}, { _id: false });

const alternateRealitySchema = new mongoose.Schema({
  goal: { type: String, default: "" },
  careerPath: { type: String, default: "" },
  transitionSteps: { type: String, default: "" }
}, { _id: false });

const careerAdvancementSmartRowSchema = new mongoose.Schema({
  goal: { type: String, default: "" },
  smartGoal: { type: String, default: "" },
  recurrence: { type: String, default: "" },
  startDate: { type: String, default: "" },
  endDate: { type: String, default: "" }
}, { _id: false });

const careerAdvancementSmartGoalsSchema = new mongoose.Schema({
  selections: { type: [String], default: [] },
  other: { type: String, default: "" },
  rows: { type: [careerAdvancementSmartRowSchema], default: [] }
}, { _id: false });

const skillBuildingSmartGoalsSchema = new mongoose.Schema({
  selections: { type: [String], default: [] },
  rows: { type: [careerAdvancementSmartRowSchema], default: [] }
}, { _id: false });

const currentProgramSmartGoalsSchema = new mongoose.Schema({
  selections: { type: [String], default: [] },
  other: { type: String, default: "" },
  rows: { type: [careerAdvancementSmartRowSchema], default: [] }
}, { _id: false });

const mentorRowSchema = new mongoose.Schema({
  mentorName: { type: String, default: "" },
  relationshipGoal: { type: String, default: "" }
}, { _id: false });

const findMentorsSchema = new mongoose.Schema({
  rows: { type: [mentorRowSchema], default: [] }
}, { _id: false });

// Full form schema
const formSchema = new mongoose.Schema({
  user: { type: String, required: true },
  responses: [sectionAnswerSchema],
  	alternateRealities: {
    	future1: { type: alternateRealitySchema, default: () => ({}) },
    	future2: { type: alternateRealitySchema, default: () => ({}) }
  	},
  	careerAdvancementSmartGoals: {
    	type: careerAdvancementSmartGoalsSchema,
    	default: () => ({})
  	},
  	skillBuildingSmartGoals: {
    	type: skillBuildingSmartGoalsSchema,
    	default: () => ({})
  	},
  	currentProgramSmartGoals: {
    	type: currentProgramSmartGoalsSchema,
    	default: () => ({})
  	},
  	
  	findMentors: {
    	type: findMentorsSchema,
    	default: () => ({})
  	}

}, { timestamps: true });

const Form = mongoose.model('Form', formSchema);

module.exports = Form;
