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

    return send_from_directory(
        ADMIN_FOLDER,
        "admin.html"
    )



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



    for poi in pois:



        # 防止重复导入

        exists = ServiceFacility.query.filter_by(

            name=poi["name"],

            category=category

        ).first()



        if exists:

            continue





        facility = ServiceFacility(


            name=poi["name"],


            category=category,


            longitude=poi["longitude"],


            latitude=poi["latitude"],


            address=poi["address"],


            source="高德POI"


        )



        db.session.add(
            facility
        )


        count += 1



    db.session.commit()



    return jsonify({

        "message":
        "导入完成",

        "count":
        count

    })