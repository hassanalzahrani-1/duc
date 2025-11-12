from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    openai_api_key: str
    openai_model: str = "gpt-4o-mini"  # Faster and more cost-efficient model
    openai_base_url: str | None = None
    chroma_path: str = "./chroma_store"
    collection_name: str = "docs"
    chunk_size: int = 1500        # Increased from 1000 for more context per chunk
    chunk_overlap: int = 200        # Increased from 120 for better continuity
    max_context_docs: int = 6       # Increased from 4 to retrieve more relevant info
    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
