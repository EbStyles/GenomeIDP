import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import NotesPromptFooter from "./NotesPromptFooter";

console.log("🚨 CAREER RESOURCE FILE LOADED");

const CareerResourcesPage = () => {
    const { careerName } = useParams();
    const [resources, setResources] = useState(null);
    const history = useHistory();

    console.log("🧠 CareerResourcesPage component rendered");

    useEffect(() => {
        const decodedCareerName = decodeURIComponent(careerName).trim();
        console.log("📛 careerName from URL param:", careerName);
        console.log("✅ Decoded career name:", decodedCareerName);

        const normalize = (str) =>
            str
                .toLowerCase()
                .replace(/%20/g, " ")
                .replace(/[–—]/g, "-")
                .replace(/\s+/g, " ")
                .trim();

        fetch("/data/careerResources.json")
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch resource JSON: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                const resourceTypeMap = {
                    "Further Education - Clinical": "Further_Clinical_Education",
                    "Further Education - Research": "Further_Research-based_Education",
                    "Further Education - Research-based": "Further_Research-based_Education",

                    "Science Writing, Communication, Education": "Science_Writing_Communication_or_Education",
                    "Science Writing / Communication / Education": "Science_Writing_Communication_or_Education",

                    "Business of Science / Medicine": "Business_of_Science_or_Medicine",

                    "Bioinformatics - Clinical / Research": "Bioinformatics_for_the_Clinic_or_for_Research",
                    "Bioinformatics - Industry": "Bioinformatics_for_Industry",

                    "Wet Lab Work - Clinical / Research": "Wet_Lab_Work_for_the_Clinic_or_for_Research",
                    "Wet Lab Work - Academic": "Wet_Lab_Work_for_the_Clinic_or_for_Research",
                    "Wet Lab Work - Industry": "Wet_Lab_Work_for_Industry",

                    "Variant Analysis - Clinical Diagnostics": "Variant_Analysis_for_Clinical_Diagnostics",
                    "Variant Analysis - Diagnostic": "Variant_Analysis_for_Clinical_Diagnostics",
                    "Variant Analysis - Research": "Variant_Analysis_for_Research",

                    "Lab / Hospital / Academic Administrative role": "Lab_/_Hospital_/_or_Academic_Administrative role",
                    "Lab / Hospital / Academic Administrative Role": "Lab_/_Hospital_/_or_Academic_Administrative role",

                    "Sales & Marketing": "Sales_and_Marketing",
                    "Sales and Marketing": "Sales_and_Marketing",

                    "Consulting": "Consulting",
                    "Policy": "Policy"
                };

                let resourceKey = resourceTypeMap[decodedCareerName] || data[decodedCareerName];

                if (!resourceKey) {
                    const normalizedName = normalize(decodedCareerName);

                    resourceKey = Object.keys(data).find((key) => {
                        const readableKey = key
                            .replace(/_\/_/g, " / ")
                            .replace(/_/g, " ")
                            .replace(/\bor\b/g, "/")
                            .replace(/\bfor the\b/g, "-")
                            .replace(/\bfor\b/g, "-")
                            .replace(/\s+/g, " ")
                            .trim();

                        return normalize(readableKey) === normalizedName;
                    });
                }

                console.log("🔑 Computed resourceKey:", resourceKey);

                if (resourceKey && data[resourceKey]) {
                    console.log("✅ Resource found for key:", resourceKey);
                    setResources(data[resourceKey]);
                } else {
                    console.warn("❌ No resources found for decodedCareerName:", decodedCareerName);
                    console.warn("📂 Available keys:", Object.keys(data));
                    setResources(null);
                }
            })
            .catch((err) => {
                console.error("💥 Error loading resources:", err);
                setResources(null);
            });
    }, [careerName]);

    return (
        <div className="CareerResourcesPage">
            <div className="ResultsCard CareerResourcesCard">
                <h2>Resources for {decodeURIComponent(careerName)}</h2>

                <div className="blurb CareerResourcesBlurb">
                    <p>
                        Explore curated reading and professional organizations related to{" "}
                        <strong>{decodeURIComponent(careerName)}</strong>.
                    </p>
                    <p>
                        These links are meant to help you learn more about common roles,
                        career paths, expectations, and communities connected to this field.
                    </p>
                </div>

                <button
                    className="BackButton"
                    onClick={() => history.goBack()}
                    style={{ marginBottom: "1.5rem" }}
                >
                    ← Back to Career Details
                </button>

                {!resources ? (
                    <p className="CareerResourcesEmpty">
                        No resources available for this career path.
                    </p>
                ) : (
                    <div className="CareerResourcesSections">
                        {resources.read?.length > 0 && (
                            <section className="CareerResourceBlock">
                                <h3>Read</h3>
                                <ul>
                                    {resources.read.map((item, idx) => (
                                        <li key={idx}>
                                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                                                {item.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {resources.professionalSocieties?.length > 0 && (
                            <section className="CareerResourceBlock">
                                <h3>Professional Societies</h3>
                                <ul>
                                    {resources.professionalSocieties.map((item, idx) => (
                                        <li key={idx}>
                                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                                                {item.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                )}
                <NotesPromptFooter />
        </div>
    </div>
);
};

export default CareerResourcesPage;