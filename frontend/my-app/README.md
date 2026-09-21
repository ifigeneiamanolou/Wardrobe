# Development instructions
Ensure node and npm are installed:

   ```bash
   node -v
   npm -v
   ```

To install all dependancies run:

   ```bash
   npm install
   ```

To start a development server run:

   ```bash
   npx expo start
   ```

The app can be previewed using Expo Go (built for Expo 57).

# to do
1) centralize all exceptions coming from the backend
2) fix the boundaries in the drag and drop (some what working) and the pan/pinch gestures
3) fix the permissions (prompted once on log in if not accepted -> settings -> read external storage -> checks !)
4) fix the metadata on the outfit page and make a view/edit feature
5) add constraints on outfits created (ie only 1 shirt etc)
6) make the android build -> google and apple login 
7) Make a feature of viewing only the liked items
8) Make the feed
9) Add username on outfit when something is saved from the feed 

# plus 
1) activate redis for all heavy tasks
2) containers with docker
3) set up ci/cd
4) fix documentation
