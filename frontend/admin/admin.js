let map;



// =========================
// 反馈类别
// =========================

const feedbackCategories = {


    "交通出行": "#3182bd",

    "医疗健康": "#de2d26",

    "商业服务": "#fe9929",

    "物流服务": "#756bb1",

    "公共设施": "#31a354",

    "文化设施": "#e6550d",

    "教育设施": "#2ca25f",

    "无障碍设施": "#dd1c77",

    "环境卫生": "#636363",

    "其他": "#969696"

};




// =========================
// 设施类别
// =========================


const facilityCategories = {


    "医疗健康": "🏥",


    "交通出行": "🚌",


    "商业服务": "🛒",


    "物流服务": "📦",


    "公共设施": "🏛️",


    "环境卫生": "🌱",


    "文化设施": "🎭",


    "教育设施": "🏫",


    "无障碍设施": "♿",


    "其他": "📌"


};






// =========================
// 图层
// =========================


let feedbackLayers = {};

let facilityLayers = {};






// =========================
// 初始化空图层
// =========================


Object.keys(feedbackCategories)

.forEach(

    category => {


        feedbackLayers[category] =
        L.layerGroup();


    }

);




Object.keys(facilityCategories)

.forEach(

    category => {


        facilityLayers[category] =
        L.layerGroup();


    }

);








window.onload=function(){


    initMap();


    loadFeedback();


    loadFacilities();


    sidebarControl();


};








// =========================
// 地图
// =========================


function initMap(){


    map =
    L.map("map")
    .setView(

        [
            29.724419,
            113.900407
        ],

        13

    );




    L.tileLayer(

        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:
            "OpenStreetMap"

        }

    )
    .addTo(map);


}








// =========================
// 加载反馈
// =========================


function loadFeedback(){



    fetch(
        "/api/admin/map-data"
    )


    .then(
        r=>r.json()
    )


    .then(

        data=>{


            createFeedbackMarkers(
                data
            );


            renderSidebar();


        }

    );


}







function createFeedbackMarkers(data){



    data.forEach(

        item=>{


            let category =
            item.category;



            if(
                !feedbackLayers[category]
            ){


                feedbackLayers[category]
                =
                L.layerGroup();


            }





            let color =
            feedbackCategories[category]
            ||
            "#000000";





            let marker =
            L.circleMarker(

                [

                    item.latitude,

                    item.longitude

                ],

                {


                    radius:8,

                    color:color,

                    fillColor:color,

                    fillOpacity:0.85


                }

            );






            marker.bindPopup(`


            <h3>
            📍 ${category}
            </h3>


            <b>
            反馈对象：
            </b>

            ${
                item.respondent_type
                ||
                "未知"
            }


            <br><br>


            <b>
            描述：
            </b>

            <br>

            ${
                item.description
                ||
                ""
            }


            <br><br>


            <b>
            状态：
            </b>

            ${
                item.status
                ||
                "未处理"
            }


            <br><br>


            <b>
            地址：
            </b>

            ${
                item.address
                ||
                "暂无"
            }


            `);



            marker.addTo(

                feedbackLayers[category]

            );


        }

    );



}








// =========================
// 加载设施
// =========================


function loadFacilities(){



    fetch(
        "/api/admin/service-data"
    )


    .then(
        r=>r.json()
    )


    .then(

        data=>{


            createFacilityMarkers(
                data
            );


            renderSidebar();


        }

    );


}








function createFacilityMarkers(data){



    data.forEach(

        item=>{


            let category =
            item.category;




            if(
                !facilityLayers[category]
            ){


                facilityLayers[category]
                =
                L.layerGroup();


            }






            let icon =
            L.divIcon({

                html:

                `

                <div class="emoji-icon">

                ${
                    facilityCategories[category]
                    ||
                    "📌"
                }

                </div>

                `,


                className:"",

                iconSize:
                [
                    35,
                    35
                ]

            });






            let marker =
            L.marker(

                [

                    item.latitude,

                    item.longitude

                ],

                {

                    icon:icon

                }

            );






            marker.bindPopup(`


            <h3>

            ${
                facilityCategories[category]
                ||
                "📌"
            }

            ${
                item.name
            }


            </h3>



            <b>
            类型：
            </b>

            ${
                category
            }



            <br><br>



            <b>
            地址：
            </b>

            ${
                item.address
                ||
                "暂无"
            }



            <br><br>



            <b>
            来源：
            </b>

            ${
                item.source
                ||
                "未知"
            }


            `);






            marker.addTo(

                facilityLayers[category]

            );


        }

    );


}








// =========================
// Sidebar
// =========================


function renderSidebar(){



    let feedbackDiv =
    document.getElementById(
        "feedback-layers"
    );



    let facilityDiv =
    document.getElementById(
        "facility-layers"
    );



    feedbackDiv.innerHTML="";


    facilityDiv.innerHTML="";





    Object.keys(
        feedbackLayers
    )

    .forEach(

        category=>{


            let color =
            feedbackCategories[category];



            feedbackDiv.innerHTML +=


            `

            <div class="layer-item">


            <input 
            type="checkbox"
            checked
            onchange="
            toggleLayer(
            'feedback',
            '${category}',
            this.checked
            )
            ">


            <span 
            class="color-dot"
            style="
            background:${color};
            ">
            </span>


            ${category}


            </div>


            `;


            feedbackLayers[category]
            .addTo(map);



        }

    );






    Object.keys(
        facilityLayers
    )

    .forEach(

        category=>{


            facilityDiv.innerHTML +=


            `

            <div class="layer-item">


            <input
            type="checkbox"
            checked
            onchange="
            toggleLayer(
            'facility',
            '${category}',
            this.checked
            )
            ">



            <span class="emoji-icon">

            ${
                facilityCategories[category]
            }

            </span>


            ${category}


            </div>


            `;



            facilityLayers[category]
            .addTo(map);



        }

    );


}








// =========================
// 控制图层
// =========================


function toggleLayer(
    type,
    category,
    checked
){



    let layer;



    if(
        type==="feedback"
    ){

        layer =
        feedbackLayers[category];

    }


    else{


        layer =
        facilityLayers[category];

    }






    if(checked){


        layer.addTo(map);


    }

    else{


        map.removeLayer(
            layer
        );


    }


}








// =========================
// Sidebar 开关
// =========================


function sidebarControl(){



    document
    .getElementById(
        "toggle-sidebar"
    )

    .onclick=function(){



        document
        .getElementById(
            "sidebar"
        )

        .classList.toggle(
            "hidden"
        );


    };


}