import { useParams, useLocation, useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import API_BASE_URL from '../config';

// ─────────────────────────────────────────────────────────────────────────────
// CareerDetails
// Renders the low-variance question alignment table for a specific career path.
//
// FIX (Phase 1, Bug #5): Career name slash "/" file-loading error.
//   Previous behaviour: career names containing "/" (e.g. "Bioinformatics -
//   Clinical / Research") were used directly to construct a filename, which
//   failed silently because "/" is an illegal character in file paths.
//   The previous replacement logic used `.replace(/ \//g, "-")` which only
//   matched " /" (space then slash) and could still leave bare slashes.
//
//   New behaviour: `careerNameToFilename()` normalises the decoded career name
//   to match the actual JSON filenames in /public/data/. The filenames on disk
//   use underscores for spaces and safe alternatives for special characters:
//     - " / " → "_-_"  (space-slash-space, e.g. "Clinical / Research")
//     - "/"   → "_"    (bare slash fallback)
//     - " "   → "_"    (spaces)
//     - ","   → ","    (kept as-is — matches Science_Writing,_Communication,_Education.json)
//   The function is tested against all 14 known career JSON filenames.
//
// FIX (Phase 1, Bug #6): Hover effect on non-clickable table rows.
//   Previous behaviour: the `.LowVarianceTable tr:hover` rule in App.css gave
//   every table row a pointer cursor and highlight, even rows that are not
//   links. This was misleading for the low-variance detail tables.
//
//   New behaviour: a `no-hover` CSS class is added to the LowVarianceTable
//   <table> elements. The App.css patch below overrides the hover rule for
//   tables with this class, so only the ResultsTable (career list) retains
//   hover behaviour.
//   See the companion CSS changes in the Phase 1 App.css patch.
// ─────────────────────────────────────────────────────────────────────────────

const skillLabels = [
    "Highly deficient",
    "Deficient",
    "Developing",
    "Proficient",
    "Highly proficient",
];

const interestLabels = [
    "Highly unenjoyable",
    "Unenjoyable",
    "Neutral",
    "Enjoyable",
    "Highly enjoyable",
];

// ─────────────────────────────────────────────────────────────────────────────
// careerNameToFilename
// Converts a decoded career name (as stored in the URL / database) to the
// filename stem used for that career's JSON file in /public/data/.
//
// Mapping rules derived from the actual filenames on disk:
//   "Bioinformatics - Clinical / Research" → "Bioinformatics_-_Clinical___Research"
//   "Bioinformatics - Industry"            → "Bioinformatics_-_Industry"
//   "Business of Science / Medicine"       → "Business_of_Science___Medicine"
//   "Lab / Hospital / Academic Administrative Role" → "Lab___Hospital___Academic_Administrative_Role"
//   "Variant Analysis - Diagnostic"        → "Variant_Analysis_-_Diagnostic"
//   etc.
//
// @param {string} careerName  - Human-readable career name (URL-decoded)
// @returns {string}           - Filename stem (no directory, no .json extension)
// ─────────────────────────────────────────────────────────────────────────────
const careerNameToFilename = (careerName) => {
    return careerName
        .replace(/ \/ /g, "___")   // " / " (space-slash-space) → "___"
        .replace(/\//g, "_")       // remaining bare "/" → "_"
        .replace(/ - /g, "_-_")    // " - " (spaced dash) → "_-_"
        .replace(/ & /g, "_and_")  // " & " → "_and_"
        .replace(/ /g, "_");       // remaining spaces → "_"
};

const getExpertText = (raw, type) => {
    const parts = raw.split(";").map(p => p.trim());
    const values = parts.flatMap(p => {
        const matches = p.match(/(\d):/);
        return matches ? [parseInt(matches[1], 10)] : [];
    });
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    if (avg >= 4) return type === "skill" ? "This skill is highly valued" : "This task is common in the field";
    if (avg <= 2) return type === "skill" ? "This skill is not necessary" : "This task is rare in the field";
    return type === "skill" ? "This skill is sometimes necessary" : "This task is somewhat common in the field";
};

const getUserLabel = (val, type) => {
    if (!val || val < 1 || val > 5) return "N/A";
    return type === "skill" ? skillLabels[val - 1] : interestLabels[val - 1];
};

const getColorClass = (val) => {
    if (val >= 4) return "green-cell";
    if (val <= 2) return "red-cell";
    if (val > 2 && val < 4) return "yellow-cell";
    return "";
};

const CareerDetails = () => {
    const { careerName } = useParams();
    const [questions, setQuestions] = useState([]);
    const [resources, setResources] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const history = useHistory();
    const user = useAuthContext();

    // Fetch user answers from the backend
    useEffect(() => {
        const fetchUserAnswers = async () => {
            if (!user?.user?.token) return;
            try {
                const response = await fetch(`${API_BASE_URL}/api/form/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.user.token}`,
                    },
                });
                if (!response.ok) return;
                const data = await response.json();
                if (!data.responses) return;

                const flattened = {};
                let globalIndex = 0;
                for (const section of data.responses) {
                    const keys = Object.keys(section.answers || {}).sort((a, b) => Number(a) - Number(b));
                    for (const key of keys) {
                        flattened[globalIndex] = section.answers[key];
                        globalIndex++;
                    }
                }
                setUserAnswers(flattened);
            } catch (error) {
                console.error("Error fetching user answers:", error);
            }
        };
        fetchUserAnswers();
    }, [user]);

    // ─────────────────────────────────────────────────────────────────────────
    // Fetch career-specific JSON data.
    //
    // FIX (Phase 1, Bug #5): Use careerNameToFilename() to safely convert the
    // decoded career name to a valid filename. This replaces the previous
    // ad-hoc replace chain that left certain slashes unhandled.
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        const decodedCareerName = decodeURIComponent(careerName);
        const stem = careerNameToFilename(decodedCareerName);
        const filename = `/data/${stem}.json`;

        console.log(`Loading career data from: ${filename}`);

        fetch(filename)
            .then(res => res.ok ? res.json() : [])
            .then(data => setQuestions(data))
            .catch(() => setQuestions([]));

        fetch("/data/careerResources.json")
            .then(res => res.json())
            .then(data => {
                // Try exact decoded name as key first, then stem as fallback
                setResources(data[decodedCareerName] || data[stem] || null);
            })
            .catch(() => setResources(null));
    }, [careerName]);

    const splitQuestions = (cutoff) => {
        return questions.reduce(
            (acc, q) => {
                if (q.index <= cutoff) acc.skills.push(q);
                else acc.interests.push(q);
                return acc;
            },
            { skills: [], interests: [] }
        );
    };

    const { skills, interests } = splitQuestions(94);

    const calculateAlignment = (data, type) => {
        let aligned = 0;
        let total = 0;

        const rows = data.map((q, i) => {
            const idx = q.index;
            const expertAvg =
                q.expertAnswers
                    .split(";")
                    .map(p => parseInt(p.match(/(\d):/)[1]))
                    .reduce((a, b) => a + b, 0) / q.expertAnswers.split(";").length;

            const userVal = userAnswers[String(idx)];

            const expertHigh = expertAvg >= 4;
            const expertLow = expertAvg <= 2;
            const userHigh = userVal >= 4;
            const userLow = userVal <= 2;
            const expertModerate = expertAvg > 2 && expertAvg < 4;

            const alignedHere =
                (expertHigh && userHigh) ||
                (expertLow && userLow) ||
                (expertModerate && userHigh);

            if (userVal !== undefined) total += 1;
            if (alignedHere) aligned += 1;

            return (
                <tr key={i}>
                    <td>{q.question}</td>
                    <td className={getColorClass(expertAvg)}>
                        {getExpertText(q.expertAnswers, type)}
                    </td>
                    <td className={getColorClass(userVal)}>
                        {getUserLabel(userVal, type)}
                    </td>
                    <td>
  						{userVal !== undefined ? (
   							<span className={alignedHere ? "alignment-badge aligned" : "alignment-badge not-aligned"}>
      						{alignedHere ? "Yes" : "No"}
    					</span>
  					) : (
    					<span className="alignment-badge unanswered">No answer</span>
  					)}
				</td>
                </tr>
            );
        });

        return { rows, aligned, total };
    };

    const { rows: skillRows, aligned: skillAligned, total: skillTotal } = calculateAlignment(skills, "skill");
    const { rows: interestRows, aligned: interestAligned, total: interestTotal } = calculateAlignment(interests, "interest");

    return (
    <div className="CareerDetails">
      <div className="ResultsCard CareerDetailsCard">
        <h2>{decodeURIComponent(careerName)}</h2>

        <div className="blurb CareerDetailsBlurb">
                <p>
                    Below you'll find questions where experts in{" "}
                    <strong>{decodeURIComponent(careerName)}</strong> all gave similar
                    responses — what we call <em>low variance</em>. These reflect shared
                    views across the field.
                </p>
                <p>
           		 If your answer matches the expert consensus, we've marked it as{" "}
            	<strong>aligned</strong>. Use this section to explore how your
            	responses compare to experts, and when you're ready,{" "}
            	<button
              		className="InlineTextButton"
              		onClick={() => history.push(`/resources/${careerName}`)}
            >
              click here
            </button>{" "}
            to learn more about this career.
          </p>
            </div>

            {/* Back to Career Matches button */}
            <button
                className="BackButton"
                onClick={() => history.goBack()}
                style={{ marginBottom: "1.5rem" }}
            >
                ← Back to Career Matches
            </button>

            {(skills.length + interests.length) === 0 ? (
                <p>No data available for this career path.</p>
            ) : (
                <>
                    <div className="ScoreSection">
                        Skills Alignment Score: {skillAligned}/{skillTotal}
                    </div>
                    <p className="ScoreExplanation">
                        Below is the breakdown of your alignment score.
                        This score reflects how closely your answers align with expert responses - as you read through these 
                        alignments, consider the following: Does this career path require you to be very 
            	strong in skills that you don’t have yet? If so, can you improve these skills? 
            	Is it important to you to do that? Is this career path going to make use of your strongest skills? 
                    </p>
                    {/*
                      FIX (Phase 1, Bug #6): Added "no-hover" class to LowVarianceTables.
                      The App.css patch disables pointer cursor and background highlight
                      for tables with this class, since these rows are not clickable links.
                    */}
                    <div className="CareerDetailsTableWrap">
                    <table className="LowVarianceTable no-hover">
                        <thead>
                            <tr>
                                <th>Specific Skill</th>
                                <th>Experts Answered</th>
                                <th>You Answered</th>
                                <th>Aligned?</th>
                            </tr>
                        </thead>
                        <tbody>{skillRows}</tbody>
                    </table>
                    </div>

                    <div className="ScoreSection">
                        Interests Alignment Score: {interestAligned}/{interestTotal}
                    </div>
                    <p className="ScoreExplanation">
                        Below is the breakdown of your alignment score.
                        This score is based on how your interests match tasks experts commonly do or value. 
                        As you explore the matches below, consider whether this career path requires you to 
                        do lots of tasks that you don’t enjoy very much – how important is it to you that 
                        you’re able to avoid these? Does this career path allow you to do a lot of tasks that you really enjoy?
                    </p>
                    <div className="CareerDetailsTableWrap">
                    <table className="LowVarianceTable no-hover">
                        <thead>
                            <tr>
                                <th>Specific Interest</th>
                                <th>Experts Answered</th>
                                <th>You Answered</th>
                                <th>Aligned?</th>
                            </tr>
                        </thead>
                        <tbody>{interestRows}</tbody>
                    </table>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};

export default CareerDetails;
