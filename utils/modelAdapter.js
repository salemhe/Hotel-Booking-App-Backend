
// Export a function that can be used to safely import models
export const getModel = async (modelName) => {
  try {
    // Try to import using direct require
    let model;
    
    switch (modelName) {
      case 'Hotel':
        model = require('../models/Hotel');
        break;
      case 'Reservation':
        model = require('../models/Reservation');
        break;
      case 'Chain':
        model = require('../models/Chain');
        break;
      case 'Location':
        model = require('../models/Location');
        break;
      case 'Restaurant':
        model = require('../models/Restaurant');
        break;
      case 'Order':
        model = require('../models/Order');
        break;
      case 'User':
        model = require('../models/User');
        break;
      default:
        throw new Error(`Unknown model: ${modelName}`);
    }
    
    // If the import worked, return the model
    if (model) return model;
    
    // If the import didn't work, try a fallback approach
    const mongoose = require('mongoose');
    return mongoose.model(modelName);
  } catch (error) {
    console.error(`Error importing model ${modelName}:`, error);
    throw error;
  }
};

// Export each model directly for convenience
export const getHotelModel = () => getModel('Hotel');
export const getReservationModel = () => getModel('Reservation');
export const getChainModel = () => getModel('Chain');
export const getLocationModel = () => getModel('Location');
export const getRestaurantModel = () => getModel('Restaurant');
export const getOrderModel = () => getModel('Order');
export const getUserModel = () => getModel('User');