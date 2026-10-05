// Extract the username and the password of the db user
const user = process.env.APP_DB_USER;
const password = process.env.APP_DB_PASSWORD;

// Raise an exception if the details have not been provided
if(!user || !password){
    throw new Error('User name or password does not exist!');
};

// Create all collections needed
const collections = {
    "Authorisation" : ["Users", "Friendships", "counters", "Comments"],
    "Clothing" : ["Items", "Outfits", "Saved", "Interactions", "Recommendations"],
    "Notifications" : ["Receipt_ids"]
}

collections.forEach((database) => {
    const target = db.getSiblingDb(database);
    database.forEach((collection) => {
        target.createCollection(collection);
    })
});

// Create a user
db.createUser({
   user: user,                  // User’s name
   pwd: password,               // User’s password
   roles: [                     // Roles assigned to the user
      { role: "readWrite", db: "Authorisation" },
      { role: "readWrite", db: "Clothing" },
      { role: "readWrite", db: "Notifications" }
   ]
})