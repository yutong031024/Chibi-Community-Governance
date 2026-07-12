from flask import (
    Blueprint,
    jsonify,
    send_file,
    send_from_directory,
    request
)

from app import db
from app.models import Feedback, ServiceFacility
from app.amap_service import (
    search_poi,
    FACILITY_CONFIG
)

import os
import io
import csv


admin_bp = Blueprint(
    "admin",
    __name__
)



# =========================
# 路径
# =========================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)


ADMIN_FOLDER = os.path.join(
    BASE_DIR,
    "frontend",
    "admin"
)



# =========================
# 管理员主页
# =========================
@admin_bp.route("/admin")
def admin_page():

    js_key = os.environ.get(
        "AMAP_JS_KEY"
    )

    security_code = os.environ.get(
        "AMAP_JS_SECURITY_CODE"
    )


    html_path = os.path.join(
        ADMIN_FOLDER,
        "admin.html"
    )


    with open(
        html_path,
        "r",
        encoding="utf-8"
    ) as f:

        html = f.read()


    html = html.replace(
        "{{AMAP_JS_KEY}}",
        js_key or ""
    )


    html = html.replace(
        "{{AMAP_JS_SECURITY_CODE}}",
        security_code or ""
    )


    return html



# =========================
# 管理员静态文件
# =========================

@admin_bp.route(
    "/admin/<path:filename>"
)

def admin_static(filename):

    return send_from_directory(
        ADMIN_FOLDER,
        filename
    )



# =========================
# 地图数据 API
# =========================

@admin_bp.route(
    "/api/admin/map-data"
)

def map_data():


    feedbacks = Feedback.query.all()


    result = []


    for f in feedbacks:


        result.append({

            "id": f.id,

            "category": f.category,

            "type": f.type,

            "respondent_type":
                f.respondent_type,

            "description":
                f.description,

            "longitude":
                f.longitude,

            "latitude":
                f.latitude,

            "address":
                f.address,

            "status":
                f.status,

            "image_path":
                f.image_path,

            "created_time":
                str(f.created_time)

        })


    return jsonify(result)
# =========================
# 反馈管理列表
# =========================


@admin_bp.route(
    "/api/admin/feedbacks"
)

def admin_feedbacks():


    feedbacks = Feedback.query.order_by(
        Feedback.created_time.desc()
    ).all()



    result = []



    for f in feedbacks:


        result.append({


            "id":
            f.id,


            "type":
            f.type,


            "category":
            f.category,


            "respondent_type":
            f.respondent_type,


            "description":
            f.description,


            "longitude":
            f.longitude,


            "latitude":
            f.latitude,


            "address":
            f.address,


            "image_path":
            f.image_path,


            "status":
            f.status,


            "created_time":
            str(f.created_time)


        })



    return jsonify(result)

# =========================
# 民生服务设施数据
# =========================

@admin_bp.route(
    "/api/admin/service-data"
)

def service_data():


    facilities = ServiceFacility.query.all()


    result = []


    for f in facilities:


        result.append({

            "id": f.id,

            "name": f.name,

            "category": f.category,

            "longitude": f.longitude,

            "latitude": f.latitude,

            "address": f.address,

            "source": f.source,

            "description": f.description

        })


    return jsonify(result)

## =========================
# 高德设施导入
# =========================


@admin_bp.route(

    "/api/admin/import-facility",

    methods=["POST"]

)

def import_facility():


    data = request.get_json()


    facility_type = data.get(
        "type"
    )



    from app.amap_service import (
        FACILITY_CONFIG,
        search_poi
    )



    if facility_type not in FACILITY_CONFIG:


        return jsonify({

            "message":
            "未知设施类型"

        }),400




    config = FACILITY_CONFIG[facility_type]



    category = config["name"]



    count = 0





    for keyword in config["keywords"]:



        pois = search_poi(
            keyword
        )



        for poi in pois:



            exists = ServiceFacility.query.filter_by(

                name=poi["name"],

                category=category

            ).first()



            if exists:

                continue





            facility = ServiceFacility(


                name=
                poi["name"],


                category=
                category,


                longitude=
                poi["longitude"],


                latitude=
                poi["latitude"],


                address=
                poi["address"],


                source=
                "高德POI"

            )



            db.session.add(
                facility
            )


            count += 1




    db.session.commit()



    return jsonify({


        "message":
        "导入完成",


        "category":
        category,


        "count":
        count


    })


# =========================
# Dashboard 数据统计
# =========================

@admin_bp.route(
    "/api/admin/dashboard"
)

def dashboard():


    from sqlalchemy import func



    # =====================
    # 反馈统计
    # =====================


    total_feedback = Feedback.query.count()

    pending_feedback = Feedback.query.filter_by(
        status="未处理"
    ).count()

    processing_feedback = Feedback.query.filter_by(
        status="处理中"
    ).count()

    completed_feedback = Feedback.query.filter_by(
        status="已处理"
    ).count()

    # =====================
    # 反馈类别统计
    # =====================
    feedback_category = {}

    category_rows = (

        db.session.query(

            Feedback.category,

            func.count(Feedback.id)

        )

        .group_by(
            Feedback.category
        )

        .all()

    )

    for category,count in category_rows:

        feedback_category[category]=count

    # =====================
    # 反馈状态统计
    # =====================


    feedback_status={}



    status_rows=(

        db.session.query(

            Feedback.status,

            func.count(Feedback.id)

        )

        .group_by(
            Feedback.status
        )

        .all()

    )



    for status,count in status_rows:

        feedback_status[status]=count


    # =====================
    # 设施统计
    # =====================


    total_facility = (
        ServiceFacility.query.count()
    )



    facility_category={}



    facility_rows=(

        db.session.query(

            ServiceFacility.category,

            func.count(ServiceFacility.id)

        )

        .group_by(
            ServiceFacility.category
        )

        .all()

    )



    for category,count in facility_rows:

        facility_category[category]=count





    return jsonify({


        "feedback":{


            "total":
            total_feedback,

            "pending":
            pending_feedback,

            "processing":
            processing_feedback,

            "completed":
            completed_feedback

        },



        "feedback_category":
        feedback_category,

        "feedback_status":
        feedback_status,

        "facility":{


            "total":
            total_facility

        },



        "facility_category":
        facility_category


    })
    # -------------------------
    # 反馈类别统计
    # -------------------------

    category_result = {}


    categories = db.session.query(
        Feedback.category,
        db.func.count(Feedback.id)
    ).group_by(
        Feedback.category
    ).all()



    for category, count in categories:

        category_result[category] = count



    # -------------------------
    # 设施统计
    # -------------------------

    total_facility = ServiceFacility.query.count()


    facility_result = {}


    facilities = db.session.query(
        ServiceFacility.category,
        db.func.count(ServiceFacility.id)
    ).group_by(
        ServiceFacility.category
    ).all()



    for category, count in facilities:

        facility_result[category] = count



    return jsonify({

        "feedback": {

            "total": total_feedback,

            "pending": pending,

            "processing": processing,

            "completed": completed

        },


        "feedback_category":
        category_result,


        "facility": {

            "total":
            total_facility

        },


        "facility_category":
        facility_result

    })

# =========================
# Feedback 管理 API
# =========================


@admin_bp.route(
    "/api/admin/feedbacks"
)
def get_feedbacks():


    feedbacks = Feedback.query.order_by(

        Feedback.created_time.desc()

    ).all()



    result = []


    for f in feedbacks:


        result.append({

            "id": f.id,

            "type": f.type,

            "respondent_type": f.respondent_type,

            "category": f.category,

            "description": f.description,

            "longitude": f.longitude,

            "latitude": f.latitude,

            "address": f.address,

            "contact": f.contact,

            "image_path": f.image_path,

            "status": f.status,

            "created_time": str(
                f.created_time
            )

        })

    return jsonify(result)


# =========================
# 修改反馈状态
# =========================
@admin_bp.route(

    "/api/admin/feedback/<int:id>",

    methods=["PUT"]

)

def update_feedback(id):


    feedback = Feedback.query.get(id)



    if not feedback:


        return jsonify({

            "message":
            "反馈不存在"

        }),404




    data = request.get_json()



    if "status" in data:


        feedback.status = data["status"]




    db.session.commit()



    return jsonify({

        "message":
        "更新成功"

    })

@admin_bp.route(

    "/api/admin/feedback/<int:id>/status",

    methods=["PUT"]

)


# =========================
# 删除反馈
# =========================
@admin_bp.route(

    "/api/admin/feedback/<int:id>",

    methods=["DELETE"]

)


@admin_bp.route(

    "/api/admin/feedback/<int:id>",

    methods=["DELETE"]

)

def delete_feedback(id):


    feedback = Feedback.query.get_or_404(
        id
    )


    db.session.delete(
        feedback
    )


    db.session.commit()



    return jsonify({

        "message":
        "删除成功"

    })

# =========================
# ServiceFacility 管理 API
# =========================


@admin_bp.route(
    "/api/admin/facilities"
)
def get_facilities():


    facilities = ServiceFacility.query.all()


    result=[]


    for f in facilities:


        result.append({

            "id":f.id,

            "name":f.name,

            "category":f.category,

            "longitude":f.longitude,

            "latitude":f.latitude,

            "address":f.address,

            "source":f.source,

            "description":f.description

        })


    return jsonify(result)





# 添加设施

@admin_bp.route(

    "/api/admin/facility",

    methods=["POST"]

)

def add_facility():


    data=request.get_json()


    facility=ServiceFacility(

        name=data.get("name"),

        category=data.get("category"),

        longitude=float(
            data.get("longitude")
        ),

        latitude=float(
            data.get("latitude")
        ),

        address=data.get("address"),

        source="管理员添加",

        description=data.get("description")

    )


    db.session.add(facility)

    db.session.commit()


    return jsonify({

        "message":
        "添加成功"

    })






# 修改设施

@admin_bp.route(

    "/api/admin/facility/<int:id>",

    methods=["PUT"]

)

def update_facility(id):


    data=request.get_json()


    facility=ServiceFacility.query.get_or_404(id)



    facility.name=data.get(
        "name",
        facility.name
    )


    facility.category=data.get(
        "category",
        facility.category
    )


    facility.address=data.get(
        "address",
        facility.address
    )


    facility.description=data.get(
        "description",
        facility.description
    )


    db.session.commit()


    return jsonify({

        "message":
        "修改成功"

    })






# 删除设施

@admin_bp.route(

    "/api/admin/facility/<int:id>",

    methods=["DELETE"]

)

def delete_facility(id):


    facility=ServiceFacility.query.get_or_404(id)


    db.session.delete(facility)


    db.session.commit()


    return jsonify({

        "message":
        "删除成功"

    })

# =========================
# 导出反馈数据 CSV
# =========================

@admin_bp.route(
    "/api/admin/export/feedback"
)
def export_feedback():


    output = io.StringIO()


    writer = csv.writer(output)


    writer.writerow([

        "编号",

        "问题类型",

        "反馈人类型",

        "反馈类别",

        "问题描述",

        "处理状态",

        "经度",

        "纬度",

        "地址",

        "定位方式",

        "提交时间"

    ])



    feedbacks = Feedback.query.all()



    for item in feedbacks:


        writer.writerow([


            item.id,


            item.type,


            item.respondent_type,


            item.category,


            item.description,


            item.status,


            item.longitude,


            item.latitude,


            item.address or "",


            item.location_method or "",


            item.created_time


        ])



    output.seek(0)



    return send_file(

        io.BytesIO(
            output.getvalue()
            .encode("utf-8-sig")
        ),


        mimetype="text/csv",


        as_attachment=True,


        download_name=
        "feedback_export.csv"

    )

# =========================
# 导出设施数据 CSV
# =========================

@admin_bp.route(
    "/api/admin/export/facilities"
)

def export_facilities():


    output = io.StringIO()


    writer = csv.writer(output)


    writer.writerow([


        "编号",

        "设施名称",

        "设施类别",

        "地址",

        "经度",

        "纬度",

        "来源",

        "描述",

        "创建时间"


    ])



    facilities = ServiceFacility.query.all()



    for item in facilities:


        writer.writerow([


            item.id,


            item.name,


            item.category,


            item.address or "",


            item.longitude,


            item.latitude,


            item.source or "",


            item.description or "",


            item.created_time


        ])



    output.seek(0)



    return send_file(

        io.BytesIO(
            output.getvalue()
            .encode("utf-8-sig")
        ),


        mimetype="text/csv",


        as_attachment=True,


        download_name=
        "facility_export.csv"

    )