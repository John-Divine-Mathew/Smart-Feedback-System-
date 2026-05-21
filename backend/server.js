const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/smartfeedback")
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((error) => console.error(error));

const feedbackSchema = new mongoose.Schema({
    id: Number,
    employeeId: String,
    employeeEmail: String,
    employeeName: String,
    employeePhone: String,
    department: String,
    category: String,
    issueTitle: String,
    issueDescription: String,
    priority: String,
    status: String,
    timestamp: { type: Date, default: Date.now }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

app.post("/feedbacks", async (request, response) => {
    try {
        const feedback = new Feedback(request.body);
        await feedback.save();
        response.json({ message: "Feedback Saved Successfully" });
    } catch (error) {
        response.status(500).json({ message: "Error Saving Feedback" });
    }
});

app.get("/feedbacks", async (request, response) => {
    try {
        const data = await Feedback.find().sort({ timestamp: -1 });
        response.json(data);
    } catch (error) {
        response.status(500).json({ message: "Error fetching feedback" });
    }
});

app.patch("/feedbacks/:id", async (request, response) => {
    try {
        const id = Number(request.params.id);
        const updated = await Feedback.findOneAndUpdate({ id }, request.body, { new: true });
        if (!updated) {
            return response.status(404).json({ message: "Feedback not found" });
        }
        response.json(updated);
    } catch (error) {
        response.status(500).json({ message: "Error updating feedback" });
    }
});

app.delete("/feedbacks/:id", async (request, response) => {
    try {
        const id = Number(request.params.id);
        const removed = await Feedback.findOneAndDelete({ id });
        if (!removed) {
            return response.status(404).json({ message: "Feedback not found" });
        }
        response.json({ message: "Feedback deleted" });
    } catch (error) {
        response.status(500).json({ message: "Error deleting feedback" });
    }
});

app.listen(5000, () => {
    console.log("Server Running On Port 5000");
});
