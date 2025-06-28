import {
  getHotelModel,
  getRestaurantModel,
  getReservationModel,
  getOrderModel,
  getChainModel,
  getLocationModel
} from "../../utils/modelAdapter.js";

// Get all locations/chains for super admin dashboard
export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find({})
      .populate('chain')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching locations',
      error: error.message
    });
  }
};

// Get all chains (restaurant/hotel chains)
export const getAllChains = async (req, res) => {
  try {
    const chains = await Chain.find({})
      .populate('locations')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: chains.length,
      data: chains
    });
  } catch (error) {
    console.error('Error fetching chains:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching chains',
      error: error.message
    });
  }
};

// Get vendor analytics (combined for restaurants and hotels)
export const getVendorAnalytics = async (req, res) => {
  try {
    // Get all restaurants with their orders
    const restaurants = await Restaurant.find({});
    
    // Get all hotels with their reservations
    const hotels = await Hotel.find({});
    
    // Get all orders
    const orders = await Order.find({});
    
    // Get all reservations
    const reservations = await Reservation.find({});
    
    // Calculate analytics for restaurants
    const restaurantAnalytics = restaurants.map(restaurant => {
      const restaurantOrders = orders.filter(order => 
        order.restaurant && order.restaurant.toString() === restaurant._id.toString()
      );
      
      const totalRevenue = restaurantOrders.reduce((sum, order) => 
        sum + (order.totalAmount || 0), 0
      );
      
      return {
        id: restaurant._id,
        name: restaurant.name,
        type: 'restaurant',
        location: restaurant.location?.city || 'Unknown',
        orders: restaurantOrders.length,
        revenue: totalRevenue,
        isActive: restaurant.isActive || true
      };
    });
    
    // Calculate analytics for hotels
    const hotelAnalytics = hotels.map(hotel => {
      const hotelReservations = reservations.filter(reservation => 
        reservation.hotel && reservation.hotel.toString() === hotel._id.toString()
      );
      
      const totalRevenue = hotelReservations.reduce((sum, reservation) => 
        sum + (reservation.totalAmount || 0), 0
      );
      
      return {
        id: hotel._id,
        name: hotel.name,
        type: 'hotel',
        location: hotel.location?.city || 'Unknown',
        reservations: hotelReservations.length,
        revenue: totalRevenue,
        isActive: hotel.isActive || true
      };
    });
    
    // Combine analytics
    const vendorAnalytics = [...restaurantAnalytics, ...hotelAnalytics];
    
    // Calculate overall summary
    const summary = {
      totalVendors: vendorAnalytics.length,
      activeVendors: vendorAnalytics.filter(v => v.isActive).length,
      totalRevenue: vendorAnalytics.reduce((sum, vendor) => sum + vendor.revenue, 0),
      totalBookings: vendorAnalytics.reduce((sum, vendor) => {
        return sum + (vendor.type === 'hotel' ? vendor.reservations : vendor.orders);
      }, 0)
    };
    
    return res.status(200).json({
      success: true,
      summary,
      data: vendorAnalytics
    });
  } catch (error) {
    console.error('Error fetching vendor analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching vendor analytics',
      error: error.message
    });
  }
};

// Get detailed analytics for a specific vendor
export const getVendorDetails = async (req, res) => {
  const { vendorId } = req.params;
  const { vendorType } = req.query;
  
  try {
    let vendorData;
    
    if (vendorType === 'restaurant') {
      vendorData = await Restaurant.findById(vendorId)
        .populate('orders')
        .populate('reviews');
    } else if (vendorType === 'hotel') {
      vendorData = await Hotel.findById(vendorId)
        .populate('reservations')
        .populate('reviews')
        .populate('rooms');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid vendor type specified'
      });
    }
    
    if (!vendorData) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: vendorData
    });
  } catch (error) {
    console.error(`Error fetching ${vendorType} details:`, error);
    return res.status(500).json({
      success: false,
      message: `Error fetching ${vendorType} details`,
      error: error.message
    });
  }
};

// Get revenue overview for time-based analytics
export const getRevenueAnalytics = async (req, res) => {
  const { timeframe = 'monthly', year = new Date().getFullYear() } = req.query;
  
  try {
    let restaurantRevenue = [];
    let hotelRevenue = [];
    
    if (timeframe === 'monthly') {
      // For restaurant revenue, using Orders
      const orders = await Order.find({
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        },
        status: 'completed'
      });
      
      // For hotel revenue, using Reservations
      const reservations = await Reservation.find({
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        },
        status: 'confirmed'
      });
      
      // Process restaurant revenue by month
      const restaurantRevenueByMonth = new Array(12).fill(0);
      orders.forEach(order => {
        const month = order.createdAt.getMonth();
        restaurantRevenueByMonth[month] += order.totalAmount || 0;
      });
      
      // Process hotel revenue by month
      const hotelRevenueByMonth = new Array(12).fill(0);
      reservations.forEach(reservation => {
        const month = reservation.createdAt.getMonth();
        hotelRevenueByMonth[month] += reservation.totalAmount || 0;
      });
      
      // Format the response
      restaurantRevenue = restaurantRevenueByMonth.map((revenue, index) => ({
        month: index + 1,
        revenue
      }));
      
      hotelRevenue = hotelRevenueByMonth.map((revenue, index) => ({
        month: index + 1,
        revenue
      }));
    } else if (timeframe === 'weekly') {
      // Weekly revenue implementation (simplified version)
      // In a real app, you would calculate by week of year
      restaurantRevenue = [
        { week: 1, revenue: 0 },
        { week: 2, revenue: 0 },
        // and so on...
      ];
      
      hotelRevenue = [
        { week: 1, revenue: 0 },
        { week: 2, revenue: 0 },
        // and so on...
      ];
    } else if (timeframe === 'daily') {
      // Daily revenue implementation (simplified version)
      // In a real app, you would calculate for the last 30 days for example
      restaurantRevenue = [
        { day: 1, revenue: 0 },
        { day: 2, revenue: 0 },
        // and so on...
      ];
      
      hotelRevenue = [
        { day: 1, revenue: 0 },
        { day: 2, revenue: 0 },
        // and so on...
      ];
    }
    
    return res.status(200).json({
      success: true,
      timeframe,
      year,
      data: {
        restaurants: restaurantRevenue,
        hotels: hotelRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching revenue analytics',
      error: error.message
    });
  }
};