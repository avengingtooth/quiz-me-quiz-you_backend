const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const questionSchema = new Schema(
    {
        questionText: {
            type: String,
            required: true
        },
        answers: [
            {
                content: {
                    type: String,
                    required: true
                },
                points: {
                    type: Number,
                    required: true
                }
            }
        ],
    },
);

const Question = model("Question", questionSchema);

module.exports = Question;