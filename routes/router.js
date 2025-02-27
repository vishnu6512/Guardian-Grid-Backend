const express = require("express");
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const volunteerController = require("../controllers/volunteerController");
const emergencyServicesController = require("../controllers/emergencyServicesController");
const authController = require("../controllers/authController");

const jwtMiddleware = require("../middleware/jwtMiddleware");
const router = new  express.Router();

//volunteer registration http://localhost:3000/register
router.post("/register", userController.registerVolunteer);

//login http://localhost:3000/login
router.post("/login", userController.loginVolunteer);

//affected individual request http://localhost:3000/afi
router.post("/afi", userController.registerAfi);

// Route to fetch dashboard stats
router.get('/dashboard-stats', adminController.getDashboardStats);

//Approving volunteers(when admin clicks on approve button)
router.post('/approve-volunteer', adminController.approveVolunteer);

//Declining volunteers(when admin clicks on decline button)
router.post('/reject-volunteer', adminController.rejectVolunteer);

// Route to get volunteer status by ID
router.get('/status/:id',volunteerController.getVolunteerStatus);

// New route for assigning volunteers to requests
router.post('/assign-volunteer', adminController.assignVolunteerToRequest);

// Decline AFI request
router.post('/decline-afi', adminController.declineAfiRequest);

//get assigned afis
router.get('/assigned-afis/:id', volunteerController.getAssignedAFIs);

//update assignment status
router.put('/assigned-afis/:id',volunteerController.updateAssignmentStatus);

//route to get distance matrix
router.get('/nearby-volunteers/:afiId', adminController.getNearbyVolunteers);

// Existing routes...
router.get('/nearby-emergency-services/:lat/:lng/:types', emergencyServicesController.getNearbyServices);

//otp
router.post("/send-otp", authController.sendOTP);
router.post("/verify-otp", authController.verifyOTP);
module.exports = router