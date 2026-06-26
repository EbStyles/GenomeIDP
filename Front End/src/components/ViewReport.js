import React, { useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import image from "../GenomeIDP_Logo.png";

const ViewReport = ({ selectedReportData, reportName, reportSections }) => {
    const reportRef = useRef(null);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    
    const sectionBoxStyle = {
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1.5rem",
        marginBottom: "2rem",
        backgroundColor: "#fafafa",
    };

   const handleDownloadReport = async () => {
    const element = reportRef.current;
    if (!element) {
        alert("Report content not found.");
        return;
    }

    setIsExportingPdf(true);

    setTimeout(async () => {
        const updatedElement = reportRef.current;
        if (!updatedElement) {
            alert("Report content not found.");
            setIsExportingPdf(false);
            return;
        }

        updatedElement.classList.add("pdf-export-mode");

        const opt = {
            margin: 0.5,
            filename: `${reportName || "GenomeIDP-Report"}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
            pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        };

        try {
            await html2pdf().set(opt).from(updatedElement).save();
        } catch (error) {
            console.error("PDF generation failed:", error);
            alert("PDF generation failed. Check the console.");
        } finally {
            updatedElement.classList.remove("pdf-export-mode");
            setIsExportingPdf(false);
        }
    }, 0);
};
    
    const hasSkillsData =
        (reportSections.topSkills &&
            selectedReportData.selfAssessments?.topSkills?.length > 0) ||
        (reportSections.weakestSkills &&
            selectedReportData.selfAssessments?.weakestSkills?.length > 0);

    const hasInterestsData =
        (reportSections.topInterests &&
            selectedReportData.selfAssessments?.topInterests?.length > 0) ||
        (reportSections.activitiesToAvoid &&
            selectedReportData.selfAssessments?.activitiesToAvoid?.length > 0);

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", lineHeight: "1.7" }}>
            <h2>My GenomeIDP Report</h2>

            {reportName && (
                <p style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                    <strong>Prepared for:</strong> {reportName}
                </p>
            )}
            
            <div style={{ marginBottom: "2.0rem" }}>
   				<button className="ResultsButton" onClick={handleDownloadReport}>Download Report</button>
			</div>

             <div
    			ref={reportRef}
    			className="report-export-root"
   				style={{
        			fontSize: isExportingPdf ? "0.8rem" : "1rem",
        			lineHeight: isExportingPdf ? "1.45" : "1.7",
    			}}
			>
    			{isExportingPdf && (
    				<div
        				className="pdf-report-header"
        				style={{ marginBottom: "1.5rem", textAlign: "left" }}
    				>
        				<img
            				src={image}
            				alt="GenomeIDP logo"
            				className="pdf-report-logo"
            				style={{ maxWidth: "220px", height: "auto", margin: "0 auto" }}
        				/>
    				</div>
				)}

    			{(!selectedReportData || Object.keys(selectedReportData).length === 0) && (
        			<p>
            			No sections selected. Go back to <em>Prepare My Report</em> and select items to include.
        			</p>
    			)}

            {reportSections.name && reportName && (
    			<div style={{ marginBottom: "2rem" }}>
        			<h3>Name</h3>
        			<p>{reportName}</p>
    			</div>
			)}
            
            {/* Values box */}
            {(reportSections.topValues &&
    			selectedReportData.selfAssessments?.topValues?.length > 0) ||
    			(reportSections.completeValuesSummary &&
        			selectedReportData.selfAssessments?.completeValuesSummary?.length > 0) ? (
    			<div className="report-section-box" style={sectionBoxStyle}>
        			<h3>Values</h3>

        			{reportSections.topValues &&
            			selectedReportData.selfAssessments?.topValues?.length > 0 && (
                			<>
                    			<h4 style={{ marginTop: "0.75rem" }}>Top Values (score = 5)</h4>
                    			<ul>
                        			{selectedReportData.selfAssessments.topValues.map((item, index) => (
                            			<li key={index}>
                                			<strong>{item.name}</strong> — {item.prompt}
                            			</li>
                        			))}
                    			</ul>
                			</>
            			)}

        	{reportSections.completeValuesSummary &&
            	selectedReportData.selfAssessments?.completeValuesSummary?.length > 0 && (
                <>
                    <h4 style={{ marginTop: "1.25rem" }}>Values assessment summary</h4>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            marginTop: "0.5rem",
                            fontSize: isExportingPdf ? "0.8rem" : "0.95rem",
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.35rem" }}>
                                    Item
                                </th>
                                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.35rem", whiteSpace: "nowrap" }}>
                                    Score (1–5)
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedReportData.selfAssessments.completeValuesSummary.map(
                                (item, index) => (
                                    <tr key={index}>
                                        <td style={{ borderBottom: "1px solid #eee", padding: "0.35rem" }}>
                                            {item.question}
                                        </td>
                                        <td style={{ borderBottom: "1px solid #eee", padding: "0.35rem" }}>
                                            {item.score}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </>
            )}
    </div>
) : null}

            {/* Skills box (top + weakest) */}
            {hasSkillsData ||
    (reportSections.completeSkillsSummary &&
        selectedReportData.selfAssessments?.completeSkillsSummary?.length > 0) ? (
    <div className="report-section-box" style={sectionBoxStyle}>
        <h3>Skills</h3>

        {reportSections.topSkills &&
            selectedReportData.selfAssessments?.topSkills?.length > 0 && (
                <>
                    <h4 style={{ marginTop: "0.75rem" }}>Top Skills (score = 5)</h4>
                    <ul>
                        {selectedReportData.selfAssessments.topSkills.map((item, index) => (
                            <li key={index}>{item.question}</li>
                        ))}
                    </ul>
                </>
            )}

        {reportSections.weakestSkills &&
            selectedReportData.selfAssessments?.weakestSkills?.length > 0 && (
                <>
                    <h4 style={{ marginTop: "0.75rem" }}>Weakest Skills Areas (score = 1)</h4>
                    <ul>
                        {selectedReportData.selfAssessments.weakestSkills.map((item, index) => (
                            <li key={index}>{item.question}</li>
                        ))}
                    </ul>
                </>
            )}

        {reportSections.completeSkillsSummary &&
            selectedReportData.selfAssessments?.completeSkillsSummary?.length > 0 && (
                <>
                    <h4 style={{ marginTop: "1.25rem" }}>Skills assessment summary</h4>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            marginTop: "0.5rem",
                            fontSize: isExportingPdf ? "0.8rem" : "0.95rem",
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.35rem" }}>
                                    Item
                                </th>
                                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.35rem", whiteSpace: "nowrap" }}>
                                    Score (1–5)
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedReportData.selfAssessments.completeSkillsSummary.map(
                                (item, index) => (
                                    <tr key={index}>
                                        <td style={{ borderBottom: "1px solid #eee", padding: "0.35rem" }}>
                                            {item.question}
                                        </td>
                                        <td style={{ borderBottom: "1px solid #eee", padding: "0.35rem" }}>
                                            {item.score}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </>
            )}
    </div>
) : null}

            {/* Interests + activities box */}
            {hasInterestsData ||
    (reportSections.completeInterestsSummary &&
        selectedReportData.selfAssessments?.completeInterestsSummary?.length > 0) ? (
    <div className="report-section-box" style={sectionBoxStyle}>
        <h3>Interests</h3>

        {reportSections.topInterests &&
            selectedReportData.selfAssessments?.topInterests?.length > 0 && (
                <>
                    <h4 style={{ marginTop: "0.75rem" }}>Top Interests (score = 5)</h4>
                    <ul>
                        {selectedReportData.selfAssessments.topInterests.map((item, index) => (
                            <li key={index}>{item.question}</li>
                        ))}
                    </ul>
                </>
            )}

        {reportSections.activitiesToAvoid &&
            selectedReportData.selfAssessments?.activitiesToAvoid?.length > 0 && (
                <>
                    <h4 style={{ marginTop: "0.75rem" }}>Activities to Avoid (score = 1)</h4>
                    <ul>
                        {selectedReportData.selfAssessments.activitiesToAvoid.map(
                            (item, index) => (
                                <li key={index}>{item.question}</li>
                            )
                        )}
                    </ul>
                </>
            )}

        {reportSections.completeInterestsSummary &&
            selectedReportData.selfAssessments?.completeInterestsSummary?.length > 0 && (
                <>
                    <h4 style={{ marginTop: "1.0rem" }}>Interests assessment summary</h4>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            marginTop: "0.25rem",
                            fontSize: isExportingPdf ? "0.8rem" : "0.95rem",
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.35rem" }}>
                                    Item
                                </th>
                                <th style={{ borderBottom: "1px solid #ccc", textAlign: "left", padding: "0.35rem", whiteSpace: "nowrap"  }}>
                                    Score (1–5)
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedReportData.selfAssessments.completeInterestsSummary.map(
                                (item, index) => (
                                    <tr key={index}>
                                        <td style={{ borderBottom: "1px solid #eee", padding: "0.35rem" }}>
                                            {item.question}
                                        </td>
                                        <td style={{ borderBottom: "1px solid #eee", padding: "0.35rem" }}>
                                            {item.score}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </>
            )}
    </div>
) : null}

			            {reportSections.careerMatches &&
                selectedReportData.careerMatches?.length > 0 && (
                    <div className="report-section-box" style={sectionBoxStyle}>
                        <h3>Career Matches</h3>
                        <p style={{ marginTop: "0.5rem", marginBottom: "0.75rem" }}>
                            These are the careers that best match your self‑assessment scores.
                        </p>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                marginTop: "0.5rem",
                                fontSize: isExportingPdf ? "0.8rem" : "0.95rem",
                            }}
                        >
                            <thead>
                                <tr>
                                    <th
                                        style={{
                                            borderBottom: "1px solid #ccc",
                                            textAlign: "left",
                                            padding: "0.35rem",
                                        }}
                                    >
                                        Career
                                    </th>
                                    <th
                                        style={{
                                            borderBottom: "1px solid #ccc",
                                            textAlign: "left",
                                            padding: "0.35rem",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Rank (1 = best)
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedReportData.careerMatches.map((match, index) => (
                                    <tr key={index}>
                                        <td
    										style={{
        										borderBottom: "1px solid #eee",
        										padding: "0.35rem",
    										}}
										>
    										{match.Profession}
										</td>
										<td
    										style={{
        										borderBottom: "1px solid #eee",
        										padding: "0.35rem",
        										whiteSpace: "nowrap",
    										}}
										>
    										{match.Rank != null && match.Rank !== ""
    											? match.Rank
    											: "--"}
										</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

				{reportSections.notes && selectedReportData.notes?.trim() && (
    				<div className="report-section-box" style={sectionBoxStyle}>
        				<h3>Notes</h3>
        				<p
            				style={{
                			marginTop: "0.5rem",
                			whiteSpace: "pre-wrap",
            				}}
        					>
            				{selectedReportData.notes}
        				</p>
    				</div>
				)}

				{selectedReportData.alternateRealities &&
    (selectedReportData.alternateRealities.path1 ||
        selectedReportData.alternateRealities.path2) && (
        <div className="report-section-box" style={sectionBoxStyle}>
            <h3>Alternate Realities</h3>

            {selectedReportData.alternateRealities.path1 && (
                <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
                    <h4>Path 1</h4>

                    {selectedReportData.alternateRealities.path1.goal && (
                        <p>
                            <strong>Goal:</strong>{" "}
                            {selectedReportData.alternateRealities.path1.goal}
                        </p>
                    )}

                    {selectedReportData.alternateRealities.path1.careerPath && (
                        <p>
                            <strong>Career Path:</strong>{" "}
                            {selectedReportData.alternateRealities.path1.careerPath}
                        </p>
                    )}

                    {selectedReportData.alternateRealities.path1.transitionSteps && (
                        <div style={{ marginTop: "0.5rem" }}>
                            <strong>Transition Steps:</strong>
                            <p style={{ marginTop: "0.25rem", whiteSpace: "pre-wrap" }}>
                                {selectedReportData.alternateRealities.path1.transitionSteps}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {selectedReportData.alternateRealities.path2 && (
                <div style={{ marginTop: "1rem" }}>
                    <h4>Path 2</h4>

                    {selectedReportData.alternateRealities.path2.goal && (
                        <p>
                            <strong>Goal:</strong>{" "}
                            {selectedReportData.alternateRealities.path2.goal}
                        </p>
                    )}

                    {selectedReportData.alternateRealities.path2.careerPath && (
                        <p>
                            <strong>Career Path:</strong>{" "}
                            {selectedReportData.alternateRealities.path2.careerPath}
                        </p>
                    )}

                    {selectedReportData.alternateRealities.path2.transitionSteps && (
                        <div style={{ marginTop: "0.5rem" }}>
                            <strong>Transition Steps:</strong>
                            <p style={{ marginTop: "0.25rem", whiteSpace: "pre-wrap" }}>
                                {selectedReportData.alternateRealities.path2.transitionSteps}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )}
			{selectedReportData.smartGoals &&
    (selectedReportData.smartGoals.careerAdvancement ||
        selectedReportData.smartGoals.skillBuilding ||
        selectedReportData.smartGoals.currentProgram) && (
        <div className="report-section-box" style={sectionBoxStyle}>
            <h3>SMART Goals</h3>

            {/* Career Advancement */}
            {selectedReportData.smartGoals.careerAdvancement && (
                <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
                    <h4>Career Advancement</h4>

                    {selectedReportData.smartGoals.careerAdvancement.rows?.length >
                        0 && (
                        <>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    marginTop: "0.5rem",
                                    fontSize: isExportingPdf ? "0.8rem" : "0.95rem",
                                    tableLayout: "fixed",
                                }}
                            >
                                <colgroup>
                                    <col style={{ width: "20%" }} />
                                    <col style={{ width: "32%" }} />
                                    <col style={{ width: "16%" }} />
                                    <col style={{ width: "16%" }} />
                                    <col style={{ width: "16%" }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                textAlign: "left",
                                                padding: "0.35rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Goal
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                textAlign: "left",
                                                padding: "0.35rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            SMART Goal
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                textAlign: "left",
                                                padding: "0.35rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Recurrence
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                textAlign: "left",
                                                padding: "0.35rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Start Date
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                textAlign: "left",
                                                padding: "0.35rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            End Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedReportData.smartGoals.careerAdvancement.rows.map(
                                        (row, index) => (
                                            <tr key={index}>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #eee",
                                                        padding: "0.35rem",
                                                    }}
                                                >
                                                    {row.goal || "--"}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #eee",
                                                        padding: "0.35rem",
                                                    }}
                                                >
                                                    {row.smartGoal || "--"}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #eee",
                                                        padding: "0.35rem",
                                                        
                                                    }}
                                                >
                                                    {row.recurrence || "--"}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #eee",
                                                        padding: "0.35rem",
                                                        
                                                    }}
                                                >
                                                    {row.startDate || "--"}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #eee",
                                                        padding: "0.35rem",
                                                        
                                                    }}
                                                >
                                                    {row.endDate || "--"}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}

            {/* Skill Building */}
            {selectedReportData.smartGoals.skillBuilding && (
                <div style={{ marginTop: "1rem", marginBottom: "1.5rem" }}>
                    <h4>Skill Building</h4>

                    {selectedReportData.smartGoals.skillBuilding.rows?.length >
                        0 && (
                        <>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    marginTop: "0.5rem",
                                   	fontSize: isExportingPdf ? "0.8rem" : "0.95rem",
                                    tableLayout: "fixed",
                                }}
                            >
                                <colgroup>
                                    <col style={{ width: "20%" }} />
                                    <col style={{ width: "32%" }} />
                                    <col style={{ width: "16%" }} />
                                    <col style={{ width: "16%" }} />
                                    <col style={{ width: "16%" }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                textAlign: "left",
                                                padding: "0.35rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Goal
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                textAlign: "left",
                                                padding: "0.35rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            SMART Goal
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                textAlign: "left",
                                                padding: "0.35rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Recurrence
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                textAlign: "left",
                                                padding: "0.35rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Start Date
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                textAlign: "left",
                                                padding: "0.35rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            End Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedReportData.smartGoals.skillBuilding.rows.map(
                                        (row, index) => (
                                            <tr key={index}>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #eee",
                                                        padding: "0.35rem",
                                                    }}
                                                >
                                                    {row.goal || "--"}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #eee",
                                                        padding: "0.35rem",
                                                    }}
                                                >
                                                    {row.smartGoal || "--"}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #eee",
                                                        padding: "0.35rem",
                                                        
                                                    }}
                                                >
                                                    {row.recurrence || "--"}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #eee",
                                                        padding: "0.35rem",
                                                        
                                                    }}
                                                >
                                                    {row.startDate || "--"}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #eee",
                                                        padding: "0.35rem",
                                                        
                                                    }}
                                                >
                                                    {row.endDate || "--"}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}

            {/* Current Program */}
            {selectedReportData.smartGoals.currentProgram && (
                <div style={{ marginTop: "1rem" }}>
                    <h4>Current Program</h4>

                    {selectedReportData.smartGoals.currentProgram.rows?.length >
                        0 && (
                        <>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    marginTop: "0.5rem",
                                    fontSize: isExportingPdf ? "0.8rem" : "0.95rem",
                                    tableLayout: "fixed",
                                }}
                            >
                                <colgroup>
                                    <col style={{ width: "20%" }} />
                                    <col style={{ width: "32%" }} />
                                    <col style={{ width: "16%" }} />
                                    <col style={{ width: "16%" }} />
                                    <col style={{ width: "16%" }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                textAlign: "left",
                                                padding: "0.35rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Goal
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                textAlign: "left",
                                                padding: "0.35rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            SMART Goal
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                textAlign: "left",
                                                padding: "0.35rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Recurrence
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                textAlign: "left",
                                                padding: "0.35rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            Start Date
                                        </th>
                                        <th
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                                textAlign: "left",
                                                padding: "0.35rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            End Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedReportData.smartGoals.currentProgram.rows.map(
                                        (row, index) => (
                                            <tr key={index}>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #eee",
                                                        padding: "0.35rem",
                                                    }}
                                                >
                                                    {row.goal || "--"}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #eee",
                                                        padding: "0.35rem",
                                                    }}
                                                >
                                                    {row.smartGoal || "--"}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #eee",
                                                        padding: "0.35rem",
                                                    }}
                                                >
                                                    {row.recurrence || "--"}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #eee",
                                                        padding: "0.35rem",
                                                        
                                                    }}
                                                >
                                                    {row.startDate || "--"}
                                                </td>
                                                <td
                                                    style={{
                                                        borderBottom:
                                                            "1px solid #eee",
                                                        padding: "0.35rem",
                                                        
                                                    }}
                                                >
                                                    {row.endDate || "--"}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}
        </div>
    )}
    
    		{reportSections.mentoringTeam &&
    selectedReportData.mentoringTeam?.length > 0 && (
        <div className="report-section-box" style={sectionBoxStyle}>
            <h3>Mentoring Team</h3>
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: "0.75rem",
                    fontSize: isExportingPdf ? "0.8rem" : "0.95rem",
                }}
            >
                <thead>
                    <tr>
                        <th
                            style={{
                                borderBottom: "1px solid #ccc",
                                textAlign: "left",
                                padding: "0.35rem",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Mentor Name
                        </th>
                        <th
                            style={{
                                borderBottom: "1px solid #ccc",
                                textAlign: "left",
                                padding: "0.35rem",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Relationship Goal
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {selectedReportData.mentoringTeam.map((row, index) => (
                        <tr key={index}>
                            <td
                                style={{
                                    borderBottom: "1px solid #eee",
                                    padding: "0.35rem",
                                }}
                            >
                                {row.mentorName?.trim() ? row.mentorName : "--"}
                            </td>
                            <td
                                style={{
                                    borderBottom: "1px solid #eee",
                                    padding: "0.35rem",
                                }}
                            >
                                {row.relationshipGoal?.trim()
                                    ? row.relationshipGoal
                                    : "--"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )}

            {/* Sections will be added here one by one */}
            
            </div>
        
        	<div style={{ marginTop: "2rem", marginBottom: "1rem" }}>
   				<button className="ResultsButton" onClick={handleDownloadReport}>Download Report</button>
			</div>
        
        </div>
        
        	
    );
};

export default ViewReport;