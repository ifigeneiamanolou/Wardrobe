# Developer instructions

The backend is managed using poetry. To start the FastAPI server following these steps:

1. Redirect to the backend folder

   ```bash
   cd backend
   ```


2. Create a virtual environment

   ```bash
   poetry env activate
   ```

2. Copy and paste the link given when running the above command

3. Install the necessary dependancies

   ```bash
   poetry install
   ```

4. Redirect to the right folder

   ```bash
   cd src/routes
   ```

5. Run the server

   ```bash
   py main.py
   ```

The server runs locally on port 8000. 

# Redis

Redis is used to cache JTI (JWT ids) to invalidate the JWT tokens used for authentication in the following scenarios:
1) the user logs out
2) the user changes their password
3) password compromise occurs

This is implemented using a Python redis client, which is a Python redis library allowing the application to communicate with a redis server. The latter runs locally on port 7865.