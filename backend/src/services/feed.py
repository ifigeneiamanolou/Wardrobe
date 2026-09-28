from math import cos

from pymongo import MongoClient
from src.exceptions.database import NoFriendshipsError
from src.models.pydantic import Outfit, ClothingItem
from src.config.conf import NAMED_COLORS, NAMED_CATEGORIES, INTERACTION_WEIGHTS
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler, MultiLabelBinarizer
from src.services.database import (save_interaction, fetch_item_feature_vector, fetch_user_profile_vector, 
                                   update_recommendations, fetch_user_recommendations, fetch_friend_profiles,
                                   update_recommendations_batch)
from sklearn.decomposition import PCA
import scipy.sparse as sp
from sklearn.metrics.pairwise import cosine_similarity
import asyncio
from datetime import datetime

vectorizer = TfidfVectorizer()      # Term frequency-inverse document frequency
MAX_ITEMS = 4

def create_feature_vector(outfit : Outfit):
    """ Generate a feature vector for an outfit 

    Args:
        outfit (Outfit): outfit for which to create feature vector
        descriptions (list[str]) : all description in the database
    """
    scaler = MinMaxScaler()     # Normalizer

    # Parse the description based on existing corpus
    description = vectorizer.transform([outfit.description])

    # Perform dimensionality reduction using PCA (requires a dense matrix)
    pca_tfidf = PCA(n_components=2)
    tfidf_compressed = pca_tfidf.transform(description.todense()).ravel()

    # Parse the number of items
    number_items = len(outfit.items) / MAX_ITEMS

    # Parse the colors in the outfit
    binarizer = MultiLabelBinarizer(classes = list(NAMED_COLORS.keys()))
    colors = binarizer.fit_transform(
        [[item.color] for item in outfit.items]
    ).ravel()       # (N + 1) * M with N number of items and M number of colors

    # Parse the categories in the outfit
    binarizer = MultiLabelBinarizer(classes = list(NAMED_CATEGORIES))
    categories = binarizer.fit_transform(
        [[item.category] for item in outfit.items]
    ).ravel()

    # Parse the price of the outfit
    prices = np.zeros((len(outfit.items), ))
    for index, item in enumerate(outfit.items):
        prices.put(index, float(str(item.price).replace(",", "")))
    total_price = np.sum(prices).item()
    
    # Normalize the price between 0 and 1
    total_price_string = str(total_price)
    whole_price = float(total_price_string.replace("$", "").replace(",", ""))
    if whole_price != 0:
        normalized_price = scaler.fit_transform(np.array(whole_price).reshape(-1, 1))

    # Combine the price, number of items, category and color in a sparse matrix
    return np.concatenate([categories, colors, [normalized_price, number_items], description])

async def update_feed_daily(client : MongoClient):
    while True:
        await asyncio.sleep(60 * 60 * 24)     # Wait one full day

        # Find all active users

        # Find all outfits generated

        # Perform TF-IDF with the new context using fit_transform (new corpus)

        # Update all outfit feature vectors in the db

        # Iterate over each active user

        # Pull all interactions

        # Build the user profile vectors

        # Update the profile vectors in the db

        # Use cosine similarity to score outfits

        # Order the outfits using the score above

        # Update the entry with the ordered outfits for the given user

def apply_weight(vector : np.ndarray, weight : int, created_at : datetime, decay : float = 0.95):
    daysDifference = (datetime.now() - created_at).days
    vector = weight * (decay ** daysDifference) * vector
    return vector       # weighted

async def on_item_create(user_id : int, client : MongoClient, outfit : Outfit):
    # Compute the feature vector of the outfit
    feature_vector = create_feature_vector(outfit).reshape(1, -1)          

    # Fetch the profiles of the friends
    friend_profiles = [f for f in await fetch_friend_profiles(client, user_id) if f.get("profile")]
    if not friend_profiles:
        return
        
    profiles = np.array([f.get('profile') for f in friend_profiles])
    user_ids = [f.get('user_id') for f in friend_profiles]

    # Score the outfit vector against the above profile vectors
    scores = cosine_similarity(profiles, feature_vector)[:, 0]

    # Update the recommendations of the friends
    await update_recommendations_batch(client, user_ids, scores.tolist(), outfit._id)
    
    return feature_vector

async def update_interaction(user_id : int, item_id : int, interaction_type : str, client : MongoClient):
    # Raise a value error if needed
    if interaction_type not in INTERACTION_WEIGHTS.keys():
        raise ValueError("Interaction type is invalid!")

    try:
        # Store the interaction in the db
        await save_interaction(
            user_id, 
            item_id, 
            interaction_type, 
            client, 
            INTERACTION_WEIGHTS.get(interaction_type)
        )

        # Extract the item's precomputed vector
        feature_vector, created_at = await fetch_item_feature_vector(client, item_id)

        # Compute and factor in the interaction date
        weighted_feature_vector = apply_weight(
            np.array(feature_vector), 
            INTERACTION_WEIGHTS.get(interaction_type), 
            created_at
        )
        
        # Extract the user profile vector or create a new one with zeros
        profile_vector = await fetch_user_profile_vector(client, user_id)
        if not profile_vector:
            profile_vector = np.zeros_like(feature_vector)
        
        # Add the new interaction's weighted vector 
        updated_profile_vector = profile_vector + weighted_feature_vector

        # Rescore the outfits against the cached candidate set
        old_recommendations = await fetch_user_recommendations(client, user_id)
        scores = cosine_similarity(old_recommendations, updated_profile_vector)[:, 0]
        recommendation_list = [{"item_id" : item_id_key, "score" : score} for item_id_key, score in zip(old_recommendations, scores)]
        ranked_tuples = sorted(recommendation_list, key = lambda x : x['score'], reverse = True)[:100]
        
        # Update the user recommendations table
        await update_recommendations(client, user_id, ranked_tuples, updated_profile_vector)
    except Exception as e:
        raise           # Raise the exception to be caught in the endpoint
