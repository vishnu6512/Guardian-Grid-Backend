const Volunteer = require('../models/userModel'); // Assuming Volunteer model is defined
const afi = require('../models/requestModel');
exports.getVolunteerStatus = async (req, res) => {
    const volunteerId = req.params.id;
    try {
        const volunteer = await Volunteer.findById(volunteerId);
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }
        res.json({ status: volunteer.status, id:volunteer._id }); // Sends back status: "approved" or "declined"
    } catch (error) {
        res.status(500).json({ error: 'Failed to get volunteer status' });
    }
};

exports.getAssignedAFIs = async(req,res)=>{
    const volunteerId = req.params.id;
    try {
        const volunteer = await Volunteer.findById(volunteerId);
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }
        const assignedAFIs = await afi.find({ assignedTo: volunteerId, status: 'assigned' });
        res.json(assignedAFIs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get assigned AFIs' });
    }
}