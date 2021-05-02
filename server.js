const express = require("express")
require("dotenv").config();
const mongoose = require("mongoose")
const path= require("path");

const { v4: uuidv4 } = require('uuid');
const crypto = require("crypto")
const multer = require("multer")
// const bodyParser = require('body-parser')
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


let random =""

app.use((req,res,next) => { 
    random = uuidv4()
    next()
    
  
})


// GridSystem
let gfs;

// Init uploadStream

conn.once('open',  ()=> {
gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads") 
  })



// setting Storage Engine (have to solve deprication warnings)




const storage = new GridFsStorage({
    url: process.env.CONNECTIONSTRING,
    
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          
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

 // "/" GET & Read Stream
 app.get("/",(req,res) => {
   gfs.files.find().toArray((err,files) => {
    if(!files|| files.length === 0){
      return res.status(404).json({err:"no files"})
     }
     //checking if contenttype is img
     files.map((elt) => {
       if(elt.contentType === "image/jpeg" || elt.contentType === "image/png" ){
         elt.isImage = true
         elt.imgId = elt.filename.split('.').slice(0, -1).join('.');
       }else{
         elt.isImage = false
       }
     })
     Contact.find()
     .then((result) => {
      console.log(result,files)
       res.render("pages/contacts",{result,files})
     }).catch((err) => {
       console.log(err)
     })
    
     
   })
    
 })

 app.get("/newContact",(req,res) => {
    res.render("pages/newContact")

 })
 app.get("/favourites",(req,res) => {
  gfs.files.find().toArray((err,files) => {
   if(!files|| files.length === 0){
     return res.status(404).json({err:"no files"})
    }
    //checking if contenttype is img
    files.map((elt) => {
      if(elt.contentType === "image/jpeg" || elt.contentType === "image/png" ){
        elt.isImage = true
        elt.imgId = elt.filename.split('.').slice(0, -1).join('.');
      }else{
        elt.isImage = false
      }
    })
    Contact.find()
    .then((result) => {
     console.log(result,files)
      res.render("pages/favourites",{result,files})
    }).catch((err) => {
      console.log(err)
    })
   
    
  })
   
})


 

// QR Code middleware
const qrCode = (req,res,next) => {
  
}

 app.get("/contacts/:id",(req,res) => {
  gfs.files.find().toArray((err,files) => {
   if(!files|| files.length === 0){
     return res.status(404).json({err:"no files"})
    }
    //checking if contenttype is img
    files.map((elt) => {
      if(elt.contentType === "image/jpeg" || elt.contentType === "image/png" ){
        elt.isImage = true
        elt.imgId = elt.filename.split('.').slice(0, -1).join('.');
      }else{
        elt.isImage = false
      }
    })
    Contact.find()
    .then((result) => {
     console.log(result,files)
      res.render("pages/contactItem",{result,files})
    }).catch((err) => {
      console.log(err)
    })
   
    
  })
   
})

// Images a-tag Route

app.get("/images/:filename",(req,res) => {
  gfs.files.findOne({filename:req.params.filename},(err,file) => {
    if(!file|| file.length === 0){
      return res.status(404).json({err:"no files"})
    }
    //check if image
    if(file.contentType === "image/jpeg" || file.contentType === "image/png" ){
    // Read output to Browser
    const readstream = gfs.createReadStream(file.filename);
readstream.pipe(res);
    }else{
      res.status(404).json({err:"not an image"})
    }
  })
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

//============ test grid storage



     contact.save()
     .then((result) => {
       console.log(result)
     }).catch((err) => {
       console.log(err)
     })


   res.redirect("/")

 })

const filt = (req,res,next)=>{

  gfs.files.find().toArray((err,files) => {
    if(!files|| files.length === 0){
      return res.status(404).json({err:"no files"})
     }
     //checking if contenttype is img
     files.map((elt) => {
       if(elt.contentType === "image/jpeg" || elt.contentType === "image/png" ){
         elt.isImage = true
         elt.imgId = elt.filename.split('.').slice(0, -1).join('.');
         req.images = files
       }else{
         elt.isImage = false
       }
     })
    })
  
    Contact.find()
    .then((result) => {
  const filterContact =   result.filter((elt) => {
       return elt.name.toLowerCase().includes(req.query.word.toLowerCase())
    })
    req.find = filterContact
      console.log(filterContact)
       next()
    
    }).catch((err) => {
      console.log(err)
    })
}


app.get("/search",filt,(req,res) => {
  
  res.send({contacts:req.find,images:req.images})
// res.end()
})

// POST request favourites

app.get("/contacts/favUpdate/:id",(req,res) => {
  
Contact.findById(req.params.id)
  .then((result) => {
    const favUpdate = result
    favUpdate.favourite = !favUpdate.favourite
    favUpdate.save()
    .then((result) => {
      console.log("fav updated")
    }).catch((err) => {
      console.log(err)
    })
  })
  .catch((err) => {
    console.log(err)
  })
})


//TEST
app.get("/test",(req,res) => {
  res.render("pages/contactsFiltered")

})