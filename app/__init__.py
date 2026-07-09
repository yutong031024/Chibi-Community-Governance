from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


def create_app():

    app = Flask(__name__)


    app.config["SQLALCHEMY_DATABASE_URI"] = (
        "sqlite:///../data/chibi.db"
    )

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


    db.init_app(app)



    # =========================
    # 居民端网页
    # =========================

    @app.route("/")
    def home():

        return send_from_directory(
            "../frontend/citizen",
            "index.html"
        )


    # =========================
    # 前端静态文件
    # =========================

    @app.route("/<path:filename>")
    def static_files(filename):

        return send_from_directory(
            "../frontend/citizen",
            filename
        )



    from app.routes import feedback_bp

    app.register_blueprint(
        feedback_bp
    )


    return app