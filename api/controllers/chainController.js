import {
  getChainModel,
  getLocationModel,
  getHotelModel,
  getRestaurantModel
} from "../../utils/modelAdapter.js";

// Create a new chain
export const createChain = async (req, res) => {
  try {
    const { name, description, logo, website, contact } = req.body;
    
    // Check if chain with same name already exists
    const existingChain = await Chain.findOne({ name });
    if (existingChain) {
      return res.status(400).json({
        success: false,
        message: "Chain with this name already exists"
      });
    }
    
    // Create chain
    const chain = new Chain({
      name,
      description,
      logo,
      owner: req.user._id, // Assuming user is authenticated
      website,
      contact
    });
    
    await chain.save();
    
    return res.status(201).json({
      success: true,
      message: "Chain created successfully",
      data: chain
    });
  } catch (error) {
    console.error("Error creating chain:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating chain",
      error: error.message
    });
  }
};

// Get a chain by ID
export const getChain = async (req, res) => {
  try {
    const { chainId } = req.params;
    
    const chain = await Chain.findById(chainId)
      .populate("locations")
      .populate("hotels")
      .populate("restaurants");
    
    if (!chain) {
      return res.status(404).json({
        success: false,
        message: "Chain not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      data: chain
    });
  } catch (error) {
    console.error("Error fetching chain:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching chain",
      error: error.message
    });
  }
};

// Update a chain
export const updateChain = async (req, res) => {
  try {
    const { chainId } = req.params;
    const updates = req.body;
    
    // If updating name, check if it already exists
    if (updates.name) {
      const existingChain = await Chain.findOne({ 
        name: updates.name,
        _id: { $ne: chainId }
      });
      
      if (existingChain) {
        return res.status(400).json({
          success: false,
          message: "Chain with this name already exists"
        });
      }
    }
    
    // Update chain
    const chain = await Chain.findByIdAndUpdate(
      chainId,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!chain) {
      return res.status(404).json({
        success: false,
        message: "Chain not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Chain updated successfully",
      data: chain
    });
  } catch (error) {
    console.error("Error updating chain:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating chain",
      error: error.message
    });
  }
};

// Delete a chain
export const deleteChain = async (req, res) => {
  try {
    const { chainId } = req.params;
    
    const chain = await Chain.findById(chainId);
    
    if (!chain) {
      return res.status(404).json({
        success: false,
        message: "Chain not found"
      });
    }
    
    // Check if chain has locations, hotels, or restaurants
    if ((chain.locations && chain.locations.length > 0) || 
        (chain.hotels && chain.hotels.length > 0) || 
        (chain.restaurants && chain.restaurants.length > 0)) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete chain with associated locations, hotels, or restaurants"
      });
    }
    
    // Delete chain
    await Chain.findByIdAndDelete(chainId);
    
    return res.status(200).json({
      success: true,
      message: "Chain deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting chain:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting chain",
      error: error.message
    });
  }
};