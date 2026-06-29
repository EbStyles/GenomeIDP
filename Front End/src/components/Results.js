import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import RSidenav from "./Resultssidenav";
import image from "../GenomeIDP_Logo.png";
import VALUE_PROMPTS from "../data/valuePrompts.json";
import questionsData from "../data/questions.json";
import PrepareReport from "./PrepareReport";
import ViewReport from "./ViewReport";
import ViewCertificate from "./ViewCertificate";
import MyNotes from "./MyNotes";

// ─────────────────────────────────────────────────────────────────────────────
// Results
// Displays the career match results and values summary after survey submission.
//
// FIX (Phase 1, Bug #4): Values tab now shows real data instead of placeholders.
//   Previous behaviour: topValues was hardcoded to four example strings and the
//   tab always showed the same dummy content regardless of the user's answers.
//
//   New behaviour:
//   1. The component fetches the user's saved form via GET /api/form/.
//   2. It finds the "Career Values" section in responses.
//   3. It iterates over the answers Map, comparing question indices to the
//      ordered values question list to resolve each answer to a human-readable
//      value name.
//   4. Any value rated 5/5 ("Absolutely essential") is added to `topValues`.
//   5. The Values tab then renders those values and their matching prompts from
//      VALUE_PROMPTS (valuePrompts.json), one row per value.
//   6. If no values scored 5/5 (unusual but possible), a friendly fallback
//      message is shown rather than an empty table.
//
// The questions in the Career Values section are listed in the same order as
// they appear in questions.json so that answer index → value name mapping is
// deterministic.
// ─────────────────────────────────────────────────────────────────────────────

// Ordered list of Career Values question labels matching questions.json order.
// Index in this array corresponds to the numeric answer key stored in MongoDB
// (0-based, matching how Form.js indexes them).
const CAREER_VALUES_QUESTIONS = [
    "Help Society",
    "Help Others",
    "People Contact",
    "Teamwork",
    "Friendships",
    "Congenial atmosphere",
    "Competition",
    "Make decisions",
    "Fast pace",
    "Supervision",
    "Influence people",
    "Work alone",
    "Independence",
    "Intellectual Challenge",
    "Work on the frontiers of knowledge",
    "Expert status",
    "Creativity",
    "Aesthetics",
    "Predictability",
    "Variety",
    "Job security",
    "Benefits available",
    "Recognition",
    "Risk taking",
    "Earning potential",
    "Location",
    "Physically challenging",
    "Not physically challenging",
    "Flexible schedule",
    "Status and prestige",
    "Professional development",
    "Job tranquility",
    "Work-Life Balance",
    "Family friendly",
    "Exercise competence",
    "Learn new things",
    "High demand",
];

const API_BASE = process.env.REACT_APP_API_URL || "";

const Results = () => {
    const location = useLocation();
    const history = useHistory();
    const user = useAuthContext();
    const [matches, setMatches] = useState([]);
    const [page, setPage] = useState(1);
    const [activeView, setActiveView] = useState("intro");

    // topValues: array of { name, prompt } for values rated 5/5
    const [topValues, setTopValues] = useState([]);

   // responses: full raw form responses (kept for future use by sub-pages)
	const [responses, setResponses] = useState(null);

	const getResponseSection = (sectionName) =>
    	responses?.find((s) => s.section === sectionName) || null;

	const getResponseAnswers = (sectionName) =>
    	getResponseSection(sectionName)?.answers || {};

	const getQuestionSection = (sectionName) =>
    	questionsData.sections.find((s) => s.key === sectionName) || null;

	const getQuestionContent = (sectionName) =>
    	getQuestionSection(sectionName)?.content || [];

	const mapAnswersWithQuestions = (sectionName) => {
    	const answers = getResponseAnswers(sectionName);
    	const questionsForSection = getQuestionContent(sectionName);

    	return Object.entries(answers).map(([index, score]) => ({
        	section: sectionName,
        	index: Number(index),
        	question: questionsForSection[Number(index)] || `Question ${index}`,
        	score: Number(score),
    	}));
	};

	const allSkillsAssessmentItems = [
   	 ...mapAnswersWithQuestions("Discipline-specific conceptual knowledge"),
    	...mapAnswersWithQuestions("Discipline-specific practical skills"),
    	...mapAnswersWithQuestions("Communication skills"),
    	...mapAnswersWithQuestions("Professionalism"),
    	...mapAnswersWithQuestions("Ethical and responsible conduct"),
	];

	const allInterestsAssessmentItems = [
    	...mapAnswersWithQuestions("Discipline Relevant Interests"),
    	...mapAnswersWithQuestions("Professional Communication Interests"),
    	...mapAnswersWithQuestions("Professional Management Interests"),
	];
	
		const topSkills = allSkillsAssessmentItems.filter((item) => item.score === 5);
		const weakestSkillsAreas = allSkillsAssessmentItems.filter((item) => item.score === 1);

		const topInterests = allInterestsAssessmentItems.filter((item) => item.score === 5);
		const activitiesToAvoid = allInterestsAssessmentItems.filter((item) => item.score === 1);

		const allValuesAssessmentItems = mapAnswersWithQuestions("Career Values");

	// My Notes inputs
	
	const [notes, setNotes] = useState("");
	
	// Alternate Realities inputs
	const [altGoal1, setAltGoal1] = useState("");
	const [altGoal2, setAltGoal2] = useState("");
	const [altCareer1, setAltCareer1] = useState("");
	const [altCareer2, setAltCareer2] = useState("");
	const [altSteps1, setAltSteps1] = useState("");
	const [altSteps2, setAltSteps2] = useState("");
	const [isAutosavingAlt, setIsAutosavingAlt] = useState(false);
	const [hasLoadedAlt, setHasLoadedAlt] = useState(false);
	
	// SMART Goals inputs
	const [careerAdvancementSelections, setCareerAdvancementSelections] = useState([]);
	const [careerAdvancementOther, setCareerAdvancementOther] = useState("");
	const [careerAdvancementError, setCareerAdvancementError] = useState("");
	const [careerAdvancementSmartRows, setCareerAdvancementSmartRows] = useState([]);
	const [isAutosavingCareerAdvancement, setIsAutosavingCareerAdvancement] = useState(false);
	const [hasLoadedCareerAdvancement, setHasLoadedCareerAdvancement] = useState(false);
	
	const [skillBuildingSelections, setSkillBuildingSelections] = useState([]);
	const [skillBuildingError, setSkillBuildingError] = useState("");
	const [skillBuildingSmartRows, setSkillBuildingSmartRows] = useState([]);
	const [isAutosavingSkillBuilding, setIsAutosavingSkillBuilding] = useState(false);
	const [hasLoadedSkillBuilding, setHasLoadedSkillBuilding] = useState(false);

	const [currentProgramSelections, setCurrentProgramSelections] = useState([]);
	const [currentProgramOther, setCurrentProgramOther] = useState("");
	const [currentProgramError, setCurrentProgramError] = useState("");
	const [currentProgramSmartRows, setCurrentProgramSmartRows] = useState([]);
	const [isAutosavingCurrentProgram, setIsAutosavingCurrentProgram] = useState(false);
	const [hasLoadedCurrentProgram, setHasLoadedCurrentProgram] = useState(false);
	
	const skillBuildingGroups = questionsData.sections
    	.slice(
        	questionsData.sections.findIndex(
            	(section) => section.key === "Discipline-specific conceptual knowledge"
        	),
        	questionsData.sections.findIndex(
            	(section) => section.key === "Interests"
        	)
    	)
    	.filter((section) => section.type === "question");
	
	const skillResponsesBySection = responses
    ? Object.fromEntries(
          responses.map((item) => [item.section, item.answers || {}])
      )
    : {};
	
	useEffect(() => {
    	if (!careerAdvancementError) return;

    	const timer = setTimeout(() => {
        	setCareerAdvancementError("");
    	}, 3000);

    	return () => clearTimeout(timer);
	}, [careerAdvancementError]);

	useEffect(() => {
    	if (!skillBuildingError) return;

    	const timer = setTimeout(() => {
        	setSkillBuildingError("");
    	}, 3000);

    	return () => clearTimeout(timer);
	}, [skillBuildingError]);

		useEffect(() => {
    	if (!currentProgramError) return;

    	const timer = setTimeout(() => {
        	setCurrentProgramError("");
    	}, 3000);

    	return () => clearTimeout(timer);
	}, [currentProgramError]);
	
	useEffect(() => {
    	if (!hasLoadedCareerAdvancement) return;

    	setCareerAdvancementSmartRows((prevRows) => {
        	return careerAdvancementSelections.map((goal) => {
            	const resolvedGoal =
                	goal === "Other" && careerAdvancementOther.trim()
                    	? careerAdvancementOther.trim()
                    	: goal;

            	const existingRow = prevRows.find((row) => row.goal === resolvedGoal);

            	return (
                	existingRow || {
                    	goal: resolvedGoal,
                    	smartGoal: "",
                    	recurrence: "",
                    	startDate: "",
                    	endDate: ""
                	}
            	);
        	});
    	});
	}, [careerAdvancementSelections, careerAdvancementOther, hasLoadedCareerAdvancement]);

	useEffect(() => {
    	if (!hasLoadedSkillBuilding) return;

    	setSkillBuildingSmartRows((prevRows) => {
        	return skillBuildingSelections.map((skill) => {
            	const existingRow = prevRows.find((row) => row.goal === skill);

            	return (
                	existingRow || {
                    	goal: skill,
                    	smartGoal: "",
                    	recurrence: "",
                    	startDate: "",
                    	endDate: ""
                	}
            	);
        	});
    	});
	}, [skillBuildingSelections, hasLoadedSkillBuilding]);
	
		useEffect(() => {
    	if (!hasLoadedCurrentProgram) return;

    	setCurrentProgramSmartRows((prevRows) => {
        	return currentProgramSelections.map((goal) => {
            	const resolvedGoal =
                	goal === "Other" && currentProgramOther.trim()
                    	? currentProgramOther.trim()
                    	: goal;

            	const existingRow = prevRows.find((row) => row.goal === resolvedGoal);

            	return (
                	existingRow || {
                    	goal: resolvedGoal,
                    	smartGoal: "",
                    	recurrence: "",
                    	startDate: "",
                    	endDate: ""
                	}
            	);
        	});
    	});
	}, [currentProgramSelections, currentProgramOther, hasLoadedCurrentProgram]);
	
	
	const handleCareerAdvancementToggle = (option) => {
    	setCareerAdvancementSelections((prev) => {
        	const isSelected = prev.includes(option);

        	if (isSelected) {
            	if (option === "Other") {
                	setCareerAdvancementOther("");
            	}
            	setCareerAdvancementError("");
            	return prev.filter((item) => item !== option);
        	}

        	if (prev.length >= 5) {
            	setCareerAdvancementError("Oops - that's too many!");
            	return prev;
        	}

        	setCareerAdvancementError("");
        	return [...prev, option];
    	});
	};
	
	const handleSkillBuildingToggle = (skill) => {
    	setSkillBuildingSelections((prev) => {
        	const isSelected = prev.includes(skill);

        	if (isSelected) {
            	setSkillBuildingError("");
            	return prev.filter((item) => item !== skill);
        	}

        	if (prev.length >= 5) {
           	 setSkillBuildingError("Oops - that's too many!");
            	return prev;
        	}

        	setSkillBuildingError("");
        	return [...prev, skill];
    	});
	};

	const handleCurrentProgramToggle = (option) => {
    	setCurrentProgramSelections((prev) => {
        	const isSelected = prev.includes(option);

        	if (isSelected) {
            	if (option === "Other") {
                	setCurrentProgramOther("");
            	}
            	setCurrentProgramError("");
            	return prev.filter((item) => item !== option);
        	}

        	if (prev.length >= 5) {
            	setCurrentProgramError("Oops - that's too many!");
            	return prev;
        	}

        	setCurrentProgramError("");
        	return [...prev, option];
    	});
	};

	const handleCareerAdvancementSmartRowChange = (index, field, value) => {
    	setCareerAdvancementSmartRows((prevRows) =>
       	 prevRows.map((row, i) =>
            	i === index
                	? { ...row, [field]: value }
                	: row
        	)
    	);
	};
	
	const handleSkillBuildingSmartRowChange = (index, field, value) => {
    	setSkillBuildingSmartRows((prevRows) =>
        	prevRows.map((row, i) =>
            	i === index
                	? { ...row, [field]: value }
                	: row
        	)
    	);
	};
	
	const handleCurrentProgramSmartRowChange = (index, field, value) => {
    	setCurrentProgramSmartRows((prevRows) =>
        	prevRows.map((row, i) =>
            	i === index
                	? { ...row, [field]: value }
                	: row
        	)
    	);
	};

	
	    // Mentor inputs
    const [mentorRows, setMentorRows] = useState([
        { mentorName: "", relationshipGoal: "" }
    ]);
    const [hasLoadedMentors, setHasLoadedMentors] = useState(false);
    const [isAutosavingMentors, setIsAutosavingMentors] = useState(false);

    const handleMentorRowChange = (index, field, value) => {
        setMentorRows((prev) =>
            prev.map((row, i) =>
                i === index ? { ...row, [field]: value } : row
            )
        );
    };

    const addMentorRow = () => {
        setMentorRows((prev) => [
            ...prev,
            { mentorName: "", relationshipGoal: "" }
        ]);
    };

    const removeMentorRow = (index) => {
        setMentorRows((prev) => prev.filter((_, i) => i !== index));
    };
    
    // Report inputs
    	const [reportSections, setReportSections] = useState({
        name: false,

        selfAssessments: false,
        topValues: false,
        topInterests: false,
        topSkills: false,
        weakestSkills: false,
        activitiesToAvoid: false,
        completeSkillsSummary: false,
        completeInterestsSummary: false,
        completeValuesSummary: false,

        careerMatches: false,
        
        notes: false,

        alternateRealities: false,
        alternateRealitiesPath1: false,
        alternateRealitiesPath2: false,

        smartGoals: false,
        smartGoalsCareerAdvancement: false,
        smartGoalsSkillBuilding: false,
        smartGoalsCurrentProgram: false,

        mentoringTeam: false,
    });
    
    const [reportName, setReportName] = useState("");

    const [showReportPreview, setShowReportPreview] = useState(false);
    
    const handleReportSectionToggle = (key) => {
    setReportSections((prev) => {
        const updated = {
            ...prev,
            [key]: !prev[key],
        };

        if (key === "name" && prev.name) {
            setReportName("");
        }

        return updated;
    });
};

    const handleReportGroupToggle = (groupKey, childKeys) => {
        setReportSections((prev) => {
            const shouldSelectAll = childKeys.some((key) => !prev[key]);

            const updated = {
                ...prev,
                [groupKey]: shouldSelectAll,
            };

            childKeys.forEach((key) => {
                updated[key] = shouldSelectAll;
            });

            return updated;
        });
    };

    useEffect(() => {
        const selfAssessmentsChildren = [
            "topValues",
            "topInterests",
            "topSkills",
            "weakestSkills",
            "activitiesToAvoid",
            "completeSkillsSummary",
            "completeInterestsSummary",
            "completeValuesSummary",
        ];

        const allChecked = selfAssessmentsChildren.every((key) => reportSections[key]);

        if (reportSections.selfAssessments !== allChecked) {
            setReportSections((prev) => ({
                ...prev,
                selfAssessments: allChecked,
            }));
        }
    }, [
        reportSections.topValues,
        reportSections.topInterests,
        reportSections.topSkills,
        reportSections.weakestSkills,
        reportSections.activitiesToAvoid,
        reportSections.completeSkillsSummary,
        reportSections.completeInterestsSummary,
        reportSections.completeValuesSummary,
        reportSections.selfAssessments,
    ]);

    useEffect(() => {
        const alternateRealitiesChildren = [
            "alternateRealitiesPath1",
            "alternateRealitiesPath2",
        ];

        const allChecked = alternateRealitiesChildren.every((key) => reportSections[key]);

        if (reportSections.alternateRealities !== allChecked) {
            setReportSections((prev) => ({
                ...prev,
                alternateRealities: allChecked,
            }));
        }
    }, [
        reportSections.alternateRealitiesPath1,
        reportSections.alternateRealitiesPath2,
        reportSections.alternateRealities,
    ]);

    useEffect(() => {
        const smartGoalsChildren = [
            "smartGoalsCareerAdvancement",
            "smartGoalsSkillBuilding",
            "smartGoalsCurrentProgram",
        ];

        const allChecked = smartGoalsChildren.every((key) => reportSections[key]);

        if (reportSections.smartGoals !== allChecked) {
            setReportSections((prev) => ({
                ...prev,
                smartGoals: allChecked,
            }));
        }
    }, [
        reportSections.smartGoalsCareerAdvancement,
        reportSections.smartGoalsSkillBuilding,
        reportSections.smartGoalsCurrentProgram,
        reportSections.smartGoals,
    ]);
    
        const selectedReportData = {
        name:
            reportSections.name && reportName.trim()
                ? reportName.trim()
                : null,

        selfAssessments:
    		reportSections.topValues ||
    		reportSections.topInterests ||
    		reportSections.topSkills ||
    		reportSections.weakestSkills ||
    		reportSections.activitiesToAvoid ||
    		reportSections.completeSkillsSummary ||
    		reportSections.completeInterestsSummary ||
    		reportSections.completeValuesSummary
       		 ? {
              	topValues: reportSections.topValues ? topValues : null,
             	topInterests: reportSections.topInterests ? topInterests : null,
              	topSkills: reportSections.topSkills ? topSkills : null,
              	weakestSkills: reportSections.weakestSkills
                  	? weakestSkillsAreas
                  	: null,
              	activitiesToAvoid: reportSections.activitiesToAvoid
                  	? activitiesToAvoid
                  	: null,
              	completeSkillsSummary: reportSections.completeSkillsSummary
                  	? allSkillsAssessmentItems
                  	: null,
              	completeInterestsSummary: reportSections.completeInterestsSummary
                  	? allInterestsAssessmentItems
                  	: null,
              	completeValuesSummary: reportSections.completeValuesSummary
    				? allValuesAssessmentItems
    				: null,
          	}
        	: null,

        careerMatches: reportSections.careerMatches ? matches : null,
        
        notes: reportSections.notes && notes?.trim() ? notes.trim() : null,

                alternateRealities:
            reportSections.alternateRealitiesPath1 ||
            reportSections.alternateRealitiesPath2
                ? {
                      path1: reportSections.alternateRealitiesPath1
                          ? {
                                goal: altGoal1,
                                careerPath: altCareer1,
                                transitionSteps: altSteps1,
                            }
                          : null,
                      path2: reportSections.alternateRealitiesPath2
                          ? {
                                goal: altGoal2,
                                careerPath: altCareer2,
                                transitionSteps: altSteps2,
                            }
                          : null,
                  }
                : null,

        smartGoals:
            reportSections.smartGoalsCareerAdvancement ||
            reportSections.smartGoalsSkillBuilding ||
            reportSections.smartGoalsCurrentProgram
                ? {
                      careerAdvancement: reportSections.smartGoalsCareerAdvancement
                          ? {
                                selections: careerAdvancementSelections,
                                other: careerAdvancementOther,
                                rows: careerAdvancementSmartRows,
                            }
                          : null,
                      skillBuilding: reportSections.smartGoalsSkillBuilding
                          ? {
                                selections: skillBuildingSelections,
                                rows: skillBuildingSmartRows,
                            }
                          : null,
                      currentProgram: reportSections.smartGoalsCurrentProgram
                          ? {
                                selections: currentProgramSelections,
                                other: currentProgramOther,
                                rows: currentProgramSmartRows,
                            }
                          : null,
                  }
                : null,

        mentoringTeam: reportSections.mentoringTeam ? mentorRows : null,
    };

	const completedAreas = [];

		if (responses && responses.length > 0) {
  		completedAreas.push("Self Assessment");
		}

		if (notes?.trim()) {
  		completedAreas.push("Connect");
		}

		if (
  		altGoal1?.trim() ||
  		altCareer1?.trim() ||
  		altSteps1?.trim() ||
  		altGoal2?.trim() ||
  		altCareer2?.trim() ||
  		altSteps2?.trim()
		) {
  		completedAreas.push("Alternate Realities");
		}

		if (
  		careerAdvancementSmartRows.length > 0 ||
  		skillBuildingSmartRows.length > 0 ||
  		currentProgramSmartRows.length > 0
		) {
  		completedAreas.push("SMART Goals");
		}

		if (
  		mentorRows.some(
    		(row) => row.mentorName?.trim() || row.relationshipGoal?.trim()
  		)
		) {
  		completedAreas.push("Mentors");
		}

    // Parse results + active view from URL query string
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const matchesParam = queryParams.get("matches");
        const viewParam = queryParams.get("view");

        if (viewParam) {
            setActiveView(viewParam);
            setPage(2);
        }

        if (matchesParam) {
            const decoded = JSON.parse(decodeURIComponent(matchesParam));
            setMatches(decoded);
            sessionStorage.setItem("genomeIdpMatches", JSON.stringify(decoded));
            setPage(2);
        } else {
            const saved = sessionStorage.getItem("genomeIdpMatches");
            if (saved) {
                setMatches(JSON.parse(saved));
                setPage(2);
            }
        }
    }, [location.search]);

    // ─────────────────────────────────────────────────────────────────────────
    // Fetch the user's saved form and derive top values (score = 5).
    //
    // Steps:
    //  1. GET /api/form/ with JWT bearer token.
    //  2. Find the section with key "Career Values".
    //  3. For each answer index i, look up CAREER_VALUES_QUESTIONS[i] to get
    //     the value's display name.
    //  4. If the numeric score is 5, push { name, prompt } to topValues.
    //  5. Also store the full responses array for use elsewhere.
    // ─────────────────────────────────────────────────────────────────────────
    
    useEffect(() => {
        const fetchResponses = async () => {
            if (!user?.user?.token) return;

            try {
                const response = await fetch(`${API_BASE}/api/form/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${user.user.token}`
                    }
                });

                if (!response.ok) throw new Error("Failed to fetch form data");

                const form = await response.json();
                
                setResponses(form.responses);
                
                const savedAlt = form.alternateRealities || {};

                setAltGoal1(savedAlt.future1?.goal || "");
                setAltCareer1(savedAlt.future1?.careerPath || "");
                setAltSteps1(savedAlt.future1?.transitionSteps || "");

                setAltGoal2(savedAlt.future2?.goal || "");
                setAltCareer2(savedAlt.future2?.careerPath || "");
                setAltSteps2(savedAlt.future2?.transitionSteps || "");
                
                setHasLoadedAlt(true);

				const savedCareerAdvancement = form.careerAdvancementSmartGoals || {};

				setCareerAdvancementSelections(savedCareerAdvancement.selections || []);
				setCareerAdvancementOther(savedCareerAdvancement.other || "");
				setCareerAdvancementSmartRows(savedCareerAdvancement.rows || []);
				setHasLoadedCareerAdvancement(true);

                const savedSkillBuilding = form.skillBuildingSmartGoals || {};

				setSkillBuildingSelections(savedSkillBuilding.selections || []);
				setSkillBuildingSmartRows(savedSkillBuilding.rows || []);
				setHasLoadedSkillBuilding(true);
				
				const savedCurrentProgram = form.currentProgramSmartGoals || {};

				setCurrentProgramSelections(savedCurrentProgram.selections || []);
				setCurrentProgramOther(savedCurrentProgram.other || "");
				setCurrentProgramSmartRows(savedCurrentProgram.rows || []);
				setHasLoadedCurrentProgram(true);
                
                const savedMentors = form.findMentors || {};

                setMentorRows(
                    savedMentors.rows?.length
                        ? savedMentors.rows
                        : [{ mentorName: "", relationshipGoal: "" }]
                		);
                setHasLoadedMentors(true);
                
                
                const valuesSection = form.responses?.find(
                    (s) => s.section === "Career Values"
                );

                if (valuesSection?.answers) {
                    const derived = [];
                    const answersObj = valuesSection.answers;

                    for (const [indexStr, score] of Object.entries(answersObj)) {
                        const idx = Number(indexStr);
                        const numericScore = Number(score);
                        const valueName = CAREER_VALUES_QUESTIONS[idx];

                        if (numericScore === 5 && valueName) {
                            derived.push({
                                name: valueName,
                                prompt: VALUE_PROMPTS[valueName] || "No prompt available for this value."
                            });
                        }
                    }

                    setTopValues(derived);
                }
            } catch (err) {
                console.error("❌ Failed to fetch user responses:", err);
            }
        };

        fetchResponses();
    }, [user?.user?.token]);
    
    useEffect(() => {
        if (!user?.user?.token || !hasLoadedAlt) return;

        const timeoutId = setTimeout(async () => {
            setIsAutosavingAlt(true);

    try {
        const response = await fetch(`${API_BASE}/api/form/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.user.token}`
            },
            body: JSON.stringify({
                alternateRealities: {
                    future1: {
                        goal: altGoal1,
                        careerPath: altCareer1,
                        transitionSteps: altSteps1
                    },
                    future2: {
                        goal: altGoal2,
                        careerPath: altCareer2,
                        transitionSteps: altSteps2
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error("Failed to save alternate realities");
        }

    } catch (err) {
        console.error("❌ Failed to save alternate realities:", err);
    } finally {
        setIsAutosavingAlt(false);
    }
},  800);
	
	return () => clearTimeout(timeoutId);
    }, [
        altGoal1,
        altCareer1,
        altSteps1,
        altGoal2,
        altCareer2,
        altSteps2,
        hasLoadedAlt,
        user?.user?.token,
    ]);

	useEffect(() => {
    	if (!user?.user?.token || !hasLoadedCareerAdvancement) return;

    	const timeoutId = setTimeout(async () => {
        	setIsAutosavingCareerAdvancement(true);

        	try {
            	const response = await fetch(`${API_BASE}/api/form/`, {
                	method: "PATCH",
                	headers: {
                    	"Content-Type": "application/json",
                   		"Authorization": `Bearer ${user.user.token}`
                },
                	body: JSON.stringify({
                    	careerAdvancementSmartGoals: {
                        	selections: careerAdvancementSelections,
                        	other: careerAdvancementOther,
                        	rows: careerAdvancementSmartRows
                    	}
                	})
            	});

            	if (!response.ok) {
                	throw new Error("Failed to save career advancement SMART goals");
            	}

        	} catch (err) {
            	console.error("❌ Failed to save career advancement SMART goals:", err);
        	} finally {
            	setIsAutosavingCareerAdvancement(false);
        	}
    	}, 800);

    	return () => clearTimeout(timeoutId);
	}, [
    	careerAdvancementSelections,
    	careerAdvancementOther,
    	careerAdvancementSmartRows,
    	hasLoadedCareerAdvancement,
    	user?.user?.token,
	]);
	
	useEffect(() => {
    	if (!user?.user?.token || !hasLoadedSkillBuilding) return;

    	const timeoutId = setTimeout(async () => {
        	setIsAutosavingSkillBuilding(true);

        	try {
           		const response = await fetch(`${API_BASE}/api/form/`, {
                	method: "PATCH",
                	headers: {
                    	"Content-Type": "application/json",
                    	"Authorization": `Bearer ${user.user.token}`
                	},
                	body: JSON.stringify({
                    	skillBuildingSmartGoals: {
                        	selections: skillBuildingSelections,
                        	rows: skillBuildingSmartRows
                    	}
                	})
            	});

            	if (!response.ok) {
                	throw new Error("Failed to save skill building SMART goals");
            	}

        	} catch (err) {
            	console.error("❌ Failed to save skill building SMART goals:", err);
        	} finally {
            	setIsAutosavingSkillBuilding(false);
        	}
    	}, 800);

    	return () => clearTimeout(timeoutId);
	}, [
    	skillBuildingSelections,
    	skillBuildingSmartRows,
    	hasLoadedSkillBuilding,
    	user?.user?.token,
	]);
	
		useEffect(() => {
    	if (!user?.user?.token || !hasLoadedCurrentProgram) return;

    	const timeoutId = setTimeout(async () => {
        	setIsAutosavingCurrentProgram(true);

        	try {
            	const response = await fetch(`${API_BASE}/api/form/`, {
                	method: "PATCH",
                	headers: {
                    	"Content-Type": "application/json",
                    	"Authorization": `Bearer ${user.user.token}`
                	},
                	body: JSON.stringify({
                    	currentProgramSmartGoals: {
                        	selections: currentProgramSelections,
                        	other: currentProgramOther,
                        	rows: currentProgramSmartRows
                    	}
                	})
            	});

            	if (!response.ok) {
                	throw new Error("Failed to save current program SMART goals");
            	}

        	} catch (err) {
            	console.error("❌ Failed to save current program SMART goals:", err);
        	} finally {
            	setIsAutosavingCurrentProgram(false);
        	}
    	}, 800);

    	return () => clearTimeout(timeoutId);
	}, [
    	currentProgramSelections,
    	currentProgramOther,
    	currentProgramSmartRows,
    	hasLoadedCurrentProgram,
    	user?.user?.token,
	]);
	
		useEffect(() => {
    	if (!user?.user?.token || !hasLoadedMentors) return;

    	const timeoutId = setTimeout(async () => {
        	setIsAutosavingMentors(true);

        	try {
            	const response = await fetch(`${API_BASE}/api/form/`, {
                	method: "PATCH",
                	headers: {
                    	"Content-Type": "application/json",
                    	"Authorization": `Bearer ${user.user.token}`
                	},
                	body: JSON.stringify({
                    	findMentors: {
                        	rows: mentorRows
                    	}
                	})
            	});

            	if (!response.ok) {
                	throw new Error("Failed to save mentors");
            	}

        	} catch (err) {
            	console.error("❌ Failed to save mentors:", err);
        	} finally {
            	setIsAutosavingMentors(false);
        	}
    	}, 800);

    	return () => clearTimeout(timeoutId);
	}, [
    	mentorRows,
    	hasLoadedMentors,
    	user?.user?.token,
	]);

    if (!user || !user.user) return <div>Loading...</div>;

    return (
        <div className="ResultsPage">
            <div className="ResultsNav">
                <img src={image} alt="GenomeIDP Logo" />

                <span className="ResultsWelcome">
                    Welcome {user.user.username} to your GenomeIDP!
                </span>

                <div className="results-nav-right">
                    <button
                        type="button"
                        className="save-exit-link"
                        onClick={() => history.push("/")}
                    >
                        Save and Exit
                    </button>
                </div>
            </div>

            <div className="ResultsMain">

                    <div style={{ display: "flex", width: "100%", alignItems: "stretch" }}>
                        <div className="ResultsSidenav">
                            <RSidenav activeView={activeView} onViewChange={setActiveView} />
                        </div>

                        <div className="ResultsCard">
                            {activeView === "intro" && (
                                <>
                                    <h2>Understanding Your Results – What Fits?</h2>

                                    <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
                                        Now that you've completed your self-assessment, it's time to explore careers that might align with your strengths and interests. Whether consciously or unconsciously, you likely navigated to your current role as a master's level graduate student by weighing your skills – maybe you did well in your undergraduate science classes and followed that thread to graduate school. Perhaps this early work included your interests too – did you enjoy volunteering in a genetics lab? Did you do an undergraduate thesis that you loved, or did reading about genomic medicine make you want to learn more?
                                    </p>

                                    <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
                                        Now that you're in graduate school, is it what you imagined it would be? In other words, was your initial impression of the skills and interests that would be important here correct? For many of us, pursuing a graduate degree is a logical next step after a successful undergraduate experience, but after graduate school, the steps are not so well laid out, and the number of options seems to increase dramatically. Would you like doing a PhD? What about working in health policy, or as a genome analyst? There are many, many options available to you after getting a Master's degree in genetics or genomics, falling into at least 14 unique career categories – which ones would you like best?
                                    </p>

                                    <p style={{ lineHeight: "1.6", marginBottom: "1.5rem" }}>
                                        These questions are not easy to answer, but thinking about this can go a long way towards helping you find a career path that will be stimulating and fulfilling for you.
                                    </p>

                                    <button className="ResultsButton" onClick={() => setActiveView("careers")}>
                                        View Career Matches
                                    </button>
                                </>
                            )}

                            {activeView === "careers" && (
                                <>
                                    <h2>Your Career Matches</h2>

                                    <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
                                        This page compares your answers from the Skills and Interests surveys you've already completed to career paths that are most commonly followed by graduates from a Master's-level graduate program in medical genetics or genomics. You'll find these careers ordered from your best fits to the worst fits, based on the responses you've provided. This calculation is based on responses provided by a number of experts working in each type of career. These calculations might give you some interesting information, but they are not perfect – if the career you're most interested in is not at the top of your list don't be disheartened, you can still consider it; the point of the GenomeIDP assessment is just to give you the chance to think about it deliberately.
                                    </p>

                                    <p style={{ marginBottom: "2rem", lineHeight: "1.6" }}>
                                        You can click on each career path to get a more complete picture of how your survey answers compare with the those that are the most important for each career path. Remember that these results can't tell the future, and will not limit your options – you can always improve on important skills if it's relevant to a career you really want!
                                    </p>

                                    <table className="ResultsTable">
                                        <thead>
                                            <tr>
                                                <th className="left-align">Rank</th>
                                                <th className="center-align">Career Path</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {matches
                                                .sort((a, b) => {
                                                    if (a.Rank === null) return 1;
                                                    if (b.Rank === null) return -1;
                                                    return a.Rank - b.Rank;
                                                })
                                                .map((match, idx) => (
                                                    <tr
                                                        key={idx}
                                                        className={`rank-row ${match.Rank === null ? "rank-null" : `rank-${match.Rank}`}`}
                                                        onClick={() =>
                                                            history.push({
                                                                pathname: `/career/${encodeURIComponent(match.Profession)}`,
                                                                state: { responses },
                                                            })
                                                        }
                                                    >
                                                        <td className="left-align">{match.Rank ?? "—"}</td>
                                                        <td className="center-align">{match.Profession}</td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                    
                                    <p style={{ marginTop: "4rem", marginBottom: "2rem", lineHeight: "1.6" }}>
                                        Now that you've explored some of the ways your current skills and interests impact career paths 
                                        that you might be a good match for, it's time to think a little more about how your values should play
                                        into the choice of a career path.
                                    </p>
                                    
                                    <button
    									className="ResultsButton"
    									onClick={() => setActiveView("values")}
									>
    									Continue to Values
									</button>
                                </>
                            )}

                            {activeView === "values" && (
                                <>
                                    <h2>Your Career Values</h2>

                                    <p style={{ marginBottom: "2rem", lineHeight: "1.6" }}>
                                        You'll notice that your Values assessments didn't factor into your Career Match scores, and we're looking at them separately. This is because your values are extremely personal and unique to you, and whether they are met in a certain career depends on the specific employer and on individual jobs, and also on your individual understanding of your own experience - they inform your fit in certain roles in a way that no matching algorithm can capture. Your values should provide a lens through which you can understand your career fits and will factor into the questions you might want to ask – both of yourself, and in interviews – as you consider whether different careers are right for you.
                                    </p>

                                    <p style={{ marginBottom: "2rem", lineHeight: "1.6" }}>
                                        Below are the values you rated as absolutely essential (5/5) in your assessment, alongside questions to consider as you explore each career path. Use these prompts to guide your thinking.
                                    </p>

                                    {topValues.length === 0 ? (
                                        <p style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}>
                                            No values were rated as absolutely essential (5/5) in your assessment.
                                            Remember, you'll get the most out of your self-reflections if you use the full range of
                                            scores available - there must be <strong>something</strong> you care deeply
                                            about when it comes to your work!
                                            <br />
                                            You can return to the form and update your values at any time.
                                        </p>
                                    ) : (
                                        <>
                                            <table className="ResultsTable ValuesTable">
                                                <thead>
                                                    <tr>
                                                        <th className="left-align">Specific Value</th>
                                                        <th className="left-align">Things to Consider</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {topValues.map((v, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                                                                {v.name}
                                                            </td>
                                                            <td>{v.prompt}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            <p
                                                style={{
                                                    marginTop: "1.5rem",
                                                    lineHeight: "1.6",
                                                    color: "#333",
                                                    textAlign: "left"
                                                }}
                                            >
                                                When push comes to shove, you’ll need to decide whether each career path can give you
                                                (or at least allow you to work towards) the things that are the most important to you.
                                                Which of your values cannot be met by each career path, and how important is that to you?
                                            </p>
                                            
                                            <p
    											style={{
        											marginTop: "1.5rem",
        											lineHeight: "1.6",
        											color: "#333",
        											textAlign: "left",
        											width: "100%",
        											display: "block",
        											marginLeft: "0"
   							 					}}
											>
   				 								When you're ready, it's time to leverage all this information to start doing some practical
    											career planning.
											</p>
											
											<button
    											className="ResultsButton"
    											onClick={() => setActiveView("planIntro")}
											>
    											Continue to My Plan
											</button>
                                        </>
                                    )}
                                </>
                            )}

                            {activeView === "planIntro" && (
                                <>
                                    <h2>My Plan</h2>

                                    <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
									As you’ve worked through GenomeIDP, you’ve made a list 
									of your best skills, top interests, 
									and most important values, and you’ve had the chance to 
									explore career paths that are available to graduates 
									from genetics-focussed graduate programming. Now it's 
									time to begin creating your professional network so you
									can seek additional information, and start planning for 
									what comes next when you’re done your graduate training! 
									Even though your next transition (into a new job, or out 
									of your graduate program, for example) may not be imminent,  
									<strong> if you start planning now,</strong> you can use your 
									time wisely to seek opportunities that will best prepare you for the 
									career path you want to be on, and to focus your training. 
                                    </p>

                                    <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
                                        Your plan doesn't need to be perfect on the first pass - it doesn't
                                        even need to be complete! Just think of this as a way to 
                                        gather your thoughts and useful ideas, and keep track of the things you 
                                        might want to come back to as you figure out your next steps.
                                    </p>

                                    <p style={{ lineHeight: "1.6", marginBottom: "1.5rem" }}>
                                        You can begin by using Notes as a central place to collect reflections, planning ideas, and action items from across the remaining stages of the program.
                                    </p>

                                    <button className="ResultsButton" onClick={() => setActiveView("notes")}>
                                        Go to Notes
                                    </button>
                                </>
                            )}

                            {activeView === "connectIntro" && (
    <>
        <h2>Connect</h2>

        <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
            Now that you’ve had a chance to do some preliminary research into different career possibilities, it’s time to think about how to extend this knowledge and make some real-world connections. Making authentic connections with people is the best way to really learn what it’s like to work in a certain field, and to figure out if it’s going to be a good fit for you.
        </p>

        <p style={{ lineHeight: "1.6", marginBottom: "1.5rem" }}>
            Remember that this is an iterative process, and you should expect to dedicate a significant amount of time to learning about your options, meeting people working in the types of roles you think you might be interested in, and documenting your findings.
        </p>

        <div className="MyPlanActionGroup" style={{ marginTop: "0.5rem" }}>
            <button
                className="ResultsButton"
                onClick={() => setActiveView("connectWorkshops")}
            >
                Attend Workshops and Conferences
            </button>

            <button
                className="ResultsButton"
                onClick={() => setActiveView("connectReachOut")}
            >
                Reach Out
            </button>
            </div>
           
            <p style={{ marginTop: "3rem", lineHeight: "1.6" }}>
            Once you've had some time to grow your professional network, 
            you'll be ready to set a few long-term career goals. If you're ready now, 
            keep your momentum up and head to the next section!
        	</p>
        
        <div className="MyPlanActionGroup">
    		<button
        		className="ResultsButton"
        		style={{ alignSelf: "flex-start", marginTop: "1.5rem" }}
        		onClick={() => setActiveView("alternateRealitiesIntro")}
   		 	>
        		Go to Alternate Realities
    		</button>
		</div>
        
    </>
)}

{activeView === "connectWorkshops" && (
    <>
        <h2>Attend Workshops and Conferences</h2>

        <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
            Discipline, profession, and field-specific workshops, meetings, and
            conferences can offer a density of professionals who might be able to provide
            you with some guidance based on their own experiences. These types of sessions
            can also offer valuable insight into the specifics of different types of work,
            and provide unique networking opportunities!
        </p>

        <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
            There are many different types of events that could prove valuable, depending
            on the type of career path you’re most interested in:
        </p>

        <ol style={{ marginBottom: "1.5rem", paddingLeft: "1.5rem", lineHeight: "1.7" }}>
            <li style={{ marginBottom: "0.75rem" }}>
                Consider attending career panels on your home campus, and use the chance
                to learn more from people who have graduated with your background and gone
                on to pursue careers that are compelling to you.
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                Attend conferences and meetings of professional societies that are
                important for your discipline – many large professional societies offer
                career focussed sessions and even mentoring programs and workshops!
                Additionally, joining relevant professional societies can be beneficial
                even if the group isn’t hosting regular meet-ups – these groups can still
                provide a valuable means for finding and engaging with professionals in
                your area(s) of interest.
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                Local hub meetings for particular career nodes are common in areas in
                which there’s a noticeable hotspot or cluster of activity for certain
                types of work – for example, your home institution may be in a city with
                a defined biotechnology or precision medicine industry, and there may be
                interesting meetings that professionals in these fields offer.
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                Chapter meetings for institutional or community-based affinity groups, for
                example, groups that focus on and uplift women in STEM, or Black and
                Indigenous Scholars groups, can be a wonderful place to find contextually
                relevant support and insight into a variety of meaningful career spaces.
            </li>
        </ol>

        <div
            className="CareerResourcesBlurb"
            style={{
        			marginTop: "1.5rem",
        			lineHeight: "1.6",
        			color: "#333",
        			textAlign: "left",
        			width: "100%",
        			display: "block",
        			marginLeft: "0"
   					}}
        >
            <p>
                Want to keep track of useful events, names, or next steps? Add them to your
                Notes so you can return to them as your plan develops.
            </p>
            <button
                className="ResultsButton"
                onClick={() => setActiveView("notes")}
                style={{ marginTop: "1rem" }}
            >
                Go to Notes
            </button>
        </div>

        <button
            className="ResultsButton"
            onClick={() => setActiveView("connectIntro")}
        >
            Back to Connect
        </button>
    </>
)}

{activeView === "connectReachOut" && (
    <>
        <h2>Reach Out</h2>

        <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
            One of the best ways to find out if a particular type of work might suit you is to speak with people who are doing this work. Setting up informational interviews with people in careers you’re interested in is a great way to:
        </p>

        <ul style={{ marginBottom: "1.5rem", paddingLeft: "1.5rem", lineHeight: "1.7" }}>
            <li style={{ marginBottom: "0.5rem" }}>
                Get a reality check about what a career actually looks like, and decide if it suits you
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
                Access insider tips about how to make a smooth transition from your current role onto this career path
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
                Learn about the field, and what it takes to succeed in this type of career
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
                Build new contacts in the field
            </li>
            <li style={{ marginBottom: "0.5rem" }}>
                Develop your communication skills and confidence!
            </li>
        </ul>

        <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
            Networking with professionals you don’t know well (or at all!) can be daunting, but luckily there are a few tried and true steps to conducting an informational interview that is valuable, professional, and educational:
        </p>

        <ol style={{ marginBottom: "1.5rem", paddingLeft: "1.5rem", lineHeight: "1.7" }}>
            <li style={{ marginBottom: "0.75rem" }}>
                Find some people to talk to – professionals you’ve identified through your GenomeIDP investigations thus far, your professors, friends, family, and even neighbours might make good candidates! (Don’t know where to start? Try making a list of dream companies, and then researching names on LinkedIn!)
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                Set up the informational interview – email or call the person you’d like to meet with. Be professional, polite, and to the point. Ensure that it’s clear you’re looking for career advice, rather than a job offer! (There are many excellent templates for cold informational interview emails online; pick one that works best for you!)
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                Do your homework, and come up with questions – learn about the career and the company in question before the informational interview (hint – use the information in GenomeIDP’s EXPLORE section). Clarify what you actually want to learn during the interview for yourself before you get there, and come up with a short list of questions for your interviewee. Consider your GenomeIDP values assessment as you plan your questions, and check out this{" "}
                <button
                    type="button"
                    onClick={() => setActiveView("informationalInterviewQuestions")}
                    style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        margin: 0,
                        color: "#0b5cab",
                        textDecoration: "underline",
                        cursor: "pointer",
                        font: "inherit"
                    }}
                >
                    list of sample questions
                </button>
                . As a general rule, don’t waste your interview time asking questions you can get the answer to on the Internet!
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                Conduct the interview – dress neatly and professionally, arrive on time or a few minutes early, and bring your list of questions. Be sure you’re ready to provide a short (one minute or less) overview of your educational background and career goals, and reiterate that you’re seeking career advice, and not asking for a job! Keep an eye on the time, and ensure that you give the interviewee an opportunity to end the conversation at the agreed upon end-point. Do NOT ask to submit a resume, or the interviewee may think you’re fishing for a job.
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                Follow up – after the meeting, send a quick note to thank your interviewee for their time and insights, as well as sending a request to connect on LinkedIn. Keep in touch with the person, especially if you had a good interaction, and / or followed their advice at a later date! This is a great way to maintain a network based on an authentic connection.
            </li>
        </ol>

       <div className="ReachOutExtrasCard">
    <h3>More Support</h3>
        
        <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
    Looking for a little more information? Check out this quick read from{" "}
    <a
        href="https://www.linkedin.com/pulse/how-ask-make-most-informational-interview-jenny-foss/"
        target="_blank"
        rel="noopener noreferrer"
    >
        Steer Your Career’s Jenny Foss on LinkedIn
    </a>.
</p>

<p style={{ lineHeight: "1.6", marginBottom: "1.5rem" }}>
    Looking for a lot more information?{" "}
    <a
        href="https://www.livecareer.com/resources/interviews/prep/informational-interviewing"
        target="_blank"
        rel="noopener noreferrer"
    >
        Live Career has a great in-depth tutorial
    </a>{" "}
    to help you become an informational interviewing expert.
</p>
</div>
        <div
            className="CareerResourcesBlurb"
            style={{
        			marginTop: "1.5rem",
        			lineHeight: "1.6",
        			color: "#333",
        			textAlign: "left",
        			width: "100%",
        			display: "block",
        			marginLeft: "0"
   					}}
        >
            <p>
                Want to keep track of useful names, questions, or follow-up ideas? Add them to your Notes so you can return to them as your plan develops.
            </p>
            <button
                className="ResultsButton"
                onClick={() => setActiveView("notes")}
                style={{ marginTop: "1rem" }}
            >
                Go to Notes
            </button>
        </div>

        <button
            className="ResultsButton"
            onClick={() => setActiveView("connectIntro")}
        >
            Back to Connect
        </button>
    </>
)}

{activeView === "informationalInterviewQuestions" && (
    <>
        <h2>Informational Interview - Sample Questions</h2>

        <p style={{ lineHeight: "1.6", marginBottom: "1.5rem" }}>
            This is a long list of potential informational interview questions – remember 
            that your time with your interviewee is limited, and you will not be able to 
            ask all of these. There may also be questions that are not on this list that you'd really
            like to ask! Prioritize the ones that matter most to you at whatever 
            stage of career planning you’re in right now.
        </p>

        <ul style={{ marginBottom: "1.5rem", paddingLeft: "1.5rem", lineHeight: "1.7" }}>
            <li style={{ marginBottom: "0.75rem" }}>
                How did you get into this field? What is your educational background? What was your career path to your current position?
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                How did you get your job? What are the other job search methods that are useful in this field? What are typical entry-level positions?
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                Are there any courses / types of jobs / volunteer positions you would recommend as preparation for this field?
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                Do you think this field is expanding or stable? Are there any significant changes you can foresee in this industry?
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                Can you give me a description of a typical day?
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                What are the challenges and rewards of your position?
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                What skills / qualities do you think have helped you the most in being successful in your career so far?
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                What kinds of problems do you deal with? What kinds of decisions do you make at work? What are your main responsibilities?
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                How does your position fit within the organization / company / career field / industry?
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                How does your job fit within your general lifestyle?
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                What types of accomplishments tend to be valued and rewarded in this type of field?
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                Are there professional associations / trade or academic journals / websites that you recommend subscribing to help with professional development?
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                How does the organization support and encourage equity, diversity and inclusion? Do they have specific programs and opportunities?
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                Is there anyone else you would recommend that I speak with for more information?
            </li>
        </ul>

        <div
            className="CareerResourcesBlurb"
            style={{ marginTop: "2rem", marginBottom: "1.5rem" }}
        >
            <p>
                Want to keep track of the questions that matter most to you? Add them to your Notes so you can return to them before or after an informational interview.
            </p>
            <button
                className="ResultsButton"
                onClick={() => setActiveView("notes")}
                style={{ marginTop: "1rem" }}
            >
                Go to Notes
            </button>
        </div>

        <button
            className="ResultsButton"
            onClick={() => setActiveView("connectReachOut")}
        >
            Back to Reach Out
        </button>
    </>
)}

{activeView === "alternateRealitiesIntro" && (
    <>
        <h2>Alternate Realities</h2>

        <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
            It's time to start mapping out career paths. As you get started, remember – 
            there’s no such thing as a perfect career fit! If you can identify a career 
            path that will let you take advantage of your best skills, engage in your top 
            interests, and align with your most important values, you should seriously 
            consider pursuing this path.
        </p>

        <p style={{ lineHeight: "1.6", marginBottom: "1.5rem" }}>
            Let's make some choices – get started by identifying two possible long term 
            career goals, and tethering each of these to the career path that matches it 
            or could enable it most closely, using the drop down menus below.
        </p>
        
        <div className="AlternateRealityGrid">
    <div className="AlternateRealityCard">
    <h3>Possible Future 1</h3>

    <label className="AlternateRealityLabel" htmlFor="alt-goal-1">
        Long-term career goal
    </label>
    <textarea
        id="alt-goal-1"
        className="AlternateRealityTextarea"
        value={altGoal1}
        onChange={(e) => setAltGoal1(e.target.value)}
        placeholder="Describe one possible long-term goal..."
        rows={5}
    />

    <label className="AlternateRealityLabel" htmlFor="alt-career-1">
        Related career path
    </label>
    <select
        id="alt-career-1"
        className="AlternateRealitySelect"
        value={altCareer1}
        onChange={(e) => setAltCareer1(e.target.value)}
    >
        <option value="">Select a career path</option>
        {matches
            .slice()
            .sort((a, b) => {
                if (a.Rank === null) return 1;
                if (b.Rank === null) return -1;
                return a.Rank - b.Rank;
            })
            .map((match, idx) => (
                <option key={`alt1-${idx}`} value={match.Profession}>
                    {match.Profession}
                </option>
            ))}
    </select>

    <label
        className="AlternateRealityLabel"
        htmlFor="alt-steps-1"
        style={{ marginTop: "1.25rem" }}
    >
        Required transition skills or experiences
    </label>
    <textarea
        id="alt-steps-1"
        className="AlternateRealityTextarea"
        value={altSteps1}
        onChange={(e) => setAltSteps1(e.target.value)}
        placeholder="What skills, experiences, qualifications, or next steps would help you move toward this path?"
        rows={5}
    />
</div>

    <div className="AlternateRealityCard">
    <h3>Possible Future 2</h3>

    <label className="AlternateRealityLabel" htmlFor="alt-goal-2">
        Long-term career goal
    </label>
    <textarea
        id="alt-goal-2"
        className="AlternateRealityTextarea"
        value={altGoal2}
        onChange={(e) => setAltGoal2(e.target.value)}
        placeholder="Describe another possible long-term goal..."
        rows={5}
    />

    <label className="AlternateRealityLabel" htmlFor="alt-career-2">
        Related career path
    </label>
    <select
        id="alt-career-2"
        className="AlternateRealitySelect"
        value={altCareer2}
        onChange={(e) => setAltCareer2(e.target.value)}
    >
        <option value="">Select a career path</option>
        {matches
            .slice()
            .sort((a, b) => {
                if (a.Rank === null) return 1;
                if (b.Rank === null) return -1;
                return a.Rank - b.Rank;
            })
            .map((match, idx) => (
                <option key={`alt2-${idx}`} value={match.Profession}>
                    {match.Profession}
                </option>
            ))}
    </select>

    <label
        className="AlternateRealityLabel"
        htmlFor="alt-steps-2"
        style={{ marginTop: "1.25rem" }}
    >
        Required transition skills or experiences
    </label>
    <textarea
        id="alt-steps-2"
        className="AlternateRealityTextarea"
        value={altSteps2}
        onChange={(e) => setAltSteps2(e.target.value)}
        placeholder="What skills, experiences, qualifications, or next steps would help you move toward this path?"
        rows={5}
    />
</div>
</div>

	<p style={{ marginTop: 0, marginBottom: 0, color: "#666" }}>
            {isAutosavingAlt ? "Saving..." : "Changes saved automatically."}
    </p>
                                    
        <p style={{ lineHeight: "1.6", marginBottom: "1.5rem" }}>
            Once you’ve defined a goal and a career path for two different possible futures, 
            take a moment to consider all that you’ve learned about these career paths in 
            your research, career exploration, and networking so far – what do you still 
            need to get or do in order to be able to access that career path? This will 
            provide the first stepping stone as you build a real, practical plan to get from 
            where you are today to a career that will suit your skills, interests, and 
            values in the future.
        </p>

        <div className="ReachOutExtrasCard">
            <h3>Why are we doing this twice?</h3>

            <p style={{ lineHeight: "1.6", marginBottom: "0" }}>
                As outlined in Bill Burnett and Dave Evans’{" "}
                <a
                    href="https://designingyour.life/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Designing Your Life
                </a>
                , exploring your options and keeping your potential open with more than 
                one option is more creative, less formulaic, and more fun. It also gives 
                you some wiggle room if the job market in one of your chosen career paths 
                is extremely competitive, or if your career preferences shift and change 
                between now and when you graduate.
            </p>
        </div>
        
        <p style={{ lineHeight: "1.6", marginBottom: "1.5rem" }}>
            Great job! Now that you've defined two possible futures for yourself, let's set some
            practical short-term goals.
        </p>
        <button
            className="ResultsButton"
            onClick={() => setActiveView("smartGoalsIntro")}
        >
            Set some SMART Goals
        </button>
    </>
)}

{activeView === "smartGoalsIntro" && (
    <>
        <h2>SMART Goals</h2>

        <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
            Now that you’ve identified two potential career paths that you’re interested in pursuing, it’s time to figure out how to get there. In the coming sections, you’ll be asked to identify three different types of goals for yourself, all of which you’ll aim to accomplish within the next year:
        </p>

        <ol style={{ lineHeight: "1.6", marginBottom: "1.5rem", paddingLeft: "1.5rem" }}>
            <li style={{ marginBottom: "0.75rem" }}>
                Goals to advance your career – these will focus on moving forward in your professional development, and might include things like “prepare a resume,” “do informational interviews,” or “find a mentor.”
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                Goals to build your skills – these will give you the chance to improve specific skills that will help you in the career paths you’ve identified.
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
                Goals to succeed in your current graduate program – these will help you excel in your current projects as you work to finish your program.
            </li>
        </ol>

        <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
            For each category, you’ll be asked to write specific SMART goals, all of which should be accomplishable within a one-year timeline. As a reminder, SMART goals are:
        </p>

        <ul 
        	style={{ lineHeight: "1.6", marginBottom: "1.5rem", paddingLeft: "1.5rem", listStyleType: "none" }}>
            	<li style={{ marginBottom: "0.75rem" }}>
                <strong>S – Specific.</strong> Is the goal focussed and clear? What will you actually do in order to meet this goal?
            	</li>
            	<li style={{ marginBottom: "0.75rem" }}>
                <strong>M – Measurable.</strong> How will you know if you’ve succeeded or not?
            	</li>
           	 <li style={{ marginBottom: "0.75rem" }}>
                <strong>A – Attainable.</strong> How hard is this? Will you actually be able to do it? Do you have the resources and the ability?
            	</li>
            	<li style={{ marginBottom: "0.75rem" }}>
                	<strong>R – Relevant.</strong> Does meeting this goal get you closer to what you want? Why is this important?
            	</li>
            	<li style={{ marginBottom: "0.75rem" }}>
                <strong>T – Time-bound.</strong> When will you start? When is the deadline?
            	</li>
        </ul>

        <p style={{ lineHeight: "1.6", marginBottom: "1.5rem" }}>
            As you define – and begin to work towards – your goals, don’t forget to keep yourself accountable to them, to celebrate your successes as you meet your milestones, and to revisit and revise your goals and objectives as you progress!
        </p>
        
        <div className="MyPlanActionGroup" style={{ marginTop: "0.5rem" }}>
            <button
                className="ResultsButton"
                onClick={() => setActiveView("smartCareerAdvancementGoals")}
            >
                Set Career Advancement Goals
            </button>

            <button
                className="ResultsButton"
                onClick={() => setActiveView("smartSkillBuildingGoals")}
            >
                Set Skill Building Goals
            </button>
            
            <button
                className="ResultsButton"
                onClick={() => setActiveView("smartCurrentProgramGoals")}
            >
                Set Goals for Your Current Program
            </button>
            </div>
           
            <p style={{ marginTop: "3rem", lineHeight: "1.6" }}>
            Now that you've defined all of your SMART goals, head to the next section to 
            set some insights around how to keep up your momentum as you move forward!
        	</p>
        
        <div className="MyPlanActionGroup">
    		<button
        		className="ResultsButton"
        		style={{ alignSelf: "flex-start", marginTop: "1.5rem" }}
        		onClick={() => setActiveView("findMentors")}
   		 	>
        		Go to Find Mentors
    		</button>
		</div>
    </>
)}

{activeView === "smartCareerAdvancementGoals" && (
    <>
        <h2>Career Advancement Goals</h2>

        <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
            From the list below, choose some areas in which you’d like to improve. Don’t pick too many - aim for two-five at this stage!
        </p>

        <div style={{ marginBottom: "2rem" }}>
            {[
                "Find a mentor",
                "Do further self-reflection on my skills, interests, and / or values",
                "Learn more about my best match career path options",
                "Do informational interviews",
                "Gain some new experience (e.g. internship, volunteering)",
                "Attend workshops, seminars, conferences, and / or events related to my career path interests",
                "Build skills specific to my career path(s) of interest",
                "Develop my professional network",
                "Build my online professional brand (e.g. LinkedIn, personal website)",
                "Join a professional society, group, committee, and / or organization",
                "Construct a job search strategy",
                "Prepare my CV / resume and / or cover letter template",
                "Prepare for behavioural and technical interviews",
                "Other"
            ].map((option, idx) => (
                <label
                    key={idx}
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        marginBottom: "0.85rem",
                        lineHeight: "1.5",
                        cursor: "pointer"
                    }}
                >
                    <input
                        type="checkbox"
                        checked={careerAdvancementSelections.includes(option)}
                        onChange={() => handleCareerAdvancementToggle(option)}
                        style={{ marginTop: "0.2rem", flexShrink: 0 }}
                    />
                    <span>{option}</span>
                </label>
            ))}
        </div>
        
        {careerAdvancementSelections.includes("Other") && (
    <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
        <label
            htmlFor="career-advancement-other"
            style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "600"
            }}
        >
            Please describe your other goal:
        </label>

        <textarea
            id="career-advancement-other"
            value={careerAdvancementOther}
            onChange={(e) => setCareerAdvancementOther(e.target.value)}
            rows={4}
            placeholder="Write your other goal here..."
            style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontFamily: "inherit",
                fontSize: "1rem",
                lineHeight: "1.5",
                resize: "vertical"
            }}
        />
    </div>
)}
        {careerAdvancementError && (
    <p
        style={{
            color: "#b00020",
            marginTop: "0.5rem",
            marginBottom: "1rem",
            fontWeight: "600"
        }}
    >
        {careerAdvancementError}
    </p>
)}
        <p style={{ marginTop: "1rem", color: "#666" }}>
    		Selected: {careerAdvancementSelections.length} / 5
		</p>
		
		<p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
            Now let’s build some SMART goals for the next year! For each of the areas for 
            career advancement that you’ve selected, construct one or more goals using the 
            Goal Builder below.
        </p>

			{careerAdvancementSmartRows.length > 0 && (
    <div style={{ marginTop: "2rem", marginBottom: "2rem", overflowX: "auto" }}>
        <table className="ResultsTable">
            <thead>
                <tr>
                    <th className="left-align">Career Development Goal</th>
                    <th className="left-align">SMART Goal</th>
                    <th className="left-align">Recurrence</th>
                    <th className="left-align">Start Date</th>
                    <th className="left-align">End Date</th>
                </tr>
            </thead>
            <tbody>
                {careerAdvancementSmartRows.map((row, idx) => (
                    <tr key={idx}>
                        <td
                            className="left-align"
                            style={{ fontWeight: "600", minWidth: "220px" }}
                        >
                            {row.goal}
                        </td>

                        <td>
                            <textarea
                                rows={3}
                                value={row.smartGoal || ""}
                                onChange={(e) =>
                                    handleCareerAdvancementSmartRowChange(
                                        idx,
                                        "smartGoal",
                                        e.target.value
                                    )
                                }
                                placeholder="What exactly will you do? How will you know if you've been successful?"
                                style={{
                                    width: "100%",
                                    minWidth: "180px",
                                    padding: "0.6rem",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    fontFamily: "inherit",
                                    fontSize: "0.95rem",
                                    lineHeight: "1.4",
                                    resize: "vertical"
                                }}
                            />
                        </td>

                        <td>
                            <textarea
                                rows={3}
                                value={row.recurrence || ""}
                                onChange={(e) =>
                                    handleCareerAdvancementSmartRowChange(
                                        idx,
                                        "recurrence",
                                        e.target.value
                                    )
                                }
                                placeholder="How often will you do this? Daily? Weekly? Monthly?"
                                style={{
                                    width: "100%",
                                    minWidth: "180px",
                                    padding: "0.6rem",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    fontFamily: "inherit",
                                    fontSize: "0.95rem",
                                    lineHeight: "1.4",
                                    resize: "vertical"
                                }}
                            />
                        </td>

                        <td>
                            <textarea
                                rows={3}
                                value={row.startDate || ""}
                                onChange={(e) =>
                                    handleCareerAdvancementSmartRowChange(
                                        idx,
                                        "startDate",
                                        e.target.value
                                    )
                                }
                                placeholder="When are you going to get started?"
                                style={{
                                    width: "100%",
                                    minWidth: "180px",
                                    padding: "0.6rem",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    fontFamily: "inherit",
                                    fontSize: "0.95rem",
                                    lineHeight: "1.4",
                                    resize: "vertical"
                                }}
                            />
                        </td>

                        <td>
                            <textarea
                                rows={3}
                                value={row.endDate || ""}
                                onChange={(e) =>
                                    handleCareerAdvancementSmartRowChange(
                                        idx,
                                        "endDate",
                                        e.target.value
                                    )
                                }
                                placeholder="When do you hope to achieve this goal?"
                                style={{
                                    width: "100%",
                                    minWidth: "220px",
                                    padding: "0.6rem",
                                    borderRadius: "6px",
                                    border: "1px solid #ccc",
                                    fontFamily: "inherit",
                                    fontSize: "0.95rem",
                                    lineHeight: "1.4",
                                    resize: "vertical"
                                }}
                            />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)}

	<p style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.75rem" }}>
    	{isAutosavingCareerAdvancement ? "Saving..." : "Changes saved automatically."}
	</p>

        <button
            className="ResultsButton"
            onClick={() => setActiveView("smartGoalsIntro")}
        >
            Back to SMART Goals
        </button>
    </>
)}

{activeView === "smartSkillBuildingGoals" && (
    <>
        <h2>Skill Building Goals</h2>

        <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
            The list below includes all of the skills you’ve already assessed yourself in 
            as a part of GenomeIDPs self-reflective skills survey. On the left, you'll also 
            see the ranking you gave yourself out of five. Choose some areas in which you’d 
            like to improve, and as you pick, consider the skills that are likely to be the most 
            relevant to the career paths you’re most interested in pursuing. Don’t pick too 
            many - aim for two-five at this stage! 

        </p>

		{skillBuildingError && (
            <p style={{ color: "red", marginBottom: "1rem" }}>
                {skillBuildingError}
            </p>
        )}

        {skillBuildingGroups.map((group) => {
    		const sectionAnswers = skillResponsesBySection[group.key] || {};

    		return (    
    			<div key={group.key} style={{ marginBottom: "1.5rem" }}>
        		<h3 style={{ marginBottom: "0.75rem", marginLeft: "5rem"  }}>{group.key}</h3>

        		<div style={{ display: "flex", flexDirection: "column" }}>
            		{group.content.map((skill, index) => {
        const score = sectionAnswers[index];

        return (
            <label
                key={skill}
                className="career-goal-option"
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    marginBottom: "0.85rem"
                }}
            >
                <span
                    style={{
                        minWidth: "3rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "999px",
                        backgroundColor:
                            score >= 4
                                ? "#dbeafe"
                                : score === 3
                                ? "#e5e7eb"
                                : "#ffedd5",
                        color:
                            score >= 4
                                ? "#1d4ed8"
                                : score === 3
                                ? "#374151"
                                : "#c2410c",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        textAlign: "center",
                        lineHeight: "1.2",
                        marginTop: "0.1rem"
                    }}
                >
                    {score ? `${score}/5` : "-"}
                </span>

                <input
                    type="checkbox"
                    checked={skillBuildingSelections.includes(skill)}
                    onChange={() => handleSkillBuildingToggle(skill)}
                    style={{ marginTop: "0.25rem", flexShrink: 0 }}
                />

                <span style={{ flex: 1, lineHeight: "1.5" }}>
                    {skill}
                </span>
            </label>
        );
    })}
        		</div>
   		 </div>
    		);
})}

		<p style={{ marginTop: "1rem", color: "#666" }}>
    		Selected: {skillBuildingSelections.length} / 5
		</p>

		<p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
   			Now let’s build some SMART goals for the next year! For each of the skill
    		areas you’ve selected, construct one or more goals using the Goal Builder below.
		</p>
		
		{skillBuildingSmartRows.length > 0 && (
    			<div style={{ marginTop: "2rem", marginBottom: "2rem", overflowX: "auto" }}>
       			 <table className="ResultsTable">
            			<thead>
                			<tr>
                    			<th className="left-align">Skill Building Goal</th>
                    			<th className="left-align">SMART Goal</th>
                    			<th className="left-align">Recurrence</th>
                    			<th className="left-align">Start Date</th>
                    			<th className="left-align">End Date</th>
                			</tr>
            			</thead>
            			<tbody>
                			{skillBuildingSmartRows.map((row, idx) => (
                    			<tr key={idx}>
                        			<td
                            			className="left-align"
                            			style={{ fontWeight: "600", minWidth: "220px" }}
                        			>
                            			{row.goal}
                        			</td>

                        			<td>
                            			<textarea
                                			rows={3}
                                			value={row.smartGoal || ""}
                                			onChange={(e) =>
                                    			handleSkillBuildingSmartRowChange(
                                        			idx,
                                        			"smartGoal",
                                        			e.target.value
                                    			)
                                			}
                                			placeholder="What exactly will you do? How will you know if you've been successful?"
                                			style={{
                                    			width: "100%",
                                    			minWidth: "180px",
                                    			padding: "0.6rem",
                                    			borderRadius: "6px",
                                    			border: "1px solid #ccc",
                                    			fontFamily: "inherit",
                                    			fontSize: "0.95rem",
                                    			lineHeight: "1.4",
                                    			resize: "vertical"
                                			}}
                            			/>
                        			</td>

                        			<td>
                            			<textarea
                                			rows={3}
                                			value={row.recurrence || ""}
                                			onChange={(e) =>
                                    			handleSkillBuildingSmartRowChange(
                                        			idx,
                                        			"recurrence",
                                        			e.target.value
                                    			)
                                			}
                                			placeholder="How often will you do this? Daily? Weekly? Monthly?"
                                			style={{
                                    			width: "100%",
                                    			minWidth: "180px",
                                    			padding: "0.6rem",
                                    			borderRadius: "6px",
                                    			border: "1px solid #ccc",
                                    			fontFamily: "inherit",
                                    			fontSize: "0.95rem",
                                    			lineHeight: "1.4",
                                    			resize: "vertical"
                                			}}
                            			/>
                        			</td>

                        			<td>
                            			<textarea
                                			rows={3}
                                			value={row.startDate || ""}
                                			onChange={(e) =>
                                    			handleSkillBuildingSmartRowChange(
                                        			idx,
                                        			"startDate",
                                        			e.target.value
                                    			)
                                			}
                                			placeholder="When are you going to get started?"
                                			style={{
                                    			width: "100%",
                                    			minWidth: "180px",
                                    			padding: "0.6rem",
                                    			borderRadius: "6px",
                                    			border: "1px solid #ccc",
                                    			fontFamily: "inherit",
                                    			fontSize: "0.95rem",
                                    			lineHeight: "1.4",
                                    			resize: "vertical"
                                			}}
                            			/>
                        			</td>

                        			<td>
                            			<textarea
                                			rows={3}
                                			value={row.endDate || ""}
                                			onChange={(e) =>
                                    			handleSkillBuildingSmartRowChange(
                                        			idx,
                                        			"endDate",
                                        			e.target.value
                                    			)
                                			}
                                			placeholder="When do you hope to achieve this goal?"
                                			style={{
                                    			width: "100%",
                                    			minWidth: "220px",
                                    			padding: "0.6rem",
                                    			borderRadius: "6px",
                                    			border: "1px solid #ccc",
                                    			fontFamily: "inherit",
                                    			fontSize: "0.95rem",
                                    			lineHeight: "1.4",
                                    			resize: "vertical"
                                			}}
                            			/>
                        			</td>
                    			</tr>
                			))}
            			</tbody>
        			</table>
    			</div>
			)}

<p style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.75rem" }}>
    {isAutosavingSkillBuilding ? "Saving..." : "Changes saved automatically."}
</p>

        <button
            className="ResultsButton"
            onClick={() => setActiveView("smartGoalsIntro")}
        >
            Back to SMART Goals
        </button>
    </>
)}

{activeView === "smartCurrentProgramGoals" && (
    <>
        <h2>Goals for Your Current Program</h2>

        <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
            The GenomeIDP is oriented towards helping you succeed in moving your career 
            forward, and while developing yourself professionally and building out career-relevant 
            skills are central to this process, you will also need to succeed in your current 
            projects and program in order to move forward into the next stage of your career. 
            In this section you can create goals that will help you finish your current program 
            or projects, alongside your more career-oriented goals!
		</p>

        <p style={{ lineHeight: "1.6", marginBottom: "1.5rem" }}>
			From the list below, choose some areas in which you’d like to improve. 
			Don’t pick too many - aim for two-five at this stage!
        </p>
        
        <div style={{ marginBottom: "2rem" }}>
            {[
                "Complete coursework",
                "Write paper / report",
                "Create presentation",
                "Analyse data",
                "Prepare for teaching assistant responsibilities",
                "Complete a literature search",
                "Plan practicum / internship",
                "Other"
            ].map((option, idx) => (
                <label
                    key={idx}
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        marginBottom: "0.85rem",
                        lineHeight: "1.5",
                        cursor: "pointer"
                    }}
                >
                    <input
                        type="checkbox"
                        checked={currentProgramSelections.includes(option)}
                        onChange={() => handleCurrentProgramToggle(option)}
                        style={{ marginTop: "0.2rem", flexShrink: 0 }}
                    />
                    <span>{option}</span>
                </label>
            ))}
        </div>

        {currentProgramSelections.includes("Other") && (
            <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
                <label
                    htmlFor="current-program-other"
                    style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "600"
                    }}
                >
                    Please describe your other goal:
                </label>

                <textarea
                    id="current-program-other"
                    value={currentProgramOther}
                    onChange={(e) => setCurrentProgramOther(e.target.value)}
                    rows={4}
                    placeholder="Write your other goal here..."
                    style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ccc",
                        fontFamily: "inherit",
                        fontSize: "1rem",
                        lineHeight: "1.5",
                        resize: "vertical"
                    }}
                />
            </div>
        )}

        {currentProgramError && (
            <p
                style={{
                    color: "#b00020",
                    marginTop: "0.5rem",
                    marginBottom: "1rem",
                    fontWeight: "600"
                }}
            >
                {currentProgramError}
            </p>
        )}

        <p style={{ marginTop: "1rem", color: "#666" }}>
            Selected: {currentProgramSelections.length} / 5
        </p>

        <p style={{ lineHeight: "1.6", marginBottom: "1rem" }}>
            Now let’s build some SMART goals for the next year! For each of the program 
            success areas that you’ve selected, construct one or more goals using the Goal 
            Builder below.
        </p>

        {currentProgramSmartRows.length > 0 && (
            <div style={{ marginTop: "2rem", marginBottom: "2rem", overflowX: "auto" }}>
                <table className="ResultsTable">
                    <thead>
                        <tr>
                            <th className="left-align">Current Program Goal</th>
                            <th className="left-align">SMART Goal</th>
                            <th className="left-align">Recurrence</th>
                            <th className="left-align">Start Date</th>
                            <th className="left-align">End Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProgramSmartRows.map((row, idx) => (
                            <tr key={idx}>
                                <td
                                    className="left-align"
                                    style={{ fontWeight: "600", minWidth: "220px" }}
                                >
                                    {row.goal}
                                </td>

                                <td>
                                    <textarea
                                        rows={3}
                                        value={row.smartGoal || ""}
                                        onChange={(e) =>
                                            handleCurrentProgramSmartRowChange(
                                                idx,
                                                "smartGoal",
                                                e.target.value
                                            )
                                        }
                                        placeholder="What exactly will you do? How will you know if you've been successful?"
                                        style={{
                                            width: "100%",
                                            minWidth: "180px",
                                            padding: "0.6rem",
                                            borderRadius: "6px",
                                            border: "1px solid #ccc",
                                            fontFamily: "inherit",
                                            fontSize: "0.95rem",
                                            lineHeight: "1.4",
                                            resize: "vertical"
                                        }}
                                    />
                                </td>

                                <td>
                                    <textarea
                                        rows={3}
                                        value={row.recurrence || ""}
                                        onChange={(e) =>
                                            handleCurrentProgramSmartRowChange(
                                                idx,
                                                "recurrence",
                                                e.target.value
                                            )
                                        }
                                        placeholder="How often will you do this? Daily? Weekly? Monthly?"
                                        style={{
                                            width: "100%",
                                            minWidth: "180px",
                                            padding: "0.6rem",
                                            borderRadius: "6px",
                                            border: "1px solid #ccc",
                                            fontFamily: "inherit",
                                            fontSize: "0.95rem",
                                            lineHeight: "1.4",
                                            resize: "vertical"
                                        }}
                                    />
                                </td>

                                <td>
                                    <textarea
                                        rows={3}
                                        value={row.startDate || ""}
                                        onChange={(e) =>
                                            handleCurrentProgramSmartRowChange(
                                                idx,
                                                "startDate",
                                                e.target.value
                                            )
                                        }
                                        placeholder="When are you going to get started?"
                                        style={{
                                            width: "100%",
                                            minWidth: "180px",
                                            padding: "0.6rem",
                                            borderRadius: "6px",
                                            border: "1px solid #ccc",
                                            fontFamily: "inherit",
                                            fontSize: "0.95rem",
                                            lineHeight: "1.4",
                                            resize: "vertical"
                                        }}
                                    />
                                </td>

                                <td>
                                    <textarea
                                        rows={3}
                                        value={row.endDate || ""}
                                        onChange={(e) =>
                                            handleCurrentProgramSmartRowChange(
                                                idx,
                                                "endDate",
                                                e.target.value
                                            )
                                        }
                                        placeholder="When do you hope to achieve this goal?"
                                        style={{
                                            width: "100%",
                                            minWidth: "220px",
                                            padding: "0.6rem",
                                            borderRadius: "6px",
                                            border: "1px solid #ccc",
                                            fontFamily: "inherit",
                                            fontSize: "0.95rem",
                                            lineHeight: "1.4",
                                            resize: "vertical"
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.75rem" }}>
            {isAutosavingCurrentProgram ? "Saving..." : "Changes saved automatically."}
        </p>

        <button
            className="ResultsButton"
            onClick={() => setActiveView("smartGoalsIntro")}
        >
            Back to SMART Goals
        </button>
    </>
)}

{activeView === "findMentors" && (
    <>
        <h2>Find Mentors</h2>

        <p style={{ lineHeight: "1.6", marginBottom: "1.5rem" }}>
            As you begin to pursue the goals you’ve set for yourself, consider the value 
            that a good mentoring team – particularly one that includes people who have 
            relevant personal and professional experiences – can play in shaping your development. 
            A mentor can provide guidance, support, and valuable insights that can dramatically 
            enhance your career trajectory. Not only can you benefit from a mentor’s wealth 
            of experience, but a good mentor will also help you identify areas in which 
            you can grow, and build skills, and stay motivated and focussed. Just as importantly, 
            a mentor will keep you accountable, both to yourself, and to your career goals.
        </p>

        <p style={{ lineHeight: "1.6", marginBottom: "1.5rem" }}>
            When you’re mapping out a mentoring team, consider finding people who have 
            different perspectives or expertise that might benefit you in different ways. 
            You may consider your research supervisor or your professors as potential advisors, 
            but if you know you do not want to build a career in academia, you will also 
            want to find other mentors off campus! If you’re seeking mentorship in a particular 
            area, don’t hesitate to ask someone you’ve connected with already if they would 
            be open to providing ongoing advice and insight to you in this specific area.
        </p>

        <p style={{ lineHeight: "1.6", marginBottom: "1.5rem" }}>
            Now that you have a framework, it’s time to define your mentoring team – remember, 
            this list can and will evolve as you change and grow professionally!
        </p>
        
               <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    backgroundColor: "#fff",
                    marginTop: "0.5rem"
                }}
            >
                <thead>
                    <tr>
                        <th
                            style={{
                                textAlign: "left",
                                padding: "0.85rem",
                                border: "1px solid #d9d9d9",
                                backgroundColor: "#f7f7f7",
                                fontWeight: "600",
                                verticalAlign: "top",
                                width: "28%"
                            }}
                        >
                            Mentor&apos;s Name
                        </th>
                        <th
                            style={{
                                textAlign: "left",
                                padding: "0.85rem",
                                border: "1px solid #d9d9d9",
                                backgroundColor: "#f7f7f7",
                                fontWeight: "600",
                                verticalAlign: "top",
                                width: "56%"
                            }}
                        >
                            What is the primary goal of this mentoring relationship?
                        </th>
                        <th
                            style={{
                                padding: "0.85rem",
                                border: "1px solid #d9d9d9",
                                backgroundColor: "#f7f7f7",
                                width: "16%"
                            }}
                        >
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {mentorRows.map((row, index) => (
                        <tr key={index}>
                            <td
                                style={{
                                    border: "1px solid #d9d9d9",
                                    padding: "0.75rem",
                                    verticalAlign: "top",
                                    backgroundColor: "#fff"
                                }}
                            >
                                <textarea
                                    value={row.mentorName}
                                    onChange={(e) =>
                                        handleMentorRowChange(index, "mentorName", e.target.value)
                                    }
                                    placeholder="Enter mentor's name"
                                    rows={3}
                                    style={{
                                        width: "100%",
                                        minHeight: "96px",
                                        border: "1px solid #cfcfcf",
                                        borderRadius: "6px",
                                        padding: "0.75rem",
                                        font: "inherit",
                                        resize: "vertical",
                                        boxSizing: "border-box",
                                        backgroundColor: "#fff"
                                    }}
                                />
                            </td>

                            <td
                                style={{
                                    border: "1px solid #d9d9d9",
                                    padding: "0.75rem",
                                    verticalAlign: "top",
                                    backgroundColor: "#fff"
                                }}
                            >
                                <textarea
                                    value={row.relationshipGoal}
                                    onChange={(e) =>
                                        handleMentorRowChange(index, "relationshipGoal", e.target.value)
                                    }
                                    placeholder="Describe the primary goal of this mentoring relationship"
                                    rows={3}
                                    style={{
                                        width: "100%",
                                        minHeight: "96px",
                                        border: "1px solid #cfcfcf",
                                        borderRadius: "6px",
                                        padding: "0.75rem",
                                        font: "inherit",
                                        resize: "vertical",
                                        boxSizing: "border-box",
                                        backgroundColor: "#fff"
                                    }}
                                />
                            </td>

                            <td
                                style={{
                                    border: "1px solid #d9d9d9",
                                    padding: "0.75rem",
                                    verticalAlign: "top",
                                    backgroundColor: "#fff"
                                }}
                            >
                                {mentorRows.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeMentorRow(index)}
                                        style={{
                                            backgroundColor: "#fff7ed",
                                            color: "#c2410c",
                                            border: "1px solid #fdba74",
                                            borderRadius: "6px",
                                            padding: "0.45rem 0.75rem",
                                            fontSize: "0.95rem",
                                            cursor: "pointer",
                                            whiteSpace: "nowrap"
                                        }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                <tr>
                        <td
                            colSpan={3}
                            style={{
                                border: "1px solid #d9d9d9",
                                padding: "0.85rem",
                                backgroundColor: "#fafafa",
                                textAlign: "center"
                            }}
                        >
                            <button
                                type="button"
                                onClick={addMentorRow}
                                style={{
                                    background: "none",
                                    border: "1px dashed #cfcfcf",
                                    borderRadius: "6px",
                                    padding: "0.65rem 1rem",
                                    font: "inherit",
                                    color: "#555",
                                    cursor: "pointer",
                                    minWidth: "160px"
                                }}
                            >
                                + Add Row
                            </button>
                        </td>
                    </tr>
                
                </tbody>
            </table>
        </div>

       <p style={{ lineHeight: "1.7", marginBottom: "1.25rem" }}>
            Now that you've identified some mentors, feel free to move on to generating a
            detailed report that explores how you've used your GenomeIDP!
        </p>
       
        <button
            className="ResultsButton"
            onClick={() => setActiveView("certificate")}
        >
            My Certificate
        </button>
    </>
)}

{activeView === "certificate" && (
    <>
        <h2>My Progress Report</h2>

        <p style={{ lineHeight: "1.7", marginBottom: "1.25rem" }}>
            You are welcome to keep your GenomeIDP report online – it will be here for as 
            long as you want, and you can come back to it, update it, add goals, projects, 
            and members of your mentoring team anytime. However, there are a few great reasons 
            to download and print your report out:
        </p>

        <ul style={{ paddingLeft: "1.5rem", lineHeight: "1.7" }}>
            <li style={{ marginBottom: "0.9rem" }}>
                One or more of your mentors may benefit from seeing specific elements of 
                your GenomeIDP report, especially if you’re asking for advice on which specific 
                skills to improve on. It can also be useful to have a quick guide to your top 
                skills, interests, and values on hand.
            </li>
            <li style={{ marginBottom: "0.9rem" }}>
                You may want to print out your goals in calendar form and post them 
                somewhere you can see them while you work to remind you about upcoming deadlines.
            </li>
            <li>
                The GenomeIDP report may be a suitable submission to satisfy the requirements 
                of one of your courses.
            </li>
        </ul>

        <button
            className="ResultsButton"
            onClick={() => setActiveView("prepareReport")}
            style={{ marginTop: "1.5rem" }}
        >
            Prepare My Report
        </button>
    </>
)}

{activeView === "prepareReport" && (
        <PrepareReport
            reportSections={reportSections}
            reportName={reportName}
            setReportName={setReportName}
            handleReportSectionToggle={handleReportSectionToggle}
            handleReportGroupToggle={handleReportGroupToggle}
            onGenerateReport={() => setActiveView("viewReport")}
        />
)}

{activeView === "viewReport" && (
    <ViewReport
    	selectedReportData={selectedReportData}
    	reportName={reportName}
    	reportSections={reportSections}
	/>
)}

{activeView === "viewCertificate" && (
  <ViewCertificate 
  	reportName={reportName} 
  	completedAreas={completedAreas}
  	/>
)}

{activeView === "notes" && <MyNotes notes={notes} setNotes={setNotes} />}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Results;
