// need to confirm 

const mongoose=require('mongoose');
const Prescription=mongoose.Schema({
  AppointmentId:{type:String},
  PrescriptionComments:{type:String}
});
module.exports =mongoose.model("Prescription",Prescription);