from app import db
from datetime import datetime


class Feedback(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )


    type = db.Column(
        db.String(20),
        nullable=False
    )

    respondent_type = db.Column(
    db.String(20),
    nullable=False,
    default="其他"
)


    category = db.Column(
        db.String(50),
        nullable=False
    )


    description = db.Column(
        db.Text,
        nullable=False
    )


    longitude = db.Column(
        db.Float,
        nullable=False
    )


    latitude = db.Column(
        db.Float,
        nullable=False
    )


    address = db.Column(
        db.String(200)
    )


    location_method = db.Column(
        db.String(30)
    )


    contact = db.Column(
        db.String(100)
    )

    image_path = db.Column(
    db.String(200),
    nullable=True
)


    status = db.Column(
        db.String(20),
        default="未处理"
    )


    created_time = db.Column(
        db.DateTime,
        default=datetime.now
    )

class ServiceFacility(db.Model):


    id = db.Column(
        db.Integer,
        primary_key=True
    )


    name = db.Column(
        db.String(100),
        nullable=False
    )


    category = db.Column(
        db.String(50),
        nullable=False
    )


    longitude = db.Column(
        db.Float,
        nullable=False
    )


    latitude = db.Column(
        db.Float,
        nullable=False
    )


    address = db.Column(
        db.String(200)
    )


    source = db.Column(
        db.String(50),
        default="高德POI"
    )


    description = db.Column(
        db.Text
    )


    created_time = db.Column(
        db.DateTime,
        default=datetime.now
    )