from pydantic import BaseModel
from typing import List

class WordCloudInput(BaseModel):
    texts: List[str]
