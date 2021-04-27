const express = require("express")
require("dotenv").config();
const mongoose = require("mongoose")
const path= require("path");

const { v4: uuidv4 } = require('uuid');
const crypto = require("crypto")
const multer = require("multer")
const bodyParser = require('body-parser')
const GridFsStorage = require("multer-gridfs-storage")
const Grid = require("gridfs-stream")
const methodOverride = require("method-override")
const PORT = process.env.PORT || 4000
const Contact = require("./models/contactSchema");
const { nextTick } = require("process");
const { json } = require("body-parser");
const app = express()
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"))



// connecting to MongoDB (createConnection)
const conn = mongoose.createConnection(process.env.CONNECTIONSTRING,{useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify: false })




// connecting to MongoDB (mongoose.connect, for Schema)
const connectDB = async () => {
  try {
      const conn1 = await mongoose.connect(process.env.CONNECTIONSTRING,{useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify: false })
     

      app.listen(PORT,() => {
        console.log("listening port 4000")
      })
      console.log("connected for Schema")
  } catch (error) {
     console.log(error) 
     process.exit(1)
  }

}
connectDB()






// function array(){
//     Contact.find()
//     .then((result) => {
    
//     return result
//     //    console.log(req.filterContact)
//        next()
//     //   res.json({render:""})
//     }).catch((err) => {
//       console.log(err)
//     })
// }
// array()
// GridSystem
let gfs;

// Init uploadStream

conn.once('open',  ()=> {
gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads") 
  })



// setting Storage Engine (have to solve deprication warnings)



const random = uuidv4()
const storage = new GridFsStorage({
    url: process.env.CONNECTIONSTRING,
    
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          console.log(random)
          const filename = random + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            
            bucketName: 'uploads'
          }
          
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });



 // GET requests
 app.get("/",(req,res) => {
   gfs.files.find().toArray((err,files) => {
     if(!files){
         return res.json("no file")
     }
     Contact.find()
     .then((result) => {
    
       res.render("pages/contacts",{result,files})
     }).catch((err) => {
       console.log(err)
     })
    
   })
    
 })

 app.get("/newContact",(req,res) => {
    res.render("pages/newContact")

 })
 // POST requests

 app.post("/upload",upload.single("img"),(req,res) => {
     const contact = new Contact({
         name:req.body.name,
         telefon:req.body.telefon,
         email:req.body.email,
         favourite:false,
         img_id:random
     })
     contact.save()
     .then((result) => {
       console.log(result)
     }).catch((err) => {
       console.log(err)
     })


   res.redirect("/")

 })

// const filt = (req,res,next)=>{
//     Contact.find()
//     .then((result) => {
//   const filterContact =   result.filter((elt) => {
//        return elt.name == "Courage"
//     })
//     req.find = filterContact
//       console.log(result[0].name,"here",req.find)
//        next()
//     //   res.json({render:""})
//     }).catch((err) => {
//       console.log(err)
//     })
// }

app.get("/search",(req,res) => {
//   console.log(req.filterContact)
  res.json({result:req.find})
res.end()
})