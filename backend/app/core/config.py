from pathlib import Path

class Settings:
    # Project structure
    ROOT_DIR: Path = Path(__file__).parent.parent.parent
    APP_DIR: Path = ROOT_DIR / "app"
    DATA_DIR: Path = ROOT_DIR / "data"

    # Output directories
    OUTPUT_EMBED_DIR: Path = DATA_DIR / "embedding"
    OUTPUT_EXTRACT_DIR: Path = DATA_DIR / "extracting"

    BACKEND_CORS_ORIGINS: list[str] = [
        "http://127.0.0.1:5500",
        "http://localhost:800",
        "https://dual-image-rdh.onrender.com",
    ]

settings = Settings()