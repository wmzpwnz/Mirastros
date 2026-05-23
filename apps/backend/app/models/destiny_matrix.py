"""Destiny Matrix Database Model"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.core.database import Base


def _utc_now():
    # DB column is TIMESTAMP WITHOUT TIME ZONE, keep naive UTC datetime.
    return datetime.utcnow()


class DestinyMatrix(Base):
    """Destiny Matrix model for storing user's destiny matrix (22 arcana)"""
    
    __tablename__ = "destiny_matrices"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, index=True)
    
    # Matrix data: 4x4 grid with numbers 1-22
    matrix_data = Column(JSON, nullable=False)  # [[1,2,3,4], [5,6,7,8], [9,10,11,12], [13,14,15,16]]
    
    # Lines payload supports legacy v1 and expanded v2:
    # v1: {destiny, character, purpose, health}
    # v2: {calculation_version, basic, extended, positions, layout_meta}
    lines = Column(JSON, nullable=False)
    
    # Active arcana (numbers that appear in lines)
    active_arcana = Column(JSON, nullable=False)  # [5, 12, 8, 3]
    
    # AI-generated interpretation
    interpretation = Column(Text, nullable=False)
    
    # Metadata
    birth_date = Column(String(10), nullable=False)  # YYYY-MM-DD format
    created_at = Column(DateTime, default=_utc_now, nullable=False)
    updated_at = Column(DateTime, default=_utc_now, onupdate=_utc_now, nullable=False)
    
    # Relationship to User
    user = relationship("User", back_populates="destiny_matrix")
    
    def __repr__(self):
        return f"<DestinyMatrix(id={self.id}, user_id={self.user_id}, active_arcana={self.active_arcana})>"





