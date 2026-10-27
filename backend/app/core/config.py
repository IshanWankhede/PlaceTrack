from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "PlaceTrack API"
    api_v1_prefix: str = "/api/v1"

    database_url: str = "postgresql+psycopg2://placetrack:placetrack_pass@db:5432/placetrack_db"

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    cors_origins: str = "http://localhost:5173"

    smtp_host: str = "mailpit"
    smtp_port: int = 1025
    mail_from: str = "no-reply@placetrack.local"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
