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


    "toilet": {

        "name": "公共厕所",

        "keywords": [

            "公共厕所",

            "卫生间",

            "洗手间",

            "旅游厕所"

        ]

    },


    "transport": {

        "name": "交通设施",

        "keywords": [

            "公交站",

            "停车场"

        ]

    },


    "commercial": {

        "name": "商业设施",

        "keywords": [

            "超市",

            "便利店",

            "商场"

        ]

    },


    "culture": {

        "name": "文化设施",

        "keywords": [

            "文化馆",

            "博物馆",

            "图书馆"

        ]

    },


    "education": {

        "name": "教育设施",

        "keywords": [

            "学校",

            "幼儿园"

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


    params = {


        "key":
        AMAP_KEY,


        "keywords":
        keyword,


        # 限制赤壁市
        "city":
        "421281",


        "citylimit":
        True,


        "extensions":
        "all",


        "offset":
        25,


        "page":
        1

    }



    response = requests.get(

        url,

        params=params,

        timeout=10

    )


    data = response.json()

    results = []



    if data.get("status") == "1":


        for poi in data.get(
            "pois",
            []
        ):


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
                    float(lng),


                    "latitude":
                    float(lat),


                    "address":
                    poi.get(
                        "address"
                    )

                })


    return results