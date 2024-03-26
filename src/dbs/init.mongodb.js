const mongoose = require('mongoose');
const {
  db: { host, name, port },
} = require('../configs/config.mongdb');

const { countConnect } = require('../helpers/check.connect');

const connectString = `mongodb://${host}:${port}/${name}`;

console.log(`connectString`, connectString);

class Database {
  constructor() {
    this.connect();
  }

  // connect
  connect(type = 'mongodb') {
    if (true) {
      mongoose.set('debug', true);
      mongoose.set('debug', { color: true });
    }
    // if phia tren de biet ket qua cua cac req den db, vi du
    //     Mongoose: Shops.createIndex({ email: 1 }, { unique: true, background: true })
    // Mongoose: Apikeys.createIndex({ key: 1 }, { unique: true, background: true })

    mongoose
      .connect(connectString, {
        maxPoolSize: 50,
      })
      .then((_) => {
        countConnect();
        console.log(`Connected Mongodb Success Pro`);
      })
      .catch((err) => console.log(`Error Connect`));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
