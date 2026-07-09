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