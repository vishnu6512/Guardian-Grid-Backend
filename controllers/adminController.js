const Volunteer = require('../models/userModel');
const afi = require('../models/requestModel');

// Get Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    // Count total volunteers
    const totalVolunteersCount = await Volunteer.countDocuments();

    // Count active assignments (AFIs with status 'pending')
    const pendingAssignmentsCount = await afi.countDocuments({ status: 'pending' });

    // Count completed assignments (AFIs with status 'resolved')
    const completedAssignmentsCount = await afi.countDocuments({ status: 'resolved' });

    // Count pending approvals (volunteers with status 'pending')
    const pendingApprovalsCount = await Volunteer.countDocuments({ status: 'pending' });

    //pending approval details (volunteers with status 'pending')
    const pendingApprovals = await Volunteer.find({ status: 'pending' });

    //Pending Affected individual requests
    const pendingRequests = await afi.find({status:'pending'})

    //volunteerList
    const volunteerList = await Volunteer.find({status:'approved'})
    

    


    res.json({
      totalVolunteersCount,
      pendingAssignmentsCount,
      completedAssignmentsCount,
      pendingApprovalsCount,
      pendingApprovals,
      pendingRequests,
      volunteerList
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

//Approving volunteers(when admin clicks on approve button)
const approveVolunteer = async (req, res) => {
  const { volunteerId } = req.body;
  
  try {
    // Update volunteer status to 'approved'
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(volunteerId, { status: 'approved' }, { new: true });
    
    res.json(updatedVolunteer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve volunteer' });
  }
};

//reject volunteers(when admin clicks on reject button)
const rejectVolunteer = async (req, res) => {
  const { volunteerId } = req.body;
  
  try {
    // Update volunteer status to 'declined'
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(volunteerId, { status: 'declined' }, { new: true });
    
    res.json(updatedVolunteer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to decline volunteer' });
  }
};


// New function to assign volunteer to a request
const assignVolunteerToRequest = async (req, res) => {
    const { requestId, volunteerId, notes } = req.body;
    
    try {
      // Find the volunteer to get their name
      const volunteer = await Volunteer.findById(volunteerId);
      
      if (!volunteer) {
        return res.status(404).json({ error: 'Volunteer not found' });
      }
      
      // Update request with volunteer ID and change status to 'assigned'
      const updatedRequest = await afi.findByIdAndUpdate(
        requestId,
        { 
          assignedTo: volunteerId,
          status: 'assigned', // Change from 'pending' to 'assigned'
          assignmentNotes: notes // Optional: Store notes about the assignment
        },
        { new: true }
      );
      
      if (!updatedRequest) {
        return res.status(404).json({ error: 'Request not found' });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error('Error assigning volunteer:', error);
      res.status(500).json({ error: 'Failed to assign volunteer to request' });
    }
  };

module.exports = { getDashboardStats, approveVolunteer, rejectVolunteer, assignVolunteerToRequest };
