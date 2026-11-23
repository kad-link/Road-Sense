import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/dbConnect.js";
import bcrypt from "bcryptjs";
import { User } from "./db/models/user.js";
import express from "express";
import jwt from "jsonwebtoken";
import { Trip } from "./db/models/trips.js";
import { UserDocs } from "./db/models/vehicleDocuments.js";
import { Score } from "./db/models/score.js";
import upload from "./middleware/multer.js";
import cloudinary from "./config/cloudinary.js";
import { Resend } from 'resend';
import { authMiddleware } from "./middleware/auth.js";
import admin from "firebase-admin";

const app = express();

import cors from "cors";

if (
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_PRIVATE_KEY.includes("-----BEGIN PRIVATE KEY-----")
) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
      })
    });
    console.log("🔥 Firebase Admin initialized successfully.");
  } catch (err) {
    console.warn("⚠️ Failed to initialize Firebase Admin:", err.message);
  }
} else {
  console.warn("⚠️ Firebase credentials missing or invalid in .env. Google Login will be disabled.");
}



const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


connectDB();

const JWT_SECRET = process.env.JWT_SECRET;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;


app.get("/", (req,res)=>{
    res.send("Coconut Breaks Here !");
})

app.post("/registeruser",async (req,res)=>{

  try{

  const {fullName, email, password, carModel} = req.body;

  if(!fullName || !email || !password){
    return res.status(400).json({
      success:false,
      message:"Full name, email, and password are required"
    });
  } 

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long"
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({email: normalizedEmail});
  if(existingUser){
    return res.status(400).json({
      success:false,
      message:"Email already exists"
    });
  }

  const salt = await bcrypt.genSalt(10);
  const encryptedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password:encryptedPassword,
    carModel: carModel ? carModel.trim() : null
  })

  await newUser.save();

  const token = jwt.sign(
    {userId: newUser._id, email: newUser.email},
    JWT_SECRET,
    {expiresIn:"7d"}
        );

  res.status(201).json({
    success:true,
    message:"Account created successfully",
    token,
    user:{
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      carModel: newUser.carModel
    }
  });
  }
  catch(error){
    console.log(`Sign Up error: ${error}`);
    res.status(500).json({
      success:false,
      message:"Internal Server Error. Try Again . . ."
    });
    
  }
})

app.post("/loginuser",async (req,res)=>{
  try {
    const {email, password} = req.body;

    if(!email || !password){
      return res.status(400).json({
        success:false,
        message:"Incomplete fields"
      })
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({email: normalizedEmail});

    if(user){
      if (user.authProvider === 'google' && !user.password) {
        return res.status(400).json({
          success: false,
          message: "This account was registered with Google. Please use Google Sign In."
        });
      }

      const passwordValidator = await bcrypt.compare(password,user.password);

      if(passwordValidator){

        const token = jwt.sign(
          {userId: user._id, email: user.email},
          JWT_SECRET,
          {expiresIn:"7d"}
        );

        return res.status(200).json({
          success:true,
          message:"Login successful",
          token,
          user:{
            id:user._id,
            email: user.email,
            fullName: user.fullName,
            carModel: user.carModel
          }
        });
      }
      else{
        return res.status(401).json({
          success:false,
          message:"Invalid credentials"
        });
      }
    }
    else{
      return res.status(404).json({
          success: false,
          message: "User not registered"
        });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success:false,
      message:"Internal Server Error during login."
    })
  }
})


app.post("/trip/:email",authMiddleware ,async(req,res)=>{
  try {
    const {source, destination, duration, distance} =req.body;
    const {email} = req.params;


    if(!source || !destination || !duration || !distance ){
    return res.status(400).json({
      success:false,
      message:"Trip fields incomplete"
    });
  } 

  const foundUser = await User.findOne({ email: email.toLowerCase() });

  if (!foundUser) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  // Verify ownership
  if (req.user.userId !== foundUser._id.toString() && req.user.email !== foundUser.email) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: You cannot record trips for another driver"
    });
  }

  const myDate = new Date();
  const formattedDate = myDate.toLocaleDateString('en-GB'); 

  const newTrip = new Trip({
    source,
    destination,
    duration,
    distance,
    user: foundUser._id,
    date: formattedDate
  })

  await newTrip.save();

  res.status(201).json({
    success:true,
    message:"Trip saved successfully",
    trip: newTrip
  });

  } catch (error) {
    console.log(`Trip storing failed : ${error}`);
    res.status(500).json({
      success:false,
      message:"Internal Server Error. Trip storing unsucessful. Try Again . . ."
    });
  }
})

app.get("/trip/:email", authMiddleware, async(req,res)=>{
  try{
    const {email} = req.params;
    const isUser = await User.findOne({ email: email.toLowerCase() });

    if(!isUser){
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Verify ownership
    if (req.user.userId !== isUser._id.toString() && req.user.email !== isUser.email) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot view trips belonging to another driver"
      });
    }

    const trips= await Trip.find({user: isUser._id}).sort({_id:-1});

    res.status(200).json({
      success:true,
      message: trips.length ? "Trips fetched successfully" : "No trips found for this user",
      trips,
    })
  }
  catch(error){
    console.error("Trip fetching failed : " + error);
    res.status(500).json({
      success:false,
      message:"Internal Server Error. Could not fetch trips.",
    })
  }
})

app.post("/docs/:email", authMiddleware, (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Multer / Cloudinary upload error: ", err);
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed. Allowed formats: JPG, JPEG, PNG, PDF (Max 10MB)."
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { email } = req.params;
    const { fileDescription } = req.body;

    const isUser = await User.findOne({ email: email.toLowerCase() });

    if (!isUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify ownership
    if (req.user.userId !== isUser._id.toString() && req.user.email !== isUser.email) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot upload documents for another user"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!fileDescription) {
      return res.status(400).json({
        success: false,
        message: "File Description is required"
      });
    }

    const fileURL = req.file.path; 
    const originalName = req.file.originalname;
    const fileSize = req.file.size;
    const cloudinaryPublicId = req.file.filename;

    const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const myDate = new Date();
    const formattedDate = myDate.toLocaleDateString('en-GB');

    const newDoc = new UserDocs({
      fileName: originalName,
      date: formattedDate,
      fileSize: formatFileSize(fileSize),
      fileDescription,
      fileURL,
      cloudinaryPublicId,
      user: isUser._id,
    });

    await newDoc.save();

    return res.status(201).json({
      success: true,
      message: "File upload successful",
      document: newDoc
    });

  } catch (error) {
    console.error("File uploading error: ", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A file with this name already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message
    });
  }
});

// Delete vehicle document from Cloudinary and MongoDB
app.delete("/docs/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await UserDocs.findById(id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    // Verify ownership
    if (doc.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You cannot delete documents belonging to another driver"
      });
    }

    // Extract Cloudinary public ID
    let publicId = doc.cloudinaryPublicId;
    if (!publicId && doc.fileURL) {
      const match = doc.fileURL.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
      if (match) publicId = match[1];
    }

    if (publicId) {
      try {
        const cloudRes = await cloudinary.uploader.destroy(publicId);
        if (cloudRes && cloudRes.result !== 'ok') {
          // Attempt destruction with raw resource type (common for non-standard files/PDFs)
          await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        }
      } catch (cloudErr) {
        console.warn("Cloudinary asset deletion note:", cloudErr.message);
      }
    }

    await UserDocs.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (error) {
    console.error("Document deletion failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: error.message
    });
  }
});


app.get("/docs/:email", authMiddleware, async(req,res)=>{
  try
  {
    const {email} = req.params;
    const user = await User.findOne({ email: email.toLowerCase() });

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found",
      })
    }

    // Verify ownership
    if (req.user.userId !== user._id.toString() && req.user.email !== user.email) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot access documents belonging to another user"
      });
    }

    const documents= await UserDocs.find({user: user._id}).sort({_id:-1});

    res.status(200).json({
      success:true,
      message: documents.length ? "Documents fetched successfully" : "No documents found for this user",
      documents,
    })
  }
  catch(error){
    console.error("Documents fetching failed : " , error);
    res.status(500).json({
      success:false,
      message:"Internal Server Error. Could not fetch documents.",
    })
  }
})

app.post("/score/:email", authMiddleware, async(req,res)=>{
  try {
    const {email} = req.params;
    const {score} = req.body;

    if(score === undefined || score === null){
      return res.status(400).json({
        success:false,
        message:"Score saving failed. Valid score required."
      });
    } 

    const foundUser = await User.findOne({ email: email.toLowerCase() });

    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify ownership
    if (req.user.userId !== foundUser._id.toString() && req.user.email !== foundUser.email) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot record scores for another user"
      });
    }

    const myDate = new Date();
    const formattedDate = myDate.toLocaleDateString('en-GB'); 

    const newScore = new Score({
      score: String(score),
      user: foundUser._id,
      date: formattedDate
    })

    await newScore.save();

    res.status(201).json({
      success:true,
      message:"Score saved successfully",
      score: newScore
    });

  } catch (error) {
    console.log(`Score storing failed : ${error}`);
    res.status(500).json({
      success:false,
      message:"Internal Server Error. Score saving unsucessful. Try Again . . ."
    });
  }
})

app.get("/score/:email", authMiddleware, async(req,res)=>{
  try
  {
    const {email} = req.params;
    const user = await User.findOne({ email: email.toLowerCase() });

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found",
      })
    }

    // Verify ownership
    if (req.user.userId !== user._id.toString() && req.user.email !== user.email) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot view scores belonging to another user"
      });
    }

    const scores= await Score.find({user: user._id}).sort({_id:-1});

    res.status(200).json({
      success:true,
      message: scores.length ? "Scores fetched successfully" : "No past trips found for this user",
      scores,
    })
  }
  catch(error){
    console.error("Scores fetching failed : " , error);
    res.status(500).json({
      success:false,
      message:"Internal Server Error. Could not fetch scores.",
    })
  }
})


app.post("/send-email", async (req, res) => {
  try {

    const { name, email, subject, message } = req.body;
    console.log('Extracted fields:', { name, email, subject, message });

    

    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'sricharanchittineni@gmail.com';

    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY is not configured in .env. Simulating email dispatch.");
      return res.status(200).json({ 
        success: true, 
        message: 'Message received (Development Mode: Resend API key not set).' 
      });
    }

    const data = await resend.emails.send({
      from: 'RoadSense <onboarding@resend.dev>', 
      to: [adminEmail],
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #1f2937; }
              .value { color: #4b5563; margin-top: 5px; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Contact Form Submission - RoadSense</h2>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">From:</div>
                  <div class="value">${name}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">${email}</div>
                </div>
                <div class="field">
                  <div class="label">Subject:</div>
                  <div class="value">${subject}</div>
                </div>
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value">${message.replace(/\n/g, '<br>')}</div>
                </div>
              </div>
              <div class="footer">
                <p>This email was sent from RoadSense contact form</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    console.log('Mailed successfully:', data);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send email. Please try again later.' 
    });
  }
});

app.post("/Glogin", async(req,res)=>{

  const { token} = req.body;

  try {
    if (!admin.apps || admin.apps.length === 0) {
      return res.status(503).json({
        success: false,
        message: "Google login is currently unavailable (Firebase not configured)."
      });
    }
    const decoded = await admin.auth().verifyIdToken(token);

    let user = await User.findOne({ email: decoded.email });

    if (!user) {
      user = await User.create({
        email: decoded.email,
        fullName: decoded.name || decoded.email.split('@')[0],
        authProvider: "google",
        googleUID: decoded.uid,
        profilePic: decoded.picture || null,
      });
    }

    const JWTtoken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token: JWTtoken,
      user 
    });


  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: "Invalid Google token" });
  }

})

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);
});



