import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";

const QUICK_TAGS = ["Career Matches", "Values", "Resources", "Planning", "Networking", "Informational Interviews"];

const MyNotesPage = ({ notes, setNotes }) => {
  const { user } = useAuthContext();
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Loading notes...");
  const [lastUpdated, setLastUpdated] = useState("Not loaded yet");
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user?.token) return;

      try {
        const response = await fetch("/api/notes", {
          headers: {
            "Authorization": `Bearer ${user.token}`,
          },
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || "Failed to load notes");
        }

        setNotes(json.content || "");
        setSaveStatus("Saved");
        setLastUpdated(
          json.updatedAt
            ? `Last updated ${new Date(json.updatedAt).toLocaleString()}`
            : "No notes added yet"
        );
        setIsInitialLoadComplete(true);
      } catch (error) {
        console.error("Failed to load notes:", error);
        setSaveStatus("Unable to load notes");
        setLastUpdated("Please try again");
        setIsInitialLoadComplete(true);
      }
    };

    fetchNotes();
  }, [user]);

  useEffect(() => {
    if (!isInitialLoadComplete || !user?.token) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus("Saving...");
    setLastUpdated("Saving changes...");

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/notes", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`,
          },
          body: JSON.stringify({ content: notes }),
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || "Failed to save notes");
        }

        setSaveStatus("Saved");
        setLastUpdated(`Last updated ${new Date(json.updatedAt).toLocaleString()}`);
      } catch (error) {
        console.error("Failed to save notes:", error);
        setSaveStatus("Save failed");
        setLastUpdated("Your latest changes could not be saved");
      }
    }, 800);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, isInitialLoadComplete, user]);

  const handleQuickTagClick = (tag) => {
    const prefix = `\n\n${tag}\n`;
    setNotes((prev) => {
      if (!prev.trim()) return `${tag}\n`;
      return `${prev}${prefix}`;
    });
  };

  const helperText = useMemo(() => {
    return "Want to keep your notes organized? Use the buttons below to add a short heading so you remember what this note relates to.";
  }, []);

  return (
    <>
      <h2>My Notes</h2>

      <div className="CareerResourcesBlurb">
        <p>
          Use this space to collect reflections, action items, useful links,
          and questions from across GenomeIDP - it's a place to return to as
          you work through your career matches, think about your core values,
          explore resources, network, and make concrete plans that will help
          you get where you want to go in your career.
        </p>
      </div>

      <div className="NotesHelperRow">
        <p className="NotesHelperText">{helperText}</p>

        <div className="NotesQuickTags">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className="NotesQuickTag"
              onClick={() => handleQuickTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="NotesEditorBlock">
        <label htmlFor="my-notes-textarea" className="NotesLabel">
          Notes
        </label>

        <textarea
          id="my-notes-textarea"
          className="NotesTextarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write reflections, questions, next steps, or useful links here..."
        />
      </div>

      <div className="NotesStatusRow">
        <p className="NotesSaveStatus">{saveStatus}</p>
        <p className="NotesLastUpdated">{lastUpdated}</p>
      </div>
    </>
  );
};

export default MyNotesPage;