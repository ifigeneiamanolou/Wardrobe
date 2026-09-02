class DatabaseError(Exception):
    pass

class DatabaseUnavailableError(DatabaseError):
    pass

class UserAlreadyExistsError(DatabaseError):
    pass