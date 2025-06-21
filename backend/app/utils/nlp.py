import yake

def extract_keywords(text: str, num_keywords: int = 5) -> list:
    kw_extractor = yake.KeywordExtractor(lan="en", n=1, top=num_keywords)
    keywords = kw_extractor.extract_keywords(text)
    return [kw for kw, _ in keywords]