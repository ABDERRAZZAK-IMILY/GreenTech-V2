import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api/v1/marketplace';
// const API_URL = process.env.REACT_APP_API_URL + '/v1/marketplace';

class MarketplaceService {
  
  // Get authorization header with token
  getAuthHeader() {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // ============ PRODUCTS ============
  
  // Get all products (active only - for regular users)
  async getAllProducts() {
    try {
      const response = await axios.get(`${API_URL}/products`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get all products including inactive (for Admin)
  async getAllProductsAdmin() {
    try {
      const response = await axios.get(`${API_URL}/products/admin/all`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all products for admin:', error);
      throw error;
    }
  }

  // Get product by ID
  async getProductById(productId) {
    try {
      const response = await axios.get(`${API_URL}/products/${productId}`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(category) {
    try {
      const response = await axios.get(`${API_URL}/products/category/${category}`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  // Admin: Create product
  async createProduct(productData) {
    try {
      const response = await axios.post(`${API_URL}/products`, productData, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Admin: Update product
  async updateProduct(productId, productData) {
    try {
      const response = await axios.put(`${API_URL}/products/${productId}`, productData, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Admin: Delete product
  async deleteProduct(productId) {
    try {
      await axios.delete(`${API_URL}/products/${productId}`, {
        headers: this.getAuthHeader()
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // ============ ORDERS ============

  // Create an order (purchase a product)
  async createOrder(orderData) {
    try {
      const response = await axios.post(`http://localhost:8080/api/v1/marketplace/orders`, orderData, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Admin: Get all orders
  async getAllOrders() {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/marketplace/orders`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  }

  // Get order by ID
  async getOrderById(orderId) {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/marketplace/orders/${orderId}`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Get user's orders
  async getUserOrders(userId) {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/users/${userId}/orders`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  // Get current user's orders
  async getMyOrders() {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/marketplace/my-orders`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching my orders:', error);
      throw error;
    }
  }

  // Admin: Update order status
  async updateOrderStatus(orderId, status) {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/v1/marketplace/orders/${orderId}/status`,
        { status },
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
}

export default new MarketplaceService();
