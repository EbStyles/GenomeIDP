import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import image from "../GenomeIDP_Logo.png";
import mogenLogo from "../MoGen_Logo.png";

const ViewCertificate = ({ reportName, completedAreas = [] }) => {
  const today = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const certificateRef = useRef(null);

  const handleDownloadCertificate = () => {
    const element = certificateRef.current;

    if (!element) {
      alert("Certificate content not found.");
      return;
    }

    const opt = {
      margin: 0.5,
      filename: `${reportName || "GenomeIDP-Certificate"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
      pagebreak: { mode: ["css", "legacy"] },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .catch((error) => {
        console.error("PDF generation failed:", error);
        alert("Certificate download failed. Check the console.");
      });
  };

  return (
    <>
      <div
        ref={certificateRef}
        className="CertificateOuter"
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "1.5rem",
        }}
      >
        <div
          className="CertificateFrame"
          style={{
            backgroundColor: "white",
            border: "8px solid #2f5d8a",
            padding: "1rem",
            boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
          }}
        >
          <div
            className="CertificateInner"
            style={{
              border: "2px solid #2f5d8a",
              padding: "3.5rem 3rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <div>
              <img
                src={image}
                alt="GenomeIDP logo"
                className="CertificateGenomeLogo"
                style={{
                  width: "200px",
                  height: "auto",
                  margin: "0 auto 2rem auto",
                }}
              />

              <h1
                className="CertificateTitle"
                style={{
                  fontSize: "2.4rem",
                  marginTop: "0.5rem",
                  marginBottom: "2.0rem",
                  fontFamily: "Georgia, serif",
                  color: "#2f5d8a",
                }}
              >
                Certificate of Completion
              </h1>

              <p
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "1rem",
                  color: "#4f6480",
                }}
              >
                This certifies that
              </p>

              <div
                className="CertificateName"
                style={{
                  fontSize: "2.2rem",
                  fontWeight: "700",
                  marginBottom: "1.0rem",
                  color: "#2f5d8a",
                }}
              >
                {reportName || "Respondent Name"}
              </div>

              <p
                className="CertificateText"
                style={{
                  maxWidth: "700px",
                  margin: "0 auto",
                  fontSize: "1.05rem",
                  lineHeight: "1.8",
                  color: "#4f6480",
                }}
              >
                has successfully completed all of the following components of
                GenomeIDP: {completedAreas.join(", ")}.
              </p>
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "#5f7ea3",
                  marginBottom: "0.75rem",
                }}
              >
                Awarded on {today}
              </p>

              <div
                style={{
                  marginTop: "0.75rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <img
                  src={mogenLogo}
                  alt="MoGen departmental logo"
                  className="CertificateMogenLogo"
                  style={{
                    width: "140px",
                    height: "auto",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <button
          className="ResultsButton"
          onClick={handleDownloadCertificate}
          type="button"
        >
          Download Certificate
        </button>
      </div>
    </>
  );
};

export default ViewCertificate;