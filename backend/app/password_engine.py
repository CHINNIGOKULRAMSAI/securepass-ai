import math
import re

COMMON_PASSWORDS = [
    "password",
    "123456",
    "admin123",
    "qwerty"
]


def entropy(password):

    charset = 0

    if re.search(r'[a-z]', password):
        charset += 26

    if re.search(r'[A-Z]', password):
        charset += 26

    if re.search(r'[0-9]', password):
        charset += 10

    if re.search(r'[^A-Za-z0-9]', password):
        charset += 32

    if charset == 0:
        return 0

    return round(len(password) * math.log2(charset), 2)


def lrs(s):

    n = len(s)

    dp = [[0]*(n+1) for _ in range(n+1)]

    for i in range(1, n+1):

        for j in range(1, n+1):

            if s[i-1] == s[j-1] and i != j:

                dp[i][j] = 1 + dp[i-1][j-1]

            else:

                dp[i][j] = max(dp[i-1][j], dp[i][j-1])

    return dp[n][n]


def sequential(password):

    patterns = [
        "123456789",
        "abcdefghijklmnopqrstuvwxyz"
    ]

    password = password.lower()

    for pattern in patterns:

        for i in range(len(pattern)-2):

            if pattern[i:i+3] in password:
                return True

    return False


def analyze_password(password):

    result = {

        "length": len(password),

        "entropy": entropy(password),

        "lrs": lrs(password),

        "sequential": sequential(password),

        "uppercase": sum(1 for c in password if c.isupper()),

        "lowercase": sum(1 for c in password if c.islower()),

        "digits": sum(1 for c in password if c.isdigit()),

        "symbols": sum(1 for c in password if not c.isalnum())

    }

    return result