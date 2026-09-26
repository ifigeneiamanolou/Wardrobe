# Creating a low-latency instagram-like feed of outfits

## Problems to solve
1) preloading : outfits loaded before the user navigates to the feed
2) memory management : keeping performance smooth with many outfits
3) cost optimization : avoid loading outfits the user will never watch

## Features of the feed
1) refresh
2) full screen vertical playback with swipe navigation
3) rendering that won't crach older devices
4) memory efficient loading
5) gesture optimization (double tap to like)

## What needs to be implemented
Building the above system requires 2 main components: a list that recycles components
efficiently, and a preloading strategy to reduce latency. Apart from keeping track
of the current index in the list and the direction, we need to implement:
* paging to not load too much data from the database
* a container for the outfit loaded
* overlay UI (buttons and description)
* gesture detector (double tap) for the like feature

## Loading method in the frontend
The final flashlist implemented does not load all outfits at once, instead it loads 
only a handful at a time and recycles them. Tracking where the user is headed and where he is in the list is also used in the recycling algorithm. More specifically, rather than preloading a fixed number of outfits in each page, using the direction tracked, 5 outfits are loaded in that direction and 1 in the opposite one.

## Why a flashlist over a regural flatlist?
Shopify's flashlist is prefered as Flatlist creates and destroys components as they appear, while flashlist recycles them, adding the props of the new component into the previous one,reducing the time needed to render them.

## Backend
The recommendation system used for the feed follows a 3-step process:
1) Retrieval => retrieves a batch of outfits from a database recently uploaded and 
setting a limit to the number of outfits to avoid crashing
2) Scoring and ranking => evaluate candidates using content based filtering
3) Filtering => order the outfits based on their features

The outfits are ranked based on the following criteria:
1) recency (when the outfit was created)
2) engagement : likes, saves, and comments on previous posts (compare the characteristiques of those posts with the ones to present to the user, such as items color, category, brand, description, overall price)
3) watch time of previous posts

### Type of recommendation system
More specifically, content based filtering (CBF) is used, where items are ranked based on their characteristiques (color, category, brand, price, descriptions). All these details are analyzed to make a user profile based on historical preferences (likes, saves and created outfits). Essentially, a feature vector is created for each outfit and one for each user profile based on the outfits created, liked or saved. Recommendations are then made by comparing the feature vectors of the outfits to display in the feed and of the user profile.

Pros:
1) avoid the cold start problem by adding a quiz in the beginning that will allow the backend to create an initial feature user vector
2) easy to explain to stakeholders

Cons:
1) Requires high quality item descriptions
2) Limited to capturing only explicit preferences

### Vector similarity algorithm
The most common algorithm to measure feature vector similarity (and the one used in this application) is cosine similariy. The latter measures the distance between two vectors in the vector space (the closer the value is to 1 the higher the similarity). It is applied to theangle between the two vectors measured in degress to produce a value between -1 and 1. 


### Glossary
There are 4 main components to content based filtering:

1) User matrix ==> A 2-dimensional matrix to keep track of all the users with each row corresponding to a single user. It displays all interactions of a given user with items and how strong that interaction was
2) Item matrix ==> the same as the user matrix but for items
3) User-Item matrix ==> Used before making a recommendation. It contains the preference of each user for each item after a matrix factorization process. It can be computed by taking the dot product of the item and the user matrix
4) Features ==> the numerical representations of the items and the users

### Mathematical Background of CBF
To perform content based filtering the following steps need to be followed:
1) Extract the user profile vector using the collection that contains all interactions (likes, saves and uploads of a user). This can be achieved by taking a weighted sum of the precomputed outfit feature vectors and normalizing it, to get a float point value for each feature, indicating how much a user deems that feature important. The weights for the sum are computed using the type of interaction and the date it was created (exponential decay).
2) Compare the user profile vector with each item vector using cosine similarity
3) Rank the vectors based on the above scores

### Extracting features from data
To convert the features of an outfit, such as description or price, the following pre-processing steps are needed:
1) Apply TF-IDF to the description
2) Scale the numeric price between 0-1
3) Encode the category and color fields using MultiLabelBinarizer (labels are fixed)
4) Encode the shop field

### Rotation strategy
The list of recommended items from the backend changes in the following cases:
1) An outfit is created ==> compute the outfit feature vector and add it in the db in the Outfits table
2) User interacts (like, saves etc) ==> Nudge the user's preferences without changing the outfits' feature matrix (only change the user profile vector)
3) Daily ==> recompute the the user profile vectors based on all present items without using the cached item matrix
In this way, when the user redirects to the feed page the only action that needs to occur in the database is fetch the ordered outfits using a list of ids stored in the User table.