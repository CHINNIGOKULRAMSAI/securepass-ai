import hashlib


def password_hash(password):

    return hashlib.sha1(password.encode()).hexdigest()