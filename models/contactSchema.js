const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const contactSchema = new Schema({


    
name: {
    type:String,
    required:true
},
oragnization:{
    type:String,
    required:false
},
telefon:{type:String,
        required:false},

telefonLogo:{
    type:String,
    required:false
},
email: {
    type:String,
    
},favourite: {
    type:Boolean,
    required:true
},
img_id:{
    type:String,
    required:true
}
})

const Contact = mongoose.model("Contacts",contactSchema)

module.exports = Contact