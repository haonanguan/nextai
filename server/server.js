import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer"; // Import multer, allow user upload files
import chat from "./chat.js";

dotenv.config(); //can use .env document in chat.js

const app = express();
app.use(cors()); //allow app to use third party plugin

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

const PORT = 5001;

let filePath;

//design API:
//1. RESTful? gRPC, graphQL? What does the API do? You should be able to describe it in one sentence
//2. Keyword, GET, POST, PUT, DELET?
//3. Status Code? 200, 401, 404, 500
//4. Input Payload? Param?
//5. Output?
app.post("/upload", upload.single("file"), async (req, res) => {
    // Use multer to handle file upload
    filePath = req.file.path; // The path where the file is temporarily saved
    res.send(filePath + " upload successfully.");
});

app.get("/chat", async (req, res) => {
    const resp = await chat(req.query.question, filePath); // Pass the file path to your main function
    res.send(resp.text);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
