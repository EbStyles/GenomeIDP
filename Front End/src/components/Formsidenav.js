import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// SideNav — Survey form side navigation
//
// FIX (Phase 1, Bug #2): Added sequential progression locking.
//   - On first pass (surveyComplete === false), a subsection is only clickable
//     if it has already been completed OR is the very next section in sequence.
//   - Once the survey has been submitted and results generated
//     (surveyComplete === true), all sections are freely navigable.
//   - Locked items are visually marked with a lock icon and a "locked" CSS
//     class so users understand why they cannot click.
//
// FIX (Phase 1, Bug #3): Fixed hover outline overflow.
//   - The .subsection-item hover state previously used an outline that rendered
//     outside the sidenav boundary. This is now handled by constraining the
//     hover effect inside the sidenav using overflow: hidden on .sidenav and
//     switching from outline to background-color + border-left highlight.
//   - See the companion CSS changes in App.css (Phase 1 patch block).
//
// Props:
//   activeSection   {string}   - Key of the currently displayed section
//   onSectionChange {function} - Callback to change the active section
//   completedSections {Set}    - Set of section keys the user has finished
//   surveyComplete  {boolean}  - True once the full survey has been submitted
// ─────────────────────────────────────────────────────────────────────────────

const SideNav = ({ activeSection, onSectionChange, completedSections = new Set(), surveyComplete = false }) => {

    // Flat ordered list of all navigable subsection keys, in survey order.
    // This mirrors the allSections order used in Form.js so locking logic is
    // always in sync with the form's own progression.
    const orderedSubsections = [
        "Discipline-specific conceptual knowledge",
        "Discipline-specific practical skills",
        "Communication skills",
        "Professionalism",
        "Ethical and responsible conduct",
        "Discipline Relevant Interests",
        "Professional Communication Interests",
        "Professional Management Interests",
        "Career Values",
    ];

    const sections = [
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

    // ─────────────────────────────────────────────────────────────────────────
    // isAccessible
    // Determines whether a given subsection may be clicked.
    //
    // Rules (first-pass only — bypassed when surveyComplete is true):
    //   1. A section is accessible if it has been completed already.
    //   2. A section is accessible if it is the immediate next incomplete
    //      section in the ordered list (the "next in line" rule).
    //   3. All other sections are locked.
    //
    // @param {string} subsectionKey
    // @returns {boolean}
    // ─────────────────────────────────────────────────────────────────────────
    const isAccessible = (subsectionKey) => {
        if (surveyComplete) return true;
        if (completedSections.has(subsectionKey)) return true;

        // Find the first subsection in order that has not yet been completed.
        const nextIncomplete = orderedSubsections.find(
            (s) => !completedSections.has(s)
        );
        return subsectionKey === nextIncomplete;
    };

    const handleClick = (sub) => {
        if (!isAccessible(sub)) return; // Silently block locked sections
        onSectionChange(sub);
    };

    return (
        <nav className="sidenav">
            <ul className="navlist">
                {sections.map((section, sectionIndex) => (
                    <li key={sectionIndex}>
                       <div
                            className={`section-title ${activeSection === section.name ? "active" : ""}`}
                            onClick={() => onSectionChange(section.name)}
                            style={{ cursor: "pointer" }}
                        >
                            <img className="section-icon" src={sectionIcons[section.name]} alt="icon" />
                            {section.name}
                        </div>
                        <ul className="subsection-list">
                            {section.subsections.map((sub, subIndex) => {
                                const accessible = isAccessible(sub);
                                const isActive = activeSection === sub;
                                const isDone = completedSections.has(sub);

                                return (
                                    <li
                                        key={subIndex}
                                        className={[
                                            "subsection-item",
                                            isActive ? "active" : "",
                                            !accessible ? "locked" : "",
                                            isDone && !isActive ? "completed" : "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                        onClick={() => handleClick(sub)}
                                        title={
                                            !accessible
                                                ? "Complete the previous sections first"
                                                : sub
                                        }
                                        aria-disabled={!accessible}
                                    >
                                        {/* Lock icon shown only for inaccessible sections on first pass */}
                                        {!accessible && !surveyComplete && (
                                            <span className="lock-icon" aria-hidden="true">🔒 </span>
                                        )}
                                        {/* Checkmark shown for completed (non-active) sections */}
                                        {isDone && !isActive && accessible && (
                                            <span className="done-icon" aria-hidden="true">✓ </span>
                                        )}
                                        {sub}
                                    </li>
                                );
                            })}
                        </ul>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default SideNav;
