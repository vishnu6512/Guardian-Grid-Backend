const Volunteer = require('../models/userModel'); // Assuming Volunteer model is defined
const afi = require('../models/requestModel');
exports.getVolunteerStatus = async (req, res) => {
    const volunteerId = req.params.id;
    try {
        const volunteer = await Volunteer.findById(volunteerId);
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }
        res.json({ name: volunteer.name, status: volunteer.status, id: volunteer._id }); // Sends back status: "approved" or "declined"
    } catch (error) {
        res.status(500).json({ error: 'Failed to get volunteer status' });
    }
};

exports.getAssignedAFIs = async (req, res) => {
    const volunteerId = req.params.id;
    const { status } = req.query; // Accept status from query params

    try {
        const volunteer = await Volunteer.findById(volunteerId);
        if (!volunteer) {
            return res.status(404).json({ message: 'Volunteer not found' });
        }

        // Fetch only the assignments with the given status ("assigned" or "In Progress")
        const assignedAFIs = await afi.find({
            assignedTo: volunteerId,
            status: status // status is dynamic based on query parameter
        });

        res.json(assignedAFIs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get assigned AFIs' });
    }
};

exports.updateAssignmentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;  // Extract status from request body
    try {
        const assignment = await afi.findById(id);
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        if (assignment.status === 'Completed') {
            return res.status(400).json({ message: 'Assignment is already completed' });
        }
        assignment.status = status;  // Set status dynamically
        await assignment.save();
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
