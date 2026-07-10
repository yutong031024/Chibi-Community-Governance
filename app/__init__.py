from flask import Flask, app, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

import os
load_dotenv()

db = SQLAlchemy()



def create_app():


    app = Flask(__name__)


    # =========================
    # 项目路径
    # =========================

    BASE_DIR = os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )



    FRONTEND_FOLDER = os.path.join(
        BASE_DIR,
        "frontend",
        "citizen"
    )


    UPLOAD_FOLDER = os.path.join(
        BASE_DIR,
        "uploads"
    )



    # =========================
    # 数据库配置
    # =========================


    database_url = os.environ.get(
        "DATABASE_URL"
    )



    if database_url:


        # Render PostgreSQL

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


        # 本地 SQLite

        app.config[
            "SQLALCHEMY_DATABASE_URI"
        ] = (

            "sqlite:///../data/chibi.db"

        )



    app.config[
        "SQLALCHEMY_TRACK_MODIFICATIONS"
    ] = False



    # 初始化数据库

    db.init_app(
        app
    )




    # =========================
    # 居民端主页
    # =========================


    @app.route("/")
    def home():


        return send_from_directory(

            FRONTEND_FOLDER,

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

            FRONTEND_FOLDER,

            filename

        )





    # =========================
    # 上传图片访问
    # =========================
    #
    # 示例：
    # /uploads/20260710_photo.jpg
    #
    # =========================


    @app.route(
        "/uploads/<filename>"
    )
    def uploaded_files(filename):


        return send_from_directory(

            UPLOAD_FOLDER,

            filename

        )





    # =========================
    # API接口
    # =========================


    from app.routes import feedback_bp



    app.register_blueprint(
        feedback_bp
    )

    from app.admin_routes import admin_bp

    app.register_blueprint(
        admin_bp
    )



    return app