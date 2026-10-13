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

The application is build into 2 main components; the frontend and the backend. The latter includes the uvicorn server (port 8000), the MongoDB database (port 27017) and the redis server (port 6379), and is containerized using Docker. However, the frontend is build specifically for mobile devices, which means that Docker containers are not suitable. Given that it contains native modules for features, like Expo push notifications and Google sign-in, Expo Go is not suitable for development and testing. Instead an EAS development build is needed to test these features. To contribute in this project, you can either use Docker containers for the backend or run the Uvicorn server directly.

1. Clone the repo

```bash
git clone https://github.com/ifigeneiamanolou/Wardrobe.git ./Wardrobe
cd Wardrobe/frontend/my-app
npm install
```

2. Create an AWS S3 bucket by following the steps below

* Create an AWS free tier account
* Navigate to the AWS management console and then to S3 > Buckets > Create bucket
* Disable block of external access temporarily 
* Change the name and the region of the bucket in the backend/WardrobeBackend/config/conf.py file

3. Start the backend container

```bash
cd ../../backend
docker compose up --build
```

To check if the backend server is healthy, run:

```bash
curl http://localhost:8000/health
```

Alternatively, start the Uvicorn server, the mongoDB database and the Redis server directly, by following the steps below:

* Start a redis server locally following the official tutorial (https://redis.io/docs/latest/operate/oss_and_stack/install/archive/install-redis/) and update the environment variables in the ".env" file in the root directory, following the ".env.example" file

* Create a mongoDB account and create a cluster named "Wardrobe". Make sure that your computer's IP address is included in the IP access list and that all the essential environment variables are present in the ".env" file in the root directory. You can use the ".env.example" file to make sure the appropriate environment variables have been included 

* Start the backend Uvicorn server by running (ensure pipx and python are installed first):

```bash
cd backend/src/WardrobeBackend/routes
pipx install poetry 
poetry install 
poetry env activate 
py main.py
``` 

4. Update the IP address of the backend server in the frontend/my-app/constants/my-app.ts file (instructions on how to find it can be found in that file)

5. Create or fetch a development build of the frontend application.

**Option A:** Download the app using the link to the latest EAS build (https://expo.dev/accounts/ifigeneiamanolou/projects/my-app/builds/b7a1cc0a-619e-4646-b506-258d8879e934). To access this build contact at ifigeneiamanolou26@gmail.com. 

**Option B:** Make a new development build. This requires access to private keys, such as firebase credentials. To access these and make a proper build
* Email ifigeneiamanolou26@gmail.com to be added to the EAS project. Once you have been added to the project, the credentials are built in the application and you can run the project, along with the push notifications and google log in features without having to know the credentials themselves
* Run `eas login` and enter your EAS details when asked to
* Make a local development build using:

```bash
cd ../../frontend/my-app
eas build --profile development --platform android
```

**Option C:** Make your own credentials. This process consists of integrating Firebase in your project and creating OAuth credentials using the Google Cloud Console. These can be implemented, following the steps below:

* Open the Google Cloud Console to and create a new project
* Create an OAuth 2.0 Client ID with application type "Android", package name the one in app.json and SHA-1 fingerprint found using the "eas credentials" command
* Create an OAuth 2.0 Client ID with application type "Web"
* Register the application in Google Firebase Console and download the google-services.json and place it under the frontend/my-app folder
* In the console, open Project settings > Service accounts and click "Generate New Private Key".  This should be securely stored under frontend/my-app by naming it "firebaseCredentials.json", which is included in the frontend's folder ".gitignore" folder.
* Upload the JSON file to the EAS credentials to configure the app for Expo push notifications. This can be done using the EAS CLI by running "eas credentials" and selecting Android > production > Google Service Account > Manage your Google Service Account Key for Push Notifications (FCM V1) > Set up a Google Service Account Key for Push Notifications (FCM V1) > Upload a new service account key. The Expo CLI will automatically detected if the previous step was successful.

Note that a new build is not needed every time changes are made in the src folder. However, if files like app.json, package.json or package-lock.json, or files related to the metro bundler or Babel, a new build is needed for those to be reflected.

6. Start the frontend server either using your own development build or a premade one

```bash
npx expo start
```

You can then download the app in an Android device using the EAS dashboard with the account used to create the development build. Make sure that your mobile device and your computer are not in a public network, like a school or a company router, as this may not allow the EAS application in the mobile device to reach the server running in the laptop.


## Future developments
1) Add an initial quiz when signing up to the application to ensure the feed is customized when the user starts using it. Currently, when the user first creates an account, his profile is empty, since he hasn't interacted with any outfits. Thus, the feed is generated using their friends' most interacted items or is empty if they have no friends.
2) Add the ability to log in with Apple apart from Google
3) Replace Expo push notifications with native FCM notifications. The latter are more flexible, enabling us to give the user to accept a friend request using a button in the friend notification itself instead of having to open the app.
4) Integrate web scraping to recommend new clothing items to the user, with links that redirect him to the appropriate web page to buy those items.
5) Make a fully-functional comment section inside the "clothing items" feed.
6) Integrate Redis to the feed, to avoid having to fetch the entries from the "Recommendations" table every time the user opens the feed. Currently, Redis is used when loading outfits/items in the library page, the user profile, users to make a friend request, the user's friends and the user's saved outfits from the feed.

