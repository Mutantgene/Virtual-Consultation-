const express=require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const cors=require('cors');
const multer=require('multer');
const API=express();
const InsuranceDetails=require('./models/InsuranceDetails');
const DiseaseDescription=require('./models/DiseaseDescription');
const PatientDetails=require('./models/DiseaseDescription');
const AppointmentDetails=require('./models/AppointmentDetails');
const DoctorDetails=require('./models/DoctorDetails');
const NewsLetterSubscription=require('./models/NewsLetterSubscription');
const nodemailer = require('nodemailer'); 
const moment = require('moment');
const cron = require("node-cron");
const Prescription=require('./models/Prescription');
const FeedBack=require('./models/FeedBack');
const DoctorCalender=require('./models/DoctorCalender')

mongoose.connect('mongodb+srv://ismileTechnologies:VirtualConsultationIsmileTech@cluster0.ceonx.mongodb.net/actual?retryWrites=true&w=majority',{'useUnifiedTopology':true})
.then(()=>{
    console.log('database connected');
})
.catch(()=>{
    console.log('database connectivity failed');
});

API.use(cors());
API.use(bodyParser.json());
API.use(bodyParser.urlencoded({extended: false}));

/*
User Story 1032
Fee payment(backend)
=>it validate the details

    {
        FirstName:
        LastName:
        InsuranceId: 
        PolicyNumber:
    }
*/
API.post('/validateInsuranceDetails',(req,res,next)=>{
    var post=req.body;
    InsuranceDetails.findOne(
                                {
                                    'FirstName':post.FirstName,
                                    'LastName':post.LastName,
                                    'InsuranceId':post.InsurancId,
                                    'PolicyNumber':post.PolicyNumber
                                },function(err,data)
                                {
                                    if(err)
                                    {
                                        console.log('error occured in "/validateInsuranceDetails"');
                                    }
                                    else if(data==null)
                                    {
                                        res.status(200).json({
                                            message:'Not Matched'
                                        });
                                        res.send();
                                    }
                                    else
                                    {
                                        res.status(200).json({
                                            message:'Matched'
                                        });
                                        res.send();
                                    }
                                }
                            );
});


/*
User Story 1189
Acknowledgement confirmation
*/
API.post('acknowledgeConfirmation',(req,res,next)=>{

    var post=req.body;

    let mailTransporter = nodemailer.createTransport({ 
        service: 'gmail', 
        auth: { 
            user: 'control.VirtualConsultation@gmail.com', 
            pass: 'Virtual@paras'
        } 
    }); 
    

    PatientDetails.findOne({'PatientId':post.PatientId},function(err,data){
        if(data!=null)
        {
            AppointmentDetails.findOne({'AppointmentId':post.AppointmentId},function(e,d){

                if(d!=null)
                {
                    var message=`<h1>Virtual Consultation</h1><br>`;// add Appointment details in this mail
                   
                    const mailOptions = {
                        from: 'control.VirtualConsultation@gmail.com', // sender address
                        to: data.Email, // list of receivers
                        subject: 'Acknowledgement for Appointment Confirmation', // Subject line
                        html: message // plain text body
                    };  
    
                    mailTransporter.sendMail(mailOptions, function(er, da) { 
                        if(er)
                        { 
                            console.log(er);
                        }
                        else
                        {
                            res.status(200).json({
                                message:'success'
                            });
                            res.send();
                        }
                    }); 
                }
            }); 
        }
    })


});

/*
User Story 1188
Patient Registration
*/
API.post('/registerPatient',(req,res,next)=>{

    var post=req.body;
    //generate patient id
    var patientId;
    const obj=new PatientDetails({
        PatientId:patientId,
        FirstName:post.FirstName,
        LastName:post.LastName,
        DateOfBirth:post.DateOfBirth,
        Gender:post.Gender,
        Mobile:post.Mobile,
        Email:post.Email,
        Password:post.Password    
    })
    obj.save();
    res.status(200).json({
        message:'success'
    });
    res.send();
})


/*
User Story 1170
Appointment info(Backend)
*/
API.post('/getAppointmentInfo',(req,res,next)=>{
    var post=req.body;
    AppointmentDetails.findOne({'AppointmentId':post.AppointmentId},function(err,data)
    {
        if(data==null)
        {
            res.status(200).json({
                message:'not found'
            });
            res.send();
        }
        else
        {
            res.status(200).json({
                message:'success'
            });
            res.send(data);
        }
    });


});



/*
User Story 1021
form having disease description (backend)
*/
API.post('/addDiseaseDescription',(req,res,next)=>{
    var post=req.body;
    const obj=new DiseaseDescription({
        SymptomName:post.SymptomName,
        SymptomSeverity:post.SymptomSeverity
    });       
    console.log(obj); 
    obj.save();
    res.status(200).json({
            message:'success'
        });
    res.send();
       
});


/*
User Story 1135
FeedBack (backend)
*/
API.post('/postFeedBack',(req,res,next)=>{
    
    var post=req.body;
    const obj=new FeedBack({
        RatingForOverallSatisfaction:post.RatingForOverallSatisfaction,
        RatingForDoctor:post.RatingForDoctor,
        RatingForService:post.RatingForService,
        Comments:post.Comments
    });
    obj.save();
    res.status(200).json({
        message:'success'
    });
    res.send();
});


/*
User Story 668
Demographic info of patient form(Backend)
*/
API.post('/addPatientDetails',(req,res,next)=>{ 

    var post=req.body;
    const obj=new PatientDetails
    ({
        FirstName:post.FirstName,
        LastName:post.LastName,
        DateOfBirth:post.DateOfBirth,
        Gender:post.Gender,
        Mobile:post.Mobile,
        Email:post.Email,
        Password:post.Password
    });   

    obj.save();
    res.status(200).json({
       message:'success'
        });
    res.send();
});


/*
User Story 681
Provide access to the patient document before VC
*/
API.post('/sendPatientDocumentToDoctor',(req,res,next)=>{

    res.download(post.AppointmentId, 'PatientDocuments_AppointmentId_'+post.AppointmentId);
    res.status(200).json({
        messgae:'success'
    });
    res.send();
});


/*
User Story 1092
Book an appointment
*/
API.post('/fixAnAppointment',(req,res,next)=>
{
    var post=req.body;
    var appointmentId // generate appointment id

    //search Doctor Name and find its id and save it with appointment
    /*
    var timestamp = 1594280700;


    var inverseOffset = moment(timestamp).utcOffset() * -1;
    timestamp = moment().utcOffset( inverseOffset  );
    
     // This should give you the accurate UTC equivalent.
    console.log(timestamp.toISOString());

    var dateString = moment.unix(timestamp).format("MMMM DD YYYY, h:mm:ss a'");
    console.log(dateString);*/
    

    // convert momment timestamp to UTC string 


    /*cron.schedule("* * * * *", function() { // set time and date before 1 hour
       
        let mailTransporter = nodemailer.createTransport({ 
            service: 'gmail', 
            auth: { 
                user: 'control.VirtualConsultation@gmail.com', 
                pass: 'Virtual@paras'
            } 
        }); 
        var message=`<h1>Virtual Consultation</h1><br>`;// add doctor details and timing in this mail
                       
                    const mailOptions = {
                        from: 'control.VirtualConsultation@gmail.com', // sender address
                        to: data[i].email, // list of receivers
                        subject: 'Your Appointment with the doctor in next 1 hour', // Subject line
                        html: message // plain text body
                    };  

                    mailTransporter.sendMail(mailOptions, function(err, d) { 
                        if(err)
                        { 
                            console.log(err);
                        }
                    }); 
      });
  

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
        cb(null, '/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, appointmentId)
    }
  })
   
  var upload = multer({ storage: storage })
  */
    const obj=new AppointmentDetails({
        AppointmentId:post.appointmentId, // change to appointmentId
        SymptomName:post.SymptomName,
        SymptomSeverity:post.SymptomSeverity,
        //UploadedDocument:post.UploadedDocument,
        TimeOfAppointment:post.TimeOfAppointment,
        DoctorId:post.DoctorId,
        PatientId:post.PatientId
    }) 

    obj.save();
 
    res.status(200).json(
        {
            messgae:'success'
        });
        res.send();
        
});


/*
User Story 1021
form having disease description (backend)
*/
API.post('/findDoctors',(req,res,next)=>{
    var post=req.body;

    // relate expertise, need not to be exact phrase
    DoctorDetails.findMany({'Expertise':post.Expertise},{DoctorId:1},function(err,data)
    {
        //find Doctor based upon the expertise and experience
        if(data.size()==0)
        {
            res.status(200).json({
                messgae:'No Doctor Found'
            });
            res.send();
        }
        else
        { 
            //check how many doctors out of these are free at this time
            AppointmentDetails.findMany({'DoctorId':{$in:[data]},'TimeOfAppointment':{$nin:[post.time]}},function(e,d)
            {
                if(d.size()==0)
                {
                    res.status(200).json({
                        messgae:'No Doctor is Free'
                    });
                    res.send();
                }
                else
                {
                    res.status(200).json({
                        messga:'doctors found',
                        doctor:d
                    });
                    res.send();
                }
            })
        }
    });         
});


/*
User Story 1095
Newsletter subscription ( backend)
Activate Subscription
*/
API.post('/activateSubscription',(req,res,next)=>{
    var post=req.body;
    var obj=new NewsLetterSubscription(
        {
            Email:post.Email,
            Phone:post.Phone
        }
    );
    NewsLetterSubscription.findOne({$or:[{'Email':post.Email},{'Phone':post.Phone}]},function(err,data){
        if(data==null)
        {
            obj.save();
            res.status(200).json({
                message:'successfully subscribed'
            });
            res.send();
        }
        else
        {
            res.status(200).json({
                message:'already subscribed'
            });
            res.send();
        }
    })
});


/*
User Story 
Doctor Registration (backend)
*/
API.post('/registerDoctor',(req,res,next)=>
{
    var post=req.body;
    doctorId='0';

    DoctorDetails.findOne({},{'DoctorId':1},{sort: {DoctorId: -1}, limit: 1},function(e,d)
    {
        if(d==null)
        {
            console.log('assign new doctor id');
            doctorId="doctor_1000000";
        }
        else
        {
           var x=(d.DoctorId);
           var y= x.split('_')[1];
           var z=parseInt(y,10)+1;
           doctorId='doctor_'+z.toString();
 
        }
  
        var obj=new DoctorDetails({
            DoctorId:doctorId,
            Name:post.Name,
            Qualification:post.Qualification,
            Expertise:post.Expertise,
            Experience:post.Experience
        });
        DoctorDetails.findOne({'Email':post.email},function(error,data){

            if(data==null)
            {
                obj.save();
                res.status(200).json({
                    message:'success'
                });
                res.send();
            }
            else
            {
                res.status(200).json({
                    message:'exists'
                });
                res.send();
            }
        });
    });    
});




/*
User Story 1095
Newsletter subscription ( backend)
Send Subscription Emails
*/
API.post('/provideSubscriptionUpdates',(req,res,next)=>{
    var post=req.body;
    
    let mailTransporter = nodemailer.createTransport({ 
        service: 'gmail', 
        auth: { 
            user: 'control.VirtualConsultation@gmail.com', 
            pass: 'Virtual@paras'
        } 
    }); 
  
    NewsLetterSubscription.findMany({},function(err,data){
        if(data.length!=0)
        {
            for(var i=0;i<data.length;i++)
            {
                    var message=`<h1>Virtual Consultation</h1><br>`+post.message;
                        const mailOptions = {
                        from: 'control.VirtualConsultation@gmail.com', // sender address
                        to: data[i].email, // list of receivers
                        subject: 'News Letter Subscription', // Subject line
                        html: message // plain text body
                    };  

                    mailTransporter.sendMail(mailOptions, function(err, d) { 
                        if(err)
                        { 
                            console.log(err);
                        }
                    }); 
            }
            res.status(200).json({
                message:'sent successfully'
            });
            res.send();
        }
    });
});


/* 
User Story 1097
Prescription(backend)
*/
API.post('/saveAndGivePrescription',(req,res,next)=>{

    var post=req.body;
    let mailTransporter = nodemailer.createTransport({ 
        service: 'gmail', 
        auth: { 
            user: 'control.VirtualConsultation@gmail.com', 
            pass: 'Virtual@paras'
        } 
    });
    const obj=new Prescription({
        AppointmentId:post.AppointmentId,
        PrescriptionComments:post.PrescriptionComments
    }) 
    obj.save();
    AppointmentDetails.findOne({AppointmentId:post.AppointmentId},{PatientId:1},function(err,data)
    {
        if(data==null)
        {
            res.status(200).json({
                message:'Wrong Appointment Id'
            });
            res.send();
        }
        else
        {
            PatientDetails.findOne({PatientId:data.PatientId},{Email:1},function(e,d)
            {
                if(d!=null)
                {
                    var message=`<h1>Virtual Consultation</h1><br>`+post.PrescriptionComments; // Add prescription 
                        const mailOptions = {
                        from: 'control.VirtualConsultation@gmail.com', // sender address
                        to: d.email, // list of receivers
                        subject: 'Prescription for Appointment Id'+post.AppointmentId, // Subject line
                        html: message // plain text body
                    };  

                    mailTransporter.sendMail(mailOptions, function(err, d) { 
                        if(err)
                        { 
                            console.log(err);
                            res.status(200).json({
                                messgae:'success'
                            });
                            res.send();
                        }
                    }); 
                }
            })
        }
    })
});


/*
User Story 1192
Doctor Calender
*/
API.post('/addDoctorSchedule',(req,res,next)=>{

    var post=req.body;
    const obj=DoctorCalender({
        DoctorId:post.DoctorId,
        FromDate:post.FromDate,
        FromTime:post.FromTime,
        ToDate:post.ToDate,
        ToTime:post.ToTime
    });
    obj.save();
    res.status(200).json({
        message:'success'
    });
    res.send();
})




module.exports=API;