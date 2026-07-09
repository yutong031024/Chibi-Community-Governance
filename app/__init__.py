from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy

import os


db = SQLAlchemy()



def create_app():


    app = Flask(__name__)



    # =========================
    # 数据库配置
    # =========================

    database_url = os.environ.get(
        "DATABASE_URL"
    )


    if database_url:


        # Render PostgreSQL
        # Render 有时返回 postgres://
        # SQLAlchemy 需要 postgresql://

        if database_url.startswith(
            "postgres://"
        ):

            database_url = database_url.replace(
                "postgres://",
                "postgresql://",
                1
            )


        app.config[
            "SQLALCHEMY_DATABASE_URI"
        ] = database_url



    else:


        # 本地开发 SQLite

        app.config[
            "SQLALCHEMY_DATABASE_URI"
        ] = (
            "sqlite:///../data/chibi.db"
        )



    app.config[
        "SQLALCHEMY_TRACK_MODIFICATIONS"
    ] = False



    # 初始化数据库

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


    @app.route(
        "/<path:filename>"
    )
    def static_files(filename):


        return send_from_directory(

            "../frontend/citizen",

            filename

        )





    # =========================
    # API接口
    # =========================


    from app.routes import feedback_bp


    app.register_blueprint(
        feedback_bp
    )



    return app