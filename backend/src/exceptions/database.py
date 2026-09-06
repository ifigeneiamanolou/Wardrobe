class DatabaseError(Exception):
    pass

class DatabaseUnavailableError(DatabaseError):
    pass

class UserAlreadyExistsError(DatabaseError):
    pass

class ItemExists(DatabaseError):
    pass

class PasswordIsIdentical(DatabaseError):
    pass