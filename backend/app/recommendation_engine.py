
def generate_recommendations(features):

    suggestions = []

    if features["length"] < 10:
        suggestions.append("Increase password length")

    if features["uppercase"] == 0:
        suggestions.append("Add uppercase letters")

    if features["digits"] == 0:
        suggestions.append("Add numbers")

    if features["symbols"] == 0:
        suggestions.append("Add special characters")

    if features["sequential"]:
        suggestions.append("Avoid sequential patterns")

    return suggestions