from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from app.core.database import Base
from datetime import datetime

class NatalChart(Base):
    """Natal chart model with astrological data"""
    __tablename__ = "natal_charts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True, index=True)
    
    # Planetary positions
    planets = Column(JSON, nullable=False)  # {sun: {sign, degree, house, retrograde}, moon: {...}, ...}
    
    # House cusps
    houses = Column(JSON, nullable=False)  # [{cusp: 1, sign, degree}, {cusp: 2, ...}, ...]
    
    # Planetary aspects
    aspects = Column(JSON, nullable=False)  # [{planet1, planet2, type, orb}, ...]
    
    # Additional data
    ascendant = Column(JSON, nullable=True)  # {sign, degree}
    midheaven = Column(JSON, nullable=True)  # {sign, degree}
    lunar_nodes = Column(JSON, nullable=True)  # {north_node: {sign, degree}, south_node: {sign, degree}}
    
    # Calculation metadata
    house_system = Column(JSON, nullable=True)  # Placidus, Koch, Equal, etc.
    calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<NatalChart user_id={self.user_id}>"
