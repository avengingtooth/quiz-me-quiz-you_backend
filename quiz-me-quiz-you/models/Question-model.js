const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const questionSchema = new Schema(
    {
        questionText: {
            type: String,
            required: true
        },
        score: {
            type: Number,
            required: true
        },
    },
    {
        // this second object adds extra properties: `createdAt` and `updatedAt`    
        timestamps: true
    }
);

const Question = model("Question", questionSchema);

module.exports = Question;