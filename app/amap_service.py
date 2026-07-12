import requests
import os


AMAP_KEY = os.environ.get(
    "AMAP_WEB_KEY"
)



# =========================
# 设施类型配置
# =========================

FACILITY_CONFIG = {


    "medical": {

        "name": "医疗设施",

        "keywords": [

            "医院",

            "卫生院",

            "诊所",

            "社区卫生服务中心"

        ]

    },



    "transport": {

        "name": "交通出行",

        "keywords": [

            "公交站",

            "公交站台",

            "停车场"

        ]

    },



    "commercial": {

        "name": "商业设施",

        "keywords": [

            "超市",

            "便利店",

            "商场",

            "市场"

        ]

    },



    "logistics": {

        "name": "物流设施",

        "keywords": [

            "快递点",

            "菜鸟驿站",

            "物流公司",

            "快递服务"

        ]

    },



    "public": {

        "name": "公共设施",

        "keywords": [

            "公共厕所",

            "充电宝",

            "共享充电宝",

            "服务中心"

        ]

    },



    "environment": {

        "name": "环境卫生",

        "keywords": [

            "垃圾站",

            "垃圾处理站",

            "环卫站"

        ]

    },



    "culture": {

        "name": "文化设施",

        "keywords": [

            "文化馆",

            "博物馆",

            "图书馆",

            "纪念馆"

        ]

    },



    "education": {

        "name": "教育设施",

        "keywords": [

            "学校",

            "幼儿园",

            "培训机构"

        ]

    },



    "accessibility": {

        "name": "无障碍设施",

        "keywords": [

            "无障碍卫生间",

            "无障碍通道",

            "残疾人设施"

        ]

    },



    "other": {

        "name": "其他",

        "keywords": [

            "服务点"

        ]

    }


}

# =========================
# 高德 POI 搜索
# =========================


def search_poi(keyword):


    url = (

        "https://restapi.amap.com/v3/place/text"

    )


    results = []


    page = 1


    while True:


        params = {


            "key":
            AMAP_KEY,


            "keywords":
            keyword,


            # 赤壁市行政代码
            "city":
            "421281",


            "citylimit":
            True,


            "extensions":
            "all",


            # 最大50条
            "offset":
            50,


            "page":
            page


        }



        response = requests.get(

            url,

            params=params,

            timeout=10

        )



        data = response.json()

        total = int(
    data.get(
        "count",
        0
    )
)



        if data.get("status") != "1":

            break



        pois = data.get(
            "pois",
            []
        )



        if not pois:

            break



        for poi in pois:



            location = poi.get(
                "location"
            )


            if location:


                lng, lat = location.split(",")


                results.append({


                    "name":
                    poi.get(
                        "name"
                    ),


                    "longitude":
                    float(
                        lng
                    ),


                    "latitude":
                    float(
                        lat
                    ),


                    "address":
                    poi.get(
                        "address"
                    )

                })



        # 如果返回数量不足50，
        # 说明已经到最后一页

        # 根据高德返回总数量判断是否结束

        if page >= 5:

            break


    # 防止异常分页

        if page >= 10:

            break



        page += 1



    return results