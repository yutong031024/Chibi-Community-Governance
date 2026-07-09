from flask import Blueprint, request, jsonify
from app import db
from app.models import Feedback

import os
import csv

from datetime import datetime
from werkzeug.utils import secure_filename



feedback_bp = Blueprint(
    "feedback",
    __name__
)



# =========================
# 文件路径
# =========================

UPLOAD_FOLDER = "uploads"

BACKUP_FILE = "data/feedback_backup.csv"



# 创建上传文件夹

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)




# =========================
# CSV备份函数
# =========================

def save_feedback_backup(feedback):


    os.makedirs(
        "data",
        exist_ok=True
    )


    file_exists = os.path.isfile(
        BACKUP_FILE
    )



    with open(

        BACKUP_FILE,

        "a",

        newline="",

        encoding="utf-8-sig"

    ) as f:



        writer = csv.writer(f)



        # 第一次创建文件时写标题

        if not file_exists:


            writer.writerow([

                "time",

                "type",

                "category",

                "description",

                "longitude",

                "latitude",

                "address",

                "location_method",

                "contact",

                "image_path",

                "status"

            ])




        writer.writerow([


            feedback.created_time,


            feedback.type,


            feedback.category,


            feedback.description,


            feedback.longitude,


            feedback.latitude,


            feedback.address,


            feedback.location_method,


            feedback.contact,


            feedback.image_path,


            feedback.status


        ])






# =========================
# 提交反馈 API
# =========================


@feedback_bp.route(

    "/api/feedback",

    methods=["POST"]

)

def submit_feedback():



    # 接收 FormData

    data = request.form



    # =========================
    # 检查位置
    # =========================


    longitude = data.get(
        "longitude"
    )


    latitude = data.get(
        "latitude"
    )



    if not longitude or not latitude:


        return jsonify({

            "message":
            "缺少位置信息"

        }),400




    # =========================
    # 图片上传
    # =========================


    image_path = None



    if "photo" in request.files:



        file = request.files["photo"]



        if file.filename != "":



            filename = (

                datetime.now()

                .strftime(
                    "%Y%m%d_%H%M%S_"
                )

                +

                secure_filename(
                    file.filename
                )

            )



            filepath = os.path.join(

                UPLOAD_FOLDER,

                filename

            )



            file.save(
                filepath
            )



            image_path = filepath






    # =========================
    # 创建反馈对象
    # =========================


    feedback = Feedback(



        type=data.get(
            "type"
        ),



        category=data.get(
            "category"
        ),



        description=data.get(
            "description"
        ),



        longitude=float(
            longitude
        ),



        latitude=float(
            latitude
        ),



        address=data.get(
            "address"
        ),



        location_method=data.get(
            "location_method"
        ),



        contact=data.get(
            "contact"
        ),



        image_path=image_path


    )





    # =========================
    # 保存数据库
    # =========================


    db.session.add(
        feedback
    )


    db.session.commit()






    # =========================
    # 保存CSV备份
    # =========================


    save_feedback_backup(
        feedback
    )





    return jsonify({


        "message":
        "反馈提交成功",


        "id":
        feedback.id


    }),200