import { getLocationModel, getChainModel } from "../../utils/modelAdapter.js";

// Create a new location
export const createLocation = async (req, res) => {
  try {
    const { name, address, city, state, country, coordinates, chain } = req.body;
    
    // Create location
    const location = new Location({
      name,
      address,
      city,
      state,
      country,
      coordinates,
      chain
    });
    
    await location.save();
    
    // If chain is provided, add this location to the chain
    if (chain) {
      await Chain.findByIdAndUpdate(chain, {
        $push: { locations: location._id }
      });
    }
    
    return res.status(201).json({
      success: true,
      message: "Location created successfully",
      data: location
    });
  } catch (error) {
    console.error("Error creating location:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating location",
      error: error.message
    });
  }
};

// Get a location by ID
export const getLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    
    const location = await Location.findById(locationId)
      .populate("chain")
      .populate("hotels")
      .populate("restaurants");
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      data: location
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching location",
      error: error.message
    });
  }
};

// Update a location
export const updateLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const updates = req.body;
    
    const location = await Location.findById(locationId);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found"
      });
    }
    
    // If changing chain
    if (updates.chain && updates.chain !== location.chain.toString()) {
      // Remove from old chain if exists
      if (location.chain) {
        await Chain.findByIdAndUpdate(location.chain, {
          $pull: { locations: location._id }
        });
      }
      
      // Add to new chain
      await Chain.findByIdAndUpdate(updates.chain, {
        $push: { locations: location._id }
      });
    }
    
    // Update location
    const updatedLocation = await Location.findByIdAndUpdate(
      locationId,
      updates,
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: updatedLocation
    });
  } catch (error) {
    console.error("Error updating location:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating location",
      error: error.message
    });
  }
};

// Delete a location
export const deleteLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    
    const location = await Location.findById(locationId);
    
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found"
      });
    }
    
    // Check if location has hotels or restaurants
    if ((location.hotels && location.hotels.length > 0) || 
        (location.restaurants && location.restaurants.length > 0)) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete location with associated hotels or restaurants"
      });
    }
    
    // Remove from chain if exists
    if (location.chain) {
      await Chain.findByIdAndUpdate(location.chain, {
        $pull: { locations: location._id }
      });
    }
    
    // Delete location
    await Location.findByIdAndDelete(locationId);
    
    return res.status(200).json({
      success: true,
      message: "Location deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting location:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting location",
      error: error.message
    });
  }
};