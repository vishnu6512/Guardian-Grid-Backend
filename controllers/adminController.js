const Volunteer = require('../models/userModel');
const afi = require('../models/requestModel');
const axios = require('axios');
// Get Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    // Count total volunteers
    const totalVolunteersCount = await Volunteer.countDocuments();

    // Count active assignments (AFIs with status 'pending')
    const pendingAssignmentsCount = await afi.countDocuments({ status: 'pending' });

    // Count completed assignments (AFIs with status 'completed')
    const completedAssignmentsCount = await afi.countDocuments({ status: 'completed' });

    // Count pending approvals (volunteers with status 'pending')
    const pendingApprovalsCount = await Volunteer.countDocuments({ status: 'pending' });

    //pending approval details (volunteers with status 'pending')
    const pendingApprovals = await Volunteer.find({ status: 'pending' });

    //Pending Affected individual requests
    const pendingRequests = await afi.find({ status: 'pending' })

    //Completed Affected individual requests
    const completedRequests = await afi.find({ status: 'completed' })

    //volunteerList
    const volunteerList = await Volunteer.find({ status: 'approved' })

    




    res.json({
      totalVolunteersCount,
      pendingAssignmentsCount,
      completedAssignmentsCount,
      pendingApprovalsCount,
      pendingApprovals,
      pendingRequests,
      volunteerList,
      completedRequests
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

// Decline AFI request
const declineAfiRequest = async (req, res) => {
  const { requestId, note } = req.body;

  try {
    // Update the AFI request status to 'declined' and add decline note
    const updatedAfi = await afi.findByIdAndUpdate(
      requestId,
      { status: 'declined', declineNote: note },
      { new: true }
    );

    if (!updatedAfi) {
      return res.status(404).json({ error: 'Afi request not found' });
    }

    res.json(updatedAfi);
  } catch (error) {
    console.error('Error declining AFI request:', error);
    res.status(500).json({ error: 'Failed to decline AFI request' });
  }
};


const getNearbyVolunteers = async (req, res) => {
  const afiId = req.params.afiId;

  try {
    // Fetch AFI request details
    const afiRequest = await afi.findById(afiId);
    if (!afiRequest) {
      return res.status(404).json({ error: 'Afi request not found' });
    }

    const { lat: afiLat, lng: afiLng } = afiRequest;

    // Fetch all approved volunteers
    const validVolunteers = await Volunteer.find({ status: 'approved' }).select('_id name location lat lng');

    if (validVolunteers.length === 0) {
      return res.json([]);
    }

    // Construct Google API URL
    const destinationParams = validVolunteers.map(v => `${v.lat},${v.lng}`).join('|');
    const encodedDestinations = encodeURIComponent(destinationParams);

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${afiLat},${afiLng}&destinations=${encodedDestinations}&mode=driving&units=metric&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`;

    console.log("Google API Request URL:", url); // Debugging log

    // Call Google Distance Matrix API
    const response = await axios.get(url);
    console.log("Google API Response:", response.data); // Log API response
    console.log("Request URL:", url);

    // Handle potential Google API errors
    if (response.data.status !== 'OK') {
      return res.status(500).json({
        error: 'Google Maps API request failed',
        details: response.data
      });
    }

    // Process results
    const distances = response.data.rows[0].elements;
    const nearbyVolunteers = validVolunteers.map((volunteer, index) => {
      const element = distances[index];
      if (!element || element.status !== 'OK') return null;

      return {
        _id: volunteer._id,
        name: volunteer.name,
        location: volunteer.location,
        distance: Math.round(element.distance.value / 1000 * 10) / 10, // Convert to km
        duration: Math.round(element.duration.value / 60), // Convert to minutes
      };
    }).filter(Boolean);

    // Sort volunteers by distance (ascending)
    nearbyVolunteers.sort((a, b) => a.distance - b.distance);
    res.json(nearbyVolunteers);
  } catch (err) {
    console.error('Error retrieving nearby volunteers:', err);
    res.status(500).json({ error: 'Failed to retrieve nearby volunteers', details: err.message });
  }
};



module.exports = { getDashboardStats, approveVolunteer, rejectVolunteer, assignVolunteerToRequest, getNearbyVolunteers, declineAfiRequest };
