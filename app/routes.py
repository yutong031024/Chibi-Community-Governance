from flask import Blueprint, request, jsonify
from app import db
from app.models import Feedback

import os
from werkzeug.utils import secure_filename
from datetime import datetime


feedback_bp = Blueprint(
    "feedback",
    __name__
)


UPLOAD_FOLDER = "uploads"


os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)



@feedback_bp.route(
    "/api/feedback",
    methods=["POST"]
)
def submit_feedback():


    # 接收表单数据
    data = request.form



    # ======================
    # 图片上传
    # ======================

    image_path = None


    if "photo" in request.files:


        file = request.files["photo"]


        if file.filename != "":


            filename = (

                datetime.now()
                .strftime("%Y%m%d_%H%M%S_")

                +

                secure_filename(
                    file.filename
                )

            )


            filepath = os.path.join(

                UPLOAD_FOLDER,

                filename

            )


            file.save(filepath)


            image_path = filepath





    # ======================
    # 保存数据库
    # ======================

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
            data.get("longitude")
        ),


        latitude=float(
            data.get("latitude")
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



    db.session.add(
        feedback
    )


    db.session.commit()



    return jsonify({


        "message":
        "反馈提交成功",


        "id":
        feedback.id


    })