// In-memory storage for development/testing when MongoDB is not available
class InMemoryUserStore {
  constructor() {
    this.users = [];
    this.nextId = 1;
  }

  async findOne(query) {
    if (query.email) {
      return this.users.find(user => user.email === query.email) || null;
    }
    if (query._id) {
      return this.users.find(user => user.id === query._id) || null;
    }
    return null;
  }

  async findById(id) {
    return this.users.find(user => user.id === id) || null;
  }

  async save(userData) {
    const newUser = {
      id: this.nextId++,
      _id: this.nextId - 1,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Generate digital ID if not exists
    if (!newUser.digitalId) {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      newUser.digitalId = `TID${timestamp}${random}`;
    }

    this.users.push(newUser);
    return newUser;
  }

  async create(userData) {
    return this.save(userData);
  }

  getAllUsers() {
    return this.users;
  }
}

module.exports = new InMemoryUserStore();
