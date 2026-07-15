import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SideNav from "./Formsidenav";
import questions from "../data/questions.json";
import image from "../GenomeIDP_Logo.png";
import { useAuthContext } from "../hooks/useAuthContext";
import API_BASE_URL from '../config';

// ─────────────────────────────────────────────────────────────────────────────
// Form
// The main multi-section self-assessment survey page.
//
// FIX (Phase 1, Bug #2): Sequential progression locking.
//   - Added `completedSections` state (a Set) that tracks which subsections
//     the user has finished answering.
//   - Added `surveyComplete` state (boolean). Set to true when the user has
//     previously submitted the full survey (detected by finding a saved form
//     with responses covering all subsections on load).
//   - Both are passed as props to SideNav, which uses them to decide which
//     items are clickable.
//   - A section is marked complete in `completedSections` when the user
//     successfully calls nextPage() with all questions answered.
//   - On initial load, previously completed sections are inferred from the
//     saved backend data and pre-populated into completedSections.
// ─────────────────────────────────────────────────────────────────────────────

const Form = () => {
    const sections = questions.sections.map(section => section.key);
    const [activeSection, setActiveSection] = useState(sections[0]);
    const [answers, setAnswers] = useState({});
    const [labels, setLabels] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [showPopupError, setShowPopupError] = useState(false);
    const [isNextPageLocked, setIsNextPageLocked] = useState(false);
    const [tempAnswers, setTempAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [matchResults, setMatchResults] = useState(null);

    // ── Phase 1 Fix: section-locking state ───────────────────────────────────
    // completedSections: tracks which subsections have been fully answered.
    // Persisted as a regular Set; re-derived from backend data on mount.
    const [completedSections, setCompletedSections] = useState(new Set());

    // surveyComplete: true if the user has already submitted the full survey.
    // Unlocks free navigation across all sections.
    const [surveyComplete, setSurveyComplete] = useState(false);
    // ─────────────────────────────────────────────────────────────────────────

    const formRef = useRef(null);
    const user = useAuthContext();

    // Expected question counts per subsection (source of truth for completion check)
    const subsectionQuestions = {
        "Discipline-specific conceptual knowledge": 16,
        "Discipline-specific practical skills": 22,
        "Communication skills": 22,
        "Professionalism": 26,
        "Ethical and responsible conduct": 9,
        "Discipline Relevant Interests": 31,
        "Professional Communication Interests": 35,
        "Professional Management Interests": 10,
        "Career Values": 37,
    };

    const allSections = [
        "Skills",
        "Discipline-specific conceptual knowledge",
        "Discipline-specific practical skills",
        "Communication skills",
        "Professionalism",
        "Ethical and responsible conduct",
        "Interests",
        "Discipline Relevant Interests",
        "Professional Communication Interests",
        "Professional Management Interests",
        "Values",
        "Career Values",
    ];

    const mainSections = ["Skills", "Values", "Interests"];

    const valueLabels = {
        Skills: [
            "Highly deficient",
            "Deficient",
            "Developing",
            "Proficient",
            "Highly proficient",
        ],
        Interests: [
            "Highly unenjoyable",
            "Unenjoyable",
            "Neutral",
            "Enjoyable",
            "Highly enjoyable",
        ],
        Values: [
            "Not important at all",
            "Minimally important",
            "Somewhat important",
            "Very important",
            "Absolutely essential",
        ],
    };

    // ─────────────────────────────────────────────────────────────────────────
    // On mount: fetch saved answers from the backend.
    // Infers completed sections and survey-complete status from saved data.
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchSavedAnswers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/form/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.user.token}`
                    }
                });

                if (!response.ok) {
                    console.error("Failed to fetch saved form data.");
                    return;
                }

                const data = await response.json();
                if (!data?.responses) return;

                const parsedAnswers = {};
                data.responses.forEach(section => {
                    parsedAnswers[section.section] = Object.fromEntries(
                        Object.entries(section.answers)
                    );
                });

                setAnswers(parsedAnswers);
                setTempAnswers(parsedAnswers);

                // ── Phase 1 Fix: derive which sections are already complete ──
                // A section is considered complete if the saved answer count
                // matches the expected question count for that subsection.
                const alreadyCompleted = new Set();
                for (const [sectionKey, sectionAnswers] of Object.entries(parsedAnswers)) {
                    const expected = subsectionQuestions[sectionKey];
                    if (expected && Object.keys(sectionAnswers).length >= expected) {
                        alreadyCompleted.add(sectionKey);
                    }
                }
                setCompletedSections(alreadyCompleted);

                // If ALL subsections have data, the survey was previously completed,
                // so unlock free navigation.
                const allSubsections = Object.keys(subsectionQuestions);
                const allDone = allSubsections.every(s => alreadyCompleted.has(s));
                if (allDone) setSurveyComplete(true);
                // ─────────────────────────────────────────────────────────────

                // Build and restore label state
                const parsedLabels = {};
                for (const [sectionName, sectionAnswers] of Object.entries(parsedAnswers)) {
                    let category;
                    if ([
                        "Discipline-specific conceptual knowledge",
                        "Discipline-specific practical skills",
                        "Communication skills",
                        "Professionalism",
                        "Ethical and responsible conduct"
                    ].includes(sectionName)) category = "Skills";
                    else if ([
                        "Interests", "Discipline Relevant Interests",
                        "Professional Communication Interests", "Professional Management Interests"
                    ].includes(sectionName)) category = "Interests";
                    else if (["Values", "Career Values"].includes(sectionName)) category = "Values";
                    else continue;

                    parsedLabels[sectionName] = {};
                    for (const [index, numericValue] of Object.entries(sectionAnswers)) {
                        const num = Number(numericValue);
                        parsedLabels[sectionName][index] = valueLabels[category][num - 1] || "Neutral";
                    }
                }
                setLabels(parsedLabels);

                // Scroll to last answered position
                const answeredSections = Object.keys(parsedAnswers);
                if (answeredSections.length > 0) {
                    const lastSection = answeredSections[answeredSections.length - 1];
                    const lastIndices = Object.keys(parsedAnswers[lastSection]);
                    const lastIndex = Math.max(...lastIndices.map(Number));
                    setActiveSection(lastSection);
                    setTimeout(() => {
                        const el = document.getElementById(`${lastSection}-${lastIndex}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 500);
                }

                console.log("✅ Parsed answers from backend:", parsedAnswers);

            } catch (err) {
                console.error("Error fetching saved form:", err);
            }
        };

        if (user?.user?.token) {
            fetchSavedAnswers();
        }

        // If returning from the Results page, jump to the requested section
        const returnSection = sessionStorage.getItem("genomeIdpReturnSection");
        if (returnSection) {
            sessionStorage.removeItem("genomeIdpReturnSection");
            setActiveSection(returnSection);
        }
    }, [user?.user?.token]);

    useEffect(() => {
        console.log("Updated answers:", answers);
    }, [answers]);

    const handleSectionChange = (section) => {
        setActiveSection(section);
    };

    const scrollToNextQuestion = (index) => {
        const nextQuestion = document.querySelector(`.question:nth-child(${index + 2})`);
        if (nextQuestion) {
            nextQuestion.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => {
                nextQuestion.style.transition = "opacity 1s ease-in-out";
                nextQuestion.style.opacity = "1";
            }, 500);
        }
    };

    const scrollToTop = () => {
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handleTempChange = (section, index, value) => {
        setTempAnswers((prevTemp) => ({
            ...prevTemp,
            [section]: { ...prevTemp[section], [index]: value },
        }));
    };

    const currentIndex = allSections.indexOf(activeSection);

    const handleFinalChange = (section, index, value) => {
        let category;
        if (currentIndex < 6) category = "Skills";
        else if (currentIndex < 10) category = "Interests";
        else category = "Values";

        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [section]: { ...prevAnswers[section], [index]: value },
        }));
        setLabels((prevLabels) => ({
            ...prevLabels,
            [section]: {
                ...prevLabels[section],
                [index]: valueLabels[category][value - 1] || "Neutral",
            },
        }));

        // Scroll to next question after any intentional answer selection
        scrollToNextQuestion(index);
			}
    const prevPage = () => {
        const prevIndex = (currentIndex - 1 + allSections.length) % allSections.length;
        setActiveSection(allSections[prevIndex]);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // nextPage
    // Advances the form to the next section after validating completion.
    //
    // FIX (Phase 1, Bug #2): On successful validation + save, the current
    // subsection is added to `completedSections`, enabling the next section
    // in the sidenav.
    // ─────────────────────────────────────────────────────────────────────────
    const nextPage = async () => {
        if (isNextPageLocked) return;

        setIsNextPageLocked(true);
        setTimeout(() => setIsNextPageLocked(false), 2000);

        if (!mainSections.includes(activeSection)) {
            const totalQuestions = subsectionQuestions[activeSection] || 0;
            const answeredQuestions = answers[activeSection]
                ? Object.keys(answers[activeSection]).length
                : 0;

            if (answeredQuestions < totalQuestions) {
                setShowPopupError(true);
                setTimeout(() => {
                    const popupElement = document.querySelector('.popupError');
                    popupElement?.classList.add('fade-out');
                    setTimeout(() => setShowPopupError(false), 1000);
                }, 1000);
                return;
            }

            if (answeredQuestions === totalQuestions) {
                await saveProgress();

                // ── Phase 1 Fix: mark this section as complete ──────────────
                setCompletedSections(prev => new Set(prev).add(activeSection));
                // ─────────────────────────────────────────────────────────────
            }

            scrollToTop();
        }

        const nextIndex = (currentIndex + 1) % allSections.length;
        setActiveSection(allSections[nextIndex]);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // submitResponses
    // Validates full completion, saves, calls the matching API, and redirects
    // to the results page.
    //
    // FIX (Phase 1, Bug #2): Sets `surveyComplete` to true on successful
    // submission, which unlocks free sidenav navigation if the user returns
    // to the form page.
    // ─────────────────────────────────────────────────────────────────────────
    const submitResponses = async () => {
        setIsSubmitting(true);

        const totalQuestionsExpected = Object.values(subsectionQuestions).reduce((a, b) => a + b, 0);
        const totalQuestionsAnswered = Object.values(answers).reduce(
            (sum, section) => sum + Object.keys(section || {}).length, 0
        );

        if (totalQuestionsAnswered < totalQuestionsExpected) {
            console.error("Form is incomplete.");
            setShowPopupError(true);
            setTimeout(() => {
                const popupElement = document.querySelector('.popupError');
                popupElement?.classList.add('fade-out');
                setTimeout(() => setShowPopupError(false), 1000);
            }, 1000);
            setIsSubmitting(false);
            return;
        }

        try {
            await saveProgress(false);

            // ── Phase 1 Fix: mark all sections complete + unlock navigation ─
            const allSubsectionKeys = new Set(Object.keys(subsectionQuestions));
            setCompletedSections(allSubsectionKeys);
            setSurveyComplete(true);
            // ─────────────────────────────────────────────────────────────────

            const matchResponse = await fetch(`${API_BASE_URL}/api/match/`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${user.user.token}` }
            });

            if (!matchResponse.ok) throw new Error("Failed to fetch match results");

            const matchData = await matchResponse.json();
            const matchedArray = Array.isArray(matchData.matches) ? matchData.matches : matchData;

            setMatchResults(matchData);

            const allCareers = [
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

            const sortedMatches = matchedArray.sort((a, b) => b.Count - a.Count);
            const uniqueCounts = [...new Set(sortedMatches.map(d => d.Count))].sort((a, b) => b - a);
            const countToRank = {};
            uniqueCounts.forEach((count, index) => { countToRank[count] = index + 1; });

            const rankedResults = allCareers.map(prof => {
                const match = sortedMatches.find(d => d.Profession === prof);
                return { Profession: prof, Rank: match ? countToRank[match.Count] : null };
            });

            window.location.href = `/results?matches=${encodeURIComponent(JSON.stringify(rankedResults))}`;

        } catch (error) {
            console.error("Error submitting responses:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderContent = () => {
        const section = questions.sections.find(section => section.key === activeSection);
        if (!section) return null;

        if (section.type === "blurb") {
            return (
                <div className="blurb">
                    {section.content.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                    <button className="continue-btn" onClick={nextPage}>Got it</button>
                </div>
            );
        }

        let sectionValueLabels;
        if (currentIndex < 6) sectionValueLabels = valueLabels["Skills"];
        else if (currentIndex < 10) sectionValueLabels = valueLabels["Interests"];
        else sectionValueLabels = valueLabels["Values"];

        return (
            <form>
                {section.content.map((question, index) => (
                    <div key={index} className="question">
                        <span className="q_index">
                            Question {index + 1} out of {subsectionQuestions[activeSection]}
                        </span>
                        <div className="q"><h2>{question}</h2></div>
                        <label htmlFor={`${activeSection}-${index}`}>
                            {labels[activeSection]?.[index] || "Slide the Button"}
                        </label>
                        <div>
                            <input
                                id={`${activeSection}-${index}`}
                                name={`${activeSection}-${index}`}
                                type="range"
                                min="1"
                                max="5"
                                value={tempAnswers[activeSection]?.[index] ?? answers[activeSection]?.[index] ?? 3}
                                onChange={(e) => handleTempChange(activeSection, index, e.target.value)}
                                onMouseUp={(e) => handleFinalChange(activeSection, index, e.target.value)}
                                className="slider"
                            />
                            <div className="answers">
                                {sectionValueLabels.map((label, idx) => (
                                    <span key={idx} className="range-label">{label}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </form>
        );
    };

    const getBackgroundImage = () => {
        if (currentIndex < 6) return "url('/Survey_SkillsBanner.jpg')";
        if (currentIndex < 10) return "url('/Survey_InterestsBanner.jpg')";
        return "url('/Survey_ValuesBanner.jpg')";
    };

    const saveProgress = async (shouldExit = false) => {
        const formPayload = {
            responses: Object.keys(answers).map(sectionKey => ({
                section: sectionKey,
                answers: answers[sectionKey],
            }))
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/form/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.user.token}`
                },
                body: JSON.stringify(formPayload),
            });

            if (response.ok) {
                if (shouldExit) {
                    window.location.href = "/";
                    return;
                }
                setShowPopup(true);
                setTimeout(() => {
                    document.querySelector('.popup')?.classList.add('fade-out');
                    setTimeout(() => setShowPopup(false), 1000);
                }, 1000);
            } else {
                console.error('Error saving progress:', response.statusText);
            }
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    if (!user || !user.user) return <div>Loading...</div>;

    if (isSubmitting) {
        return (
            <div className="matchingAnimation">
                <h2>Matching your GenomeIDP responses...</h2>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="FormPage">
            <div className="FormNav">
                <img src={image} alt="GenomeIDP Logo" />
                Welcome {user.user.username} to your GenomeIDP! <br />
                <Link to="/" onClick={() => saveProgress(true)} className="save-exit-link">
                    Save and Exit
                </Link>
            </div>
            <div className="FormPageContainer">
                <div className="SideNav">
                    {/* Phase 1 Fix: pass completedSections and surveyComplete to SideNav */}
                    <SideNav
                        activeSection={activeSection}
                        onSectionChange={handleSectionChange}
                        completedSections={completedSections}
                        surveyComplete={surveyComplete}
                    />
                </div>
                <div className="Form">
                    <div
                        className="formHeader"
                        style={{
                            backgroundImage: getBackgroundImage(),
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            height: "125px",
                            borderRadius: "10px",
                            width: "100%",
                            marginLeft: "0%",
                            marginBottom: "20px",
                            padding: "20px",
                            boxSizing: "border-box",
                            fontWeight: 600,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <em className="q_header">{activeSection}</em>
                    </div>
                    <div className="questions" ref={formRef}>{renderContent()}</div>
                    {showPopup && <div className="popup">Progress has been saved!</div>}
                    {showPopupError && (
                        <div className="popupError">Please answer all questions.</div>
                    )}
                    {!mainSections.includes(activeSection) && (
                        <div className="formButtons">
                            <button onClick={prevPage}>Go back</button>
                            {activeSection === "Career Values" ? (
                                <button onClick={submitResponses}>Submit Results</button>
                            ) : (
                                <button onClick={nextPage}>Next</button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Form;
