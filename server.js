const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Feedback = require('./Models/Feedback');  // Assuming you created the feedback model
const nodemailer = require('nodemailer');
const multer = require('multer');

const fs = require('fs');
const dotenv = require('dotenv').config;

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

mongoose.connect('mongodb+srv://ppalgaming2211:S0222p@cluster0.4z6qi4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const imageSchema = new mongoose.Schema({
    name: String,
    description: String,
    category: String,
    image: String
});


const Image = mongoose.model('Image', imageSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage });
const transporter = nodemailer.createTransport({
  service: 'gmail', // Gmail SMTP
  auth: {
    user: 'inquiry.ihds@gmail.com',         // Replace with your Gmail address
    pass: 'qlvcofrqeflishvd',            // Replace with the generated App Password or your Gmail password
  },
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/IhdUploadImg', async (req, res) => {
    const { name, description, category, image } = req.body;

    const newImage = new Image({
        name,
        description,    
        category,
        image
    });

    await newImage.save();
    res.send('Image uploaded successfully');
});

app.get('/images/:category', async (req, res) => {
    const { category } = req.params;
    const images = await Image.find({ category });
    res.json(images);
});



app.put('/IhdUploadImg/:id', async (req, res) => {
    const { description } = req.body;
  
    try {
      const updatedImage = await Image.findByIdAndUpdate(req.params.id, { description }, { new: true });
      if (!updatedImage) return res.status(404).json({ message: 'Image not found' });
      res.json(updatedImage);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  app.delete('/delete/:id', async (req, res) => {
    try {
      const deletedImage = await Image.findByIdAndDelete(req.params.id);
      if (!deletedImage) return res.status(404).json({ message: 'Image not found' });
      res.json({ message: 'Image deleted' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    } 
  });


  app.post('/api/feedback', async (req, res) => {
    try {
      const feedback = new Feedback(req.body);
      await feedback.save();
      res.status(201).send({ message: 'Feedback submitted successfully' });
    } catch (error) {
      res.status(500).send({ message: 'Error submitting feedback', error });
    }
  });

app.post('/send-email', upload.single('media'), (req, res) => {
  const { user_name, user_email, number, user_location, looks } = req.body;
  console.log(user_name);
  console.log(user_email);

  const mailOptions = {
    from: `"${user_name}" <${user_email}>`, // Sender's email
    to: 'official.prajwalpal@gmail.com',                     // Recipient email
    subject: 'New Consultation Request',
    text: `Name: ${user_name}\nEmail: ${user_email}\nPhone: ${number}\nLocation: ${user_location}\nRequirements: ${looks}`,
    attachments: req.file
      ? [
          {
            filename: req.file.originalname,
            content: req.file.buffer,
          },
        ]
      : [],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  });
});
 





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
