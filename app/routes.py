from flask import Blueprint, request, jsonify, send_file

from app import db
from app.models import Feedback

import csv

import cloudinary.uploader

from io import StringIO, BytesIO


feedback_bp = Blueprint(
    "feedback",
    __name__
)


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
    # 图片上传 Cloudinary
    # --------------------------

    image_path = None


    if "photo" in request.files:


        file = request.files["photo"]


        if file.filename != "":


            result = cloudinary.uploader.upload(
                file
            )


            image_path = result.get(
                "secure_url"
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
    # 保存 PostgreSQL
    # --------------------------

    db.session.add(
        feedback
    )


    db.session.commit()



    return jsonify({

        "message":
        "反馈提交成功",

        "id":
        feedback.id

    }),200





# ==================================================
# 下载 CSV
# 从 PostgreSQL 实时生成
# ==================================================

@feedback_bp.route(
    "/download-backup",
    methods=["GET"]
)
def download_backup():


    feedbacks = Feedback.query.all()


    output = StringIO()


    writer = csv.writer(
        output
    )


    writer.writerow([

        "id",

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

        "image_url",

        "status"

    ])



    for f in feedbacks:


        writer.writerow([


            f.id,


            f.created_time,


            f.type,


            f.respondent_type,


            f.category,


            f.description,


            f.longitude,


            f.latitude,


            f.address,


            f.location_method,


            f.contact,


            f.image_path,


            f.status

        ])



    output.seek(0)



    return send_file(

        BytesIO(
            output.getvalue().encode(
                "utf-8-sig"
            )
        ),

        mimetype="text/csv",

        as_attachment=True,

        download_name="feedback_backup.csv"

    )