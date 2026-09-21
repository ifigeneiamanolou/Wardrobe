db = db.getSiblingDB("admin");
db.auth("rootUser", "rootPassword");

// Create an IAM role

// Create databases and collections needed
db = db.getSiblingDB("Authorisation");
db.createCollection('Users');
db.createCollection('Friendships');
db.createCollection('counters');
db = db.getSiblingDB('Clothing');
db.createCollection('Items');
db.createCollection('Outfits');
db.createCollection('Saved');
db = db.getSiblingDB('Notifications');
db.createCollection('Receipt_ids')