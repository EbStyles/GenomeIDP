// ─────────────────────────────────────────────────────────────────────────────
// Resultssidenav
// Left-hand navigation for the Results page.
//
// Structure:
//   - "Self Reflect" accordion header: expands/collapses the full survey
//     section tree (Skills + subsections, Interests + subsections, Values).
//     Clicking any subsection navigates back to that section in the form.
//   - "My Results" accordion: intro + assessment result views.
//   - "My Plan" accordion: planning-oriented pages that users may revisit
//     repeatedly as they move through later stages.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { useHistory } from "react-router-dom";

const RSideNav = ({ activeView, onViewChange }) => {
  const [selfReflectOpen, setSelfReflectOpen] = useState(false);
  const [myResultsOpen, setMyResultsOpen] = useState(true);
  const [myPlanOpen, setMyPlanOpen] = useState(true);
  const [myCertificateOpen, setMyCertificateOpen] = useState(true);
  const history = useHistory();

  const surveySections = [
    {
      name: "Skills",
      subsections: [
        "Discipline-specific conceptual knowledge",
        "Discipline-specific practical skills",
        "Communication skills",
        "Professionalism",
        "Ethical and responsible conduct",
      ],
    },
    {
      name: "Interests",
      subsections: [
        "Discipline Relevant Interests",
        "Professional Communication Interests",
        "Professional Management Interests",
      ],
    },
    {
      name: "Values",
      subsections: ["Career Values"],
    },
  ];

  const sectionIcons = {
    Skills: "Skills_icon.png.png",
    Interests: "Interests_icon.png.png",
    Values: "TopChoice.png",
  };

  const navigateToSection = (section) => {
    history.push("/form");
    sessionStorage.setItem("genomeIdpReturnSection", section);
  };

  const myPlanViews = [
  	"planIntro", 
  	"notes", 
  	"connectIntro", 
  	"connectWorkshops", 
  	"connectReachOut", 
  	"informationalInterviewQuestions", 
  	"alternateRealitiesIntro",
  	"smartGoalsIntro",
  	"findMentors"
  	];

  return (
    <nav className="Rsidenav">
      <ul className="navlist">
        {/* ── Self Reflect accordion ── */}
        <li>
          <div
            className="section-title"
            onClick={() => setSelfReflectOpen(!selfReflectOpen)}
            style={{ cursor: "pointer", textAlign: "left", paddingLeft: "0.25rem" }}
          >
            {selfReflectOpen ? "▾" : "▸"} My Assessments
          </div>

          {selfReflectOpen && (
            <ul className="subsection-list">
              {surveySections.map((section, sectionIndex) => (
                <li key={sectionIndex}>
                  <div
                    className="section-title"
                    onClick={() => navigateToSection(section.name)}
                    style={{ cursor: "pointer", fontSize: "1.1rem", paddingLeft: "0.5rem" }}
                  >
                    <img className="section-icon" src={sectionIcons[section.name]} alt="icon" />
                    {section.name}
                  </div>
                  <ul className="subsection-list">
                    {section.subsections.map((sub, subIndex) => (
                      <li
                        key={subIndex}
                        className="subsection-item"
                        onClick={() => navigateToSection(sub)}
                      >
                        {sub}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </li>

        {/* ── My Results accordion ── */}
        <li>
          <div
            className={`section-title ${activeView === "intro" ? "active" : ""}`}
            onClick={() => {
              setMyResultsOpen(!myResultsOpen);
              onViewChange("intro");
            }}
            style={{ cursor: "pointer", textAlign: "left", paddingLeft: "0.25rem" }}
          >
            {myResultsOpen ? "▾" : "▸"} My Results
          </div>

          {myResultsOpen && (
            <ul className="subsection-list">
              <li>
                <button
                  className={`subsection-item ${activeView === "careers" ? "active" : ""}`}
                  onClick={() => onViewChange("careers")}
                >
                  Career Matches
                </button>
              </li>
              <li>
                <button
                  className={`subsection-item ${activeView === "values" ? "active" : ""}`}
                  onClick={() => onViewChange("values")}
                >
                  Values
                </button>
              </li>
            </ul>
          )}
        </li>

        {/* ── My Plan accordion ── */}
        <li>
          <div
            className={`section-title ${myPlanViews.includes(activeView) ? "active" : ""}`}
            onClick={() => {
              setMyPlanOpen(!myPlanOpen);
              onViewChange("planIntro");
            }}
            style={{ cursor: "pointer", textAlign: "left", paddingLeft: "0.25rem" }}
          >
            {myPlanOpen ? "▾" : "▸"} My Plan
          </div>

          {myPlanOpen && (
  <ul className="subsection-list">
    <li>
      <button
        className={`subsection-item ${activeView === "notes" ? "active" : ""}`}
        onClick={() => onViewChange("notes")}
      >
        Notes
      </button>
    </li>

    <li>
      <button
        className={`subsection-item ${
          activeView === "connectIntro" ||
          activeView === "connectWorkshops" ||
          activeView === "connectReachOut"
            ? "active"
            : ""
        }`}
        onClick={() => onViewChange("connectIntro")}
      >
        Connect
      </button>
    </li>

    <li>
      <button
        className={`subsection-item ${
          activeView === "alternateRealitiesIntro" ? "active" : ""
        }`}
        onClick={() => onViewChange("alternateRealitiesIntro")}
      >
        Alternate Realities
      </button>
    </li>

    <li>
      <button
        className={`subsection-item ${
          activeView === "smartGoalsIntro" ? "active" : ""
        }`}
        onClick={() => onViewChange("smartGoalsIntro")}
      >
        SMART Goals
      </button>
    </li>
    
    <li>
      <button
        className={`subsection-item ${
          activeView === "findMentors" ? "active" : ""
        }`}
        onClick={() => onViewChange("findMentors")}
      >
        Find Mentors
      </button>
    </li>
    
  </ul>
)}
        </li>
        
        
                        {/* ── My Progress accordion ── */}
        <li>
          <div
            className={`section-title top-level-heading ${
              activeView === "certificate" || 
              activeView === "prepareReport" ||
              activeView === "viewReport" ||
              activeView === "viewCertificate"
              ? "active" 
              : ""
            }`}
            onClick={() => {
  				setMyCertificateOpen(!myCertificateOpen);
  				onViewChange("certificate");
				}}
            style={{ cursor: "pointer", textAlign: "left", paddingLeft: "0.25rem" }}
          >
            {myCertificateOpen ? "▾" : "▸"} My Progress
          </div>

          {myCertificateOpen && (
            <ul className="subsection-list">
              <li>
                <button
                  className={`subsection-item ${activeView === "prepareReport" ? "active" : ""}`}
                  onClick={() => onViewChange("prepareReport")}
                >
                  Prepare My Report
                </button>
              </li>
              <li>
                <button
                  className={`subsection-item ${activeView === "viewReport" ? "active" : ""}`}
                  onClick={() => onViewChange("viewReport")}
                >
                  View My Report
                </button>
              </li>
              <li>
  				<button
    				className={`subsection-item ${activeView === "viewCertificate" ? "active" : ""}`}
    				onClick={() => onViewChange("viewCertificate")}
  				>
    				View My Certificate
  				</button>
				</li>
            </ul>
          )}
        </li>
        </ul>
    </nav>
  );
};

export default RSideNav;