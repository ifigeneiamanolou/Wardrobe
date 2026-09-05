# Overview

This project constists of a user-friendly personal wardrobe mobile application. The user is able to create a personal account and log in the application. After that, any wardrobe item can be scanned and placed in the app, with the additional option to generate outfits using the above items. Additional features of the application include:

* A library of outfits
* Clothes recommendation based on the current wardrobe
* Social features (sharing outfits with friends in the form of a picture feed)

## Technology stack

For the frontend the following are used:
* React Native 
* Typescript
* Tailwind CSS
* Expo

For the backend the following are used:
* Redis for caching
* Python
* FastaAPI for communicating between the frontend and the backend
* MongoDB database
* AWS S3 for the memory heavy items, such as pictures

The application is containerized fully using Docker. Instructions on running the application can be found in the "frontend" and "backend" folders of this repository

## Frontend features
1) Custom animations and draggable elements using react-native-reanimated and react-gesture-handler to display pop ups and create outfits
2) All routes are protected using an authentication context and a custom hook, storing all sensitive user information in expo-secure-store
3) Custom consistent color pallette applied in the app
4) Custom splash screen displayed when the frontend waits for a backend operation to finish such as an image upload
5) Dynamic loading of stored outfits/items using the XMLHttpRequest object

## Backend features
1) Authentication using JWT tokens, password hashing and cached JTI IDs in Redis, along with a token version key in the database to handle password changes and credentials compromises
2) Custom CNN build using Torch to categorize input clothing items in 10 distinct categories trained using FashionMNIST
3) Primary color detection of input clothes using the K-means algorithm and K-dimensional trees for RGB to label mapping
4) Robust error handling with custom exceptions and centralized logging to avoid crashing the frontend
5) Redis used for storing both for JTI IDs and all expensive functions' results through a custom function decorator
6) Looping connection to the MongoDB database with exponential backoff
7) Centralized configuration files for easier development
