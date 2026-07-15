import React from "react";

const PrepareReport = ({
    reportSections,
    reportName,
    setReportName,
    handleReportSectionToggle,
    handleReportGroupToggle,
    onGenerateReport,
}) => {
    
    return (
        <>
            <h2>Prepare My Report</h2>

            <p style={{ lineHeight: "1.7", marginBottom: "0.5rem" }}>
                Many congratulations - you’ve completed GenomeIDP! You’ve assessed your skills, 
      identified some careers that might be worth pursuing, set goals, and built up a 
      supportive mentoring team – you’ve done a lot of work to get here! </p>
      
            <p style={{ lineHeight: "1.7", marginBottom: "1.25rem" }}>
			Select elements from GenomeIDP to include in your report: </p>
           

            <div style={{ lineHeight: "1.8" }}>
                <div style={{ marginBottom: "0.75rem" }}>
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={reportSections.name}
                            onChange={() => handleReportSectionToggle("name")}
                        />
                        <span>Name</span>
                    </label>

                    {reportSections.name && (
                        <div 
                        	className="PrepareReportNameField"
                        	style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.35rem" }}>
                                Name to include on the report
                            </label>
                            <input
                                type="text"
                                className="PrepareReportNameInput"
                                value={reportName}
                                onChange={(e) => setReportName(e.target.value)}
                                placeholder="Enter name"
                                style={{
                                    width: "100%",
                                    maxWidth: "360px",
                                    padding: "0.5rem 0.75rem",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    fontSize: "1rem",
                                }}
                            />
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: "0.75rem" }}>
                    <label style={{ display: "block", marginBottom: "0.35rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.selfAssessments}
                            onChange={() =>
                                handleReportGroupToggle("selfAssessments", [
                                    "topValues",
                                    "topInterests",
                                    "topSkills",
                                    "weakestSkills",
                                    "activitiesToAvoid",
                                    "completeSkillsSummary",
                                    "completeInterestsSummary",
                                    "completeValuesSummary",
                                ])
                            }
                            style={{ marginRight: "0.5rem" }}
                        />
                        Self-assessments
                    </label>

                    <label style={{ display: "block", marginLeft: "1.5rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.topValues}
                            onChange={() => handleReportSectionToggle("topValues")}
                            style={{ marginRight: "0.5rem" }}
                        />
                        Top values (score = 5)
                    </label>

                    <label style={{ display: "block", marginLeft: "1.5rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.topInterests}
                            onChange={() => handleReportSectionToggle("topInterests")}
                            style={{ marginRight: "0.5rem" }}
                        />
                        Top interests (score = 5)
                    </label>

                    <label style={{ display: "block", marginLeft: "1.5rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.topSkills}
                            onChange={() => handleReportSectionToggle("topSkills")}
                            style={{ marginRight: "0.5rem" }}
                        />
                        Top skills (score = 5)
                    </label>

                    <label style={{ display: "block", marginLeft: "1.5rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.weakestSkills}
                            onChange={() => handleReportSectionToggle("weakestSkills")}
                            style={{ marginRight: "0.5rem" }}
                        />
                        Weakest skills areas (score = 1)
                    </label>

                    <label style={{ display: "block", marginLeft: "1.5rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.activitiesToAvoid}
                            onChange={() => handleReportSectionToggle("activitiesToAvoid")}
                            style={{ marginRight: "0.5rem" }}
                        />
                        Activities to avoid (score = 1)
                    </label>

                    <label style={{ display: "block", marginLeft: "1.5rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.completeSkillsSummary}
                            onChange={() => handleReportSectionToggle("completeSkillsSummary")}
                            style={{ marginRight: "0.5rem" }}
                        />
                        Complete skills assessment summary table
                    </label>

                    <label style={{ display: "block", marginLeft: "1.5rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.completeInterestsSummary}
                            onChange={() => handleReportSectionToggle("completeInterestsSummary")}
                            style={{ marginRight: "0.5rem" }}
                        />
                        Complete interests assessment summary table
                    </label>

                    <label style={{ display: "block", marginLeft: "1.5rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.completeValuesSummary}
                            onChange={() => handleReportSectionToggle("completeValuesSummary")}
                            style={{ marginRight: "0.5rem" }}
                        />
                        Complete values assessment summary table
                    </label>
                </div>

 					<label style={{ display: "block", marginBottom: "0.75rem" }}>    					
 						<input
        					type="checkbox"
        					checked={reportSections.careerMatches}
        					onChange={() => handleReportSectionToggle("careerMatches")}
        					style={{ marginRight: "0.5rem" }}
    					/>
   						Career Matches
				</label>
                
                
                
                <label style={{ display: "block", marginBottom: "0.75rem" }}>
                    <input
                        type="checkbox"
                        checked={reportSections.notes}
                        onChange={() => handleReportSectionToggle("notes")}
                        style={{ marginRight: "0.5rem" }}
                    />
                    Notes
                </label>

                <div style={{ marginBottom: "0.75rem" }}>
                    <label style={{ display: "block", marginBottom: "0.35rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.alternateRealities}
                            onChange={() =>
                                handleReportGroupToggle("alternateRealities", [
                                    "alternateRealitiesPath1",
                                    "alternateRealitiesPath2",
                                ])
                            }
                            style={{ marginRight: "0.5rem" }}
                        />
                        Alternate Realities
                    </label>

                    <label style={{ display: "block", marginLeft: "1.5rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.alternateRealitiesPath1}
                            onChange={() =>
                                handleReportSectionToggle("alternateRealitiesPath1")
                            }
                            style={{ marginRight: "0.5rem" }}
                        />
                        Path 1
                    </label>

                    <label style={{ display: "block", marginLeft: "1.5rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.alternateRealitiesPath2}
                            onChange={() =>
                                handleReportSectionToggle("alternateRealitiesPath2")
                            }
                            style={{ marginRight: "0.5rem" }}
                        />
                        Path 2
                    </label>
                </div>

                <div style={{ marginBottom: "0.75rem" }}>
                    <label style={{ display: "block", marginBottom: "0.35rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.smartGoals}
                            onChange={() =>
                                handleReportGroupToggle("smartGoals", [
                                    "smartGoalsCareerAdvancement",
                                    "smartGoalsSkillBuilding",
                                    "smartGoalsCurrentProgram",
                                ])
                            }
                            style={{ marginRight: "0.5rem" }}
                        />
                        SMART Goals
                    </label>

                    <label style={{ display: "block", marginLeft: "1.5rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.smartGoalsCareerAdvancement}
                            onChange={() =>
                                handleReportSectionToggle("smartGoalsCareerAdvancement")
                            }
                            style={{ marginRight: "0.5rem" }}
                        />
                        Career advancement
                    </label>

                    <label style={{ display: "block", marginLeft: "1.5rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.smartGoalsSkillBuilding}
                            onChange={() =>
                                handleReportSectionToggle("smartGoalsSkillBuilding")
                            }
                            style={{ marginRight: "0.5rem" }}
                        />
                        Skill building
                    </label>

                    <label style={{ display: "block", marginLeft: "1.5rem" }}>
                        <input
                            type="checkbox"
                            checked={reportSections.smartGoalsCurrentProgram}
                            onChange={() =>
                                handleReportSectionToggle("smartGoalsCurrentProgram")
                            }
                            style={{ marginRight: "0.5rem" }}
                        />
                        Current program
                    </label>
                </div>

                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                    <input
                        type="checkbox"
                        checked={reportSections.mentoringTeam}
                        onChange={() => handleReportSectionToggle("mentoringTeam")}
                        style={{ marginRight: "0.5rem" }}
                    />
                    Mentoring Team
                </label>
            </div>

            <div
    style={{
        marginTop: "2rem",
        display: "flex",
        justifyContent: "center",
    }}
>
        <button
        	className="ResultsButton"
            onClick={onGenerateReport}
             style={{ marginTop: "1.5rem" }}
        >
            Generate My Report
        </button>

</div>
         </>
    );
};

export default PrepareReport;