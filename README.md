# Overview

This project constists of a user-friendly personal wardrobe mobile application. The user is able to create a personal account and log in the application. After that, any wardrobe item can be scanned and placed in the app, with the additional option to generate outfits using the above items. Additional features of the application include a library of outfits and clothing item and social features (sharing outfits with friends in the form of a picture feed).

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

The application is containerized fully using Docker.

## Frontend features
1) Custom animations and draggable elements using react-native-reanimated and react-gesture-handler to display pop ups and create outfits in a drag-and-drop fashion
2) All routes are protected using an authentication context and a custom hook, storing all sensitive user information in expo-secure-store
3) Custom consistent color pallette applied in the app
4) Custom splash screen displayed when the frontend waits for a lengthy backend operation to finish such as an image upload
5) Dynamic loading of stored outfits/items using the expo Fetch API
6) All forms are built using Formik and validated using Yup 
7) Simplified push notifications via Expo instead of Firebase Cloud Messaging (FCM)

## Backend features
1) Authentication using JWT tokens, password hashing and cached JTI IDs in Redis, along with a token version key in the database to handle password changes and credentials compromises
2) Custom CNN build using Torch to categorize input clothing items in 10 distinct categories trained using FashionMNIST
3) Primary color detection of input clothes using the K-means algorithm and K-dimensional trees for RGB to label mapping
4) Robust error handling with custom exceptions and centralized logging to avoid crashing the frontend
5) Redis used for storing both for JTI IDs and all expensive functions' results through a custom function decorator
6) Looping connection to the MongoDB database with exponential backoff
7) Centralized configuration files for easier development

## Development instructions

The application is build into 2 main components; the frontend and the backend. The latter includes the uvicorn server (port 8000), the MongoDB database (port 27017) and the redis server (port 6379), and is containerized using Docker. However, the frontend is build specifically for mobile devices, which means that Docker containers are not suitable. Given that it contains native modules for features, like Expo push notifications and Google sign-in, Expo Go is not suitable for development and testing. Instead an EAS build is needed. To contribute in this project follow these instructions:

1. Clone the repo

```bash
git clone https://github.com/ifigeneiamanolou/Wardrobe.git ./Wardrobe
cd Wardrobe/frontend/my-app
npm install
```

2. Start the backend container

```bash
cd ../../backend
docker compose up --build
```

To check if the backend server is healthy, run:

```bash
curl http://localhost:8000/health
```

3. Create or fetch a development build of the frontend application.

Option A: Download the app using the link to the latest EAS build 
(https://expo.dev/accounts/ifigeneiamanolou/projects/my-app/builds/b7a1cc0a-619e-4646-b506-258d8879e934). To access this build contact at 
ifigeneiamanolou26@gmail.com. 

Option B: Make a new development build. This requires access to private keys, such as firebase credentials. To access these and make a proper build
* Email ifigeneiamanolou26@gmail.com to be added to the EAS project
* Run `eas login` without your EAS details
* Make the build using:

```bash
cd ../../frontend/my-app
eas build --profile development --platform android
```

Option C: Make your own credentials
*

Note that a new build is not needed every time changes are made in the src folder. However, if files like app.json, package.json or package-lock.json, or files related to the metro bundler or Babel, a new build is needed for those to be reflected.

4. Start the frontend server

```bash
npx expo start
```

5. Connect the backend with the frontend, by altering frontend/my-app/constants/app.ts to include the public IP where the Uvicorn server is running.

6. Set up .env files in the root of the project, as well as the frontend folder, according to the .env.example files

7. After creating an AWS S3 bucket change the name and the region of the bucket in the backend/config/conf.py file



