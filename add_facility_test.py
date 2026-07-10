from app import create_app, db
from app.models import ServiceFacility


app = create_app()


with app.app_context():


    facility = ServiceFacility(

        name="测试公共厕所",

        category="公共厕所",

        longitude=113.9004,

        latitude=29.7244,

        address="赤壁古镇测试点",

        source="测试数据",

        description="用于测试设施图层"

    )


    db.session.add(
        facility
    )


    db.session.commit()


    print("设施添加成功")