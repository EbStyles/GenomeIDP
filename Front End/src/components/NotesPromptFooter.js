

import { useHistory } from "react-router-dom";

const NotesPromptFooter = () => {
    const history = useHistory();

    return (
        <div className="CareerResourcesNotesFooter">
            <h3>Want to save your thoughts?</h3>
            <p>
                As you explore these resources, you can capture reflections,
                ideas, and next steps in your Notes page under My Plan.
            </p>
            <button
                className="CareerResourcesNotesButton"
                onClick={() => history.push("/results?view=notes")}
            >
                Go to Notes
            </button>
        </div>
    );
};

export default NotesPromptFooter;