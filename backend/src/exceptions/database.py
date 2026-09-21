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

class UserNotFound(DatabaseError):
    pass


class FriendshipNotFound(DatabaseError):
    pass

class NoRequestsError(DatabaseError):
    pass

class NoFriendshipsError(DatabaseError):
    pass

class EmailNotVerified(DatabaseError):
    pass