const mongoose=require('mongoose');
const InsuranceDetails=mongoose.Schema({
    FirstName:{type:String},
    LastName:{type:String},
    InsurancId:{type:String},
    PolicyNumber:{type:String}
});
module.exports =mongoose.model("InsuranceDetails",InsuranceDetails);