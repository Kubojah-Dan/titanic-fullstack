import os
import sys

# Add the backend directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from alembic import context
from app.main import Base  # Adjust import based on your structure

# Alembic config object
config = context.config

# Logging setup (if present)
if config.config_file_name is not None:
    from logging.config import fileConfig
    fileConfig(config.config_file_name)

# Metadata for autogenerate
target_metadata = Base.metadata

# Use localhost:5433 for local migrations
local_engine = create_engine("postgresql://postgres:kobby-dan-014@localhost:5433/titanic_db")

def run_migrations_online():
    """Run migrations in 'online' mode."""
    with local_engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    # Offline mode (if needed)
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()
else:
    run_migrations_online()