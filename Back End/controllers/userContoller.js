const Form = require("../models/formModel")
const mongoose = require('mongoose')




//get ONE user
// route for this comes with an id 

const getForm = async (req, res) => {

    const user = req.user._id

    if (!mongoose.Types.ObjectId.isValid(user)) {

        return res.status(404).json({ error: "no such data" })

    }


    const form = await Form.findOne({user})

    if (!form) {
        return res.status(404).json({ error: "No user data" })
    }

    res.status(200).json(form)

}



//New Form

const newForm = async (req, res) => {
    const { responses, alternateRealities } = req.body;
    const user = req.user._id;

    if (!user) {
        return res.status(400).json({ error: 'Missing user' });
    }

    if (responses && !Array.isArray(responses)) {
        return res.status(400).json({ error: 'Invalid responses format' });
    }

    try {
        const existingForm = await Form.findOne({ user });

        if (existingForm) {
            if (responses) {
                existingForm.responses = responses;
            }

            if (alternateRealities) {
                existingForm.alternateRealities = {
                    future1: {
                        goal: alternateRealities?.future1?.goal || "",
                        careerPath: alternateRealities?.future1?.careerPath || "",
                        transitionSteps: alternateRealities?.future1?.transitionSteps || ""
                    },
                    future2: {
                        goal: alternateRealities?.future2?.goal || "",
                        careerPath: alternateRealities?.future2?.careerPath || "",
                        transitionSteps: alternateRealities?.future2?.transitionSteps || ""
                    }
                };
            }

            await existingForm.save();
            return res.status(200).json({ message: 'Form updated', form: existingForm });
        } else {
            const newForm = await Form.create({
                user,
                responses: responses || [],
                alternateRealities: {
                    future1: {
                        goal: alternateRealities?.future1?.goal || "",
                        careerPath: alternateRealities?.future1?.careerPath || "",
                        transitionSteps: alternateRealities?.future1?.transitionSteps || ""
                    },
                    future2: {
                        goal: alternateRealities?.future2?.goal || "",
                        careerPath: alternateRealities?.future2?.careerPath || "",
                        transitionSteps: alternateRealities?.future2?.transitionSteps || ""
                    }
                }
            });

            return res.status(201).json({ message: 'Form created', form: newForm });
        }
    } catch (error) {
        console.error("Error saving form:", error);
        return res.status(500).json({ error: error.message });
    }
};


//Update form for authenticated user

const updateForm = async (req, res) => {
    const user = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(user)) {
        return res.status(400).json({ error: 'No such user' });
    }

    try {
        const form = await Form.findOneAndUpdate(
            { user },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!form) {
            return res.status(404).json({ error: 'No form found for this user' });
        }

        res.status(200).json(form);
    } catch (error) {
        console.error("Error updating form:", error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {

    newForm,
    getForm,
    updateForm

}

