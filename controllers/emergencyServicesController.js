const axios = require('axios');

// Controller for handling emergency services requests
const emergencyServicesController = {
  /**
   * Get nearby emergency services based on location and types
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getNearbyServices: async (req, res) => {
    try {
      const { lat, lng, types } = req.params;
      
      // Validate inputs
      if (!lat || !lng) {
        return res.status(400).json({ 
          success: false, 
          message: "Latitude and longitude are required" 
        });
      }
      
      // Default to hospitals, police, and fire stations if types not specified
      const serviceTypes = types || 'hospital|police|fire_station';
      
      // Make request to Google Places API
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
        {
          params: {
            location: `${lat},${lng}`,
            radius: 5000, // 5km radius
            type: serviceTypes,
            key: process.env.VITE_GOOGLE_MAPS_API_KEY
          }
        }
      );
      
      // Format the response data
      const services = response.data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        location: place.geometry.location,
        type: place.types[0],
        rating: place.rating,
        open: place.opening_hours ? place.opening_hours.open_now : null,
        photo: place.photos && place.photos.length > 0 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`
          : null
      }));
      
      return res.status(200).json({
        success: true,
        count: services.length,
        data: services
      });
      
    } catch (error) {
      console.error('Error fetching emergency services:', error);
      
      return res.status(500).json({
        success: false,
        message: "Error fetching nearby emergency services",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

module.exports = emergencyServicesController;