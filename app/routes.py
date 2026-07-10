from flask import Blueprint, request, jsonify, send_file

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



# ==================================================
# 项目根目录
# ==================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)



# ==================================================
# 文件路径
# ==================================================

UPLOAD_FOLDER = os.path.join(
    BASE_DIR,
    "uploads"
)


BACKUP_FILE = os.path.join(
    BASE_DIR,
    "data",
    "feedback_backup.csv"
)



# 创建必要文件夹

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


os.makedirs(
    os.path.dirname(BACKUP_FILE),
    exist_ok=True
)





# ==================================================
# CSV备份函数
# ==================================================

def save_feedback_backup(feedback):


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



        if not file_exists:


            writer.writerow([

                "time",

                "type",

                "respondent_type",

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

            feedback.respondent_type,

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







# ==================================================
# 提交反馈 API
# ==================================================

@feedback_bp.route(

    "/api/feedback",

    methods=["POST"]

)

def submit_feedback():



    data = request.form



    # --------------------------
    # 获取位置
    # --------------------------

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






    # --------------------------
    # 图片上传
    # --------------------------

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



            # 保存相对路径到数据库

            image_path = os.path.join(

                "uploads",

                filename

            )







    # --------------------------
    # 创建反馈
    # --------------------------

    feedback = Feedback(

        type=data.get(
            "type"
        ),


        respondent_type=data.get(
            "respondent_type",
            "其他"
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






    # --------------------------
    # 保存数据库
    # --------------------------

    db.session.add(
        feedback
    )


    db.session.commit()





    # --------------------------
    # CSV备份
    # --------------------------

    save_feedback_backup(
        feedback
    )





    return jsonify({


        "message":

        "反馈提交成功",


        "id":

        feedback.id


    }),200







# ==================================================
# 下载CSV备份
# ==================================================

@feedback_bp.route(

    "/download-backup",

    methods=["GET"]

)

def download_backup():



    if not os.path.exists(
        BACKUP_FILE
    ):


        return jsonify({

            "message":

            "暂无备份数据"

        }),404





    return send_file(


        BACKUP_FILE,


        as_attachment=True,


        download_name=

        "feedback_backup.csv"


    )

# ==================================================
# 调试：查看数据库数量
# ==================================================

@feedback_bp.route(
    "/api/debug/count",
    methods=["GET"]
)
def debug_count():


    count = Feedback.query.count()


    return jsonify({

        "total_feedback": count

    })





# ==================================================
# 调试：查看最近提交
# ==================================================

@feedback_bp.route(
    "/api/debug/latest",
    methods=["GET"]
)
def debug_latest():


    feedbacks = Feedback.query.order_by(

        Feedback.created_time.desc()

    ).limit(10).all()



    result = []


    for f in feedbacks:


        result.append({

            "id": f.id,

            "time": str(
                f.created_time
            ),

            "category": f.category,

            "description": f.description,

            "image": f.image_path

        })



    return jsonify(result)