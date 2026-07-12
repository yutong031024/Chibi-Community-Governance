let map;
let feedbackData=[];
let feedbackModal;
let pickingLocation = false;
let selectedFacilityPoint=null;
let tempMarker=null;
let feedbackList=[];
let selectedFeedbackStatus = "";
let feedbackCategoryVisibility = {};
let heatmap;
let heatmapVisible = false;
let facilityCoverageVisible = false;
let facilityCoverageCircles = {};
let selectedCoverageCategory = "医疗设施";
let selectedCoverageRadius = 1000;


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
// 服务设施类别
// =========================


const facilityCategories = {


    "医疗设施": "🏥",

    "交通出行": "🚌",

    "商业设施": "🛒",

    "物流设施": "📦",

    "公共设施": "🏛",

    "文化设施": "🎭",

    "教育设施": "🏫",

    "无障碍设施": "♿",

    "环境卫生": "🌱",

    "其他": "📌"

};

const facilityCoverageRadius = {

    "医疗设施": 1000,

    "交通出行": 500,

    "商业设施": 800,

    "物流设施": 800,

    "公共设施": 500,

    "文化设施": 1000,

    "教育设施": 1000,

    "无障碍设施": 500,

    "环境卫生": 500,

    "其他": 500

};



// =========================
// 图层
// =========================


let feedbackLayers = {};

let facilityLayers = {};






// =========================
// 初始化
// =========================


window.onload = function(){

    initMap();

    initLayers();

    loadFeedback();

    loadFacilities();

    sidebarControl();

    dashboardControl();

    feedbackControl();

    facilityControl();

    feedbackMapStatusControl();

    heatmapControl();

    facilityCoverageControl();

    coverageAnalysisControl();

};







// =========================
// 初始化高德地图
// =========================


function initMap(){


    map = new AMap.Map(

        "map",

        {
            zoom:13,

            center:[
                113.900407,
                29.724419
            ],

            viewMode:"2D"

        }

    );

    heatmap = new AMap.HeatMap(
    map,
    {
        radius:45,
        opacity:[0,0.8],
        zooms: [3,20]
    }
);

heatmap.hide();


}








// =========================
// 初始化空图层
// =========================


function initLayers(){



    Object.keys(
        feedbackCategories
    )
    .forEach(

        category=>{

            feedbackLayers[category]=[];
            feedbackCategoryVisibility[category] = true;

        }

    );

    Object.keys(
        facilityCategories
    )
    .forEach(

        category=>{


            facilityLayers[category]=[];

        }

    );

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


        // 保存反馈数据，供热力图使用
        feedbackData = data;


        createFeedbackMarkers(
            data
        );


        renderSidebar();


        // 如果热力图当前已勾选，刷新热力图
        if(
            document.getElementById("heatmap-toggle")
            &&
            document.getElementById("heatmap-toggle").checked
        ){

            updateHeatmap();

            heatmap.show();

        }


    }

);


}


function createFeedbackMarkers(data){


    data.forEach(

        item=>{

            let category =
            item.category
            ||
            "其他";

            if(
                !feedbackLayers[category]
            ){

                feedbackLayers[category]=[];

            }

            let marker =
            new AMap.Marker({

                position:[
                    item.longitude,
                    item.latitude
                ],

                map:map

            });

            marker.feedbackStatus =
            item.status || "未处理";


            marker.feedbackCategory =
            category;


            let color =
            feedbackCategories[category]
            ||
            "#999";

            marker.setContent(`

    <div
        class="feedback-marker"
        style="
            background:${color};
        "
    >
    </div>

`);

            marker.content = `


<div>


<h3>
${category}
</h3>



${
    item.image_path

    ?

    `

    <img

    src="${item.image_path}"

    class="feedback-popup-image"

    >

    `

    :

    ""

}



<b>
反馈对象:
</b>


${
    item.respondent_type
    ||
    "未知"
}



<br><br>



<b>
描述:
</b>



<br>



${
    item.description
    ||
    ""
}



<br><br>



<b>
状态:
</b>



${
    item.status
    ||
    "未处理"
}



<br><br>



<b>
地址:
</b>



${
    item.address
    ||
    "暂无"
}



</div>


`;





            marker.on(

                "click",

                function(){

                    let info =
                    new AMap.InfoWindow({

                        content:
                        marker.content,

                        offset:
                        new AMap.Pixel(
                            0,
                            -30
                        )

                    });


                    info.open(

                        map,

                        marker.getPosition()

                    );


                }

            );





            feedbackLayers[category]
            .push(marker);



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
            item.category
            ||
            "其他";



            if(
                !facilityLayers[category]
            ){

                facilityLayers[category]=[];

            }



            if(
                !facilityCoverageCircles[category]
            ){

                facilityCoverageCircles[category]=[];

            }



            let marker =
            new AMap.Marker({


                position:[

                    item.longitude,

                    item.latitude

                ],


                map:map


            });



            marker.setLabel({


                content:

                facilityCategories[category]
                ||
                "📌",


                direction:
                "center"


            });



            marker.content = `


            <div>


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
            类型:
            </b>

            ${
                category
            }


            <br><br>



            <b>
            地址:
            </b>

            ${
                item.address
                ||
                "暂无"
            }



            <br><br>


            <b>
            来源:
            </b>

            ${
                item.source
                ||
                "未知"
            }


            </div>


            `;



            marker.on(

                "click",

                function(){


                    let info =
                    new AMap.InfoWindow({


                        content:
                        marker.content,


                        offset:
                        new AMap.Pixel(
                            0,
                            -30
                        )


                    });



                    info.open(

                        map,

                        marker.getPosition()

                    );


                }

            );



            facilityLayers[category]
            .push(marker);



            // =========================
            // 创建设施覆盖圈
            // =========================


            let radius =

            facilityCoverageRadius[category]

            ||

            500;



            let circle =

            new AMap.Circle({


                center:[

                    item.longitude,

                    item.latitude

                ],


                radius:
                radius,


                strokeColor:
                "#3f6fd9",


                strokeWeight:
                1,


                strokeOpacity:
                0.6,


                fillColor:
                "#3f6fd9",


                fillOpacity:
                0.12,


                // 默认不显示
                map:null


            });



            facilityCoverageCircles[category]
            .push(circle);


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


            feedbackDiv.innerHTML += `


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
            background:${feedbackCategories[category]};
            ">

            </span>


            ${category}


            </div>


            `;


        }

    );







    Object.keys(
        facilityLayers
    )
    .forEach(

        category=>{


            facilityDiv.innerHTML += `


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


            <span>

            ${
                facilityCategories[category]
                ||
                "📌"
            }


            </span>


            ${category}


            </div>


            `;


        }

    );


}


// =========================
// 图层开关
// =========================

function toggleLayer(
    type,
    category,
    checked
){


    if(type === "feedback"){


        feedbackCategoryVisibility[category] =
        checked;


        applyFeedbackFilters();


        return;


    }



    let layers =
    facilityLayers[category] || [];



    layers.forEach(

        marker=>{

            if(checked){

                marker.show();

            }

            else{

                marker.hide();

            }


        }

    );

    if(type === "facility"){

    updateFacilityCoverage();

}


}

function applyFeedbackFilters(){


    Object.keys(
        feedbackLayers
    )
    .forEach(

        category=>{


            let categoryVisible =
            feedbackCategoryVisibility[category]
            !== false;



            feedbackLayers[category]
            .forEach(

                marker=>{


                    let statusVisible =

                    selectedFeedbackStatus === ""

                    ||

                    marker.feedbackStatus ===
                    selectedFeedbackStatus;



                    if(
                        categoryVisible
                        &&
                        statusVisible
                    ){

                        marker.show();

                    }

                    else{

                        marker.hide();

                    }


                }

            );


        }

    );


}
// =========================
// Sidebar按钮
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



/// =========================
// Dashboard
// =========================


function dashboardControl(){


    let btn =
    document.getElementById(
        "dashboard-btn"
    );


    let modal =
    document.getElementById(
        "dashboard-modal"
    );


    let close =
    document.getElementById(
        "close-dashboard"
    );



    btn.onclick=function(){


        modal.style.display="block";



        fetch(
            "/api/admin/dashboard"
        )


        .then(
            r=>r.json()
        )


        .then(

            data=>{


                document
                .getElementById(
                    "total-feedback"
                )
                .innerHTML =
                data.feedback.total;



                document
                .getElementById(
                    "pending-feedback"
                )
                .innerHTML =
                data.feedback.pending;



                document
                .getElementById(
                    "processing-feedback"
                )
                .innerHTML =
                data.feedback.processing;



                document
                .getElementById(
                    "completed-feedback"
                )
                .innerHTML =
                data.feedback.completed;

                createFeedbackCategoryChart(
                    data.feedback_category
                );

                createFeedbackStatusChart(
                    data.feedback_status
                );


            }

        );


    };



    close.addEventListener(
        "click",
        function(){


            modal.style.display="none";


        }
    );

    // =====================
// Dashboard 数据导出
// =====================


let exportFeedbackBtn =

document.getElementById(
"export-feedback-btn"
);



let exportFacilityBtn =

document.getElementById(
"export-facility-btn"
);



if(exportFeedbackBtn){


exportFeedbackBtn.onclick=function(){


window.location.href =

"/api/admin/export/feedback";


};


}



if(exportFacilityBtn){


exportFacilityBtn.onclick=function(){


window.location.href =

"/api/admin/export/facilities";


};


}


}


// =========================
// Feedback 管理
// =========================

function loadFeedbackTable(){


    fetch(
        "/api/admin/feedbacks"
    )


    .then(
        r=>r.json()
    )


    .then(

        data=>{


            let html=`


            <table class="feedback-table">


            <tr>

            <th>ID</th>

            <th>类别</th>

            <th>描述</th>

            <th>时间</th>

            <th>状态</th>

            <th>操作</th>


            </tr>


            `;




            data.forEach(

                f=>{


                    html+=`


                    <tr>


                    <td>
                    ${f.id}
                    </td>


                    <td>
                    ${f.category}
                    </td>


                    <td>
                    ${f.description}
                    </td>


                    <td>
                    ${f.created_time}
                    </td>


                    <td>


                    <select
                    onchange="
                    updateStatus(
                    ${f.id},
                    this.value
                    )
                    ">


                    <option
                    ${
                    f.status==="未处理"
                    ?"selected":""
                    }
                    >
                    未处理
                    </option>



                    <option
                    ${
                    f.status==="处理中"
                    ?"selected":""
                    }
                    >
                    处理中
                    </option>



                    <option
                    ${
                    f.status==="已处理"
                    ?"selected":""
                    }
                    >
                    已处理
                    </option>


                    </select>


                    </td>



                    <td>


                    <button
                    onclick="
                    locateFeedback(
                    ${f.longitude},
                    ${f.latitude}
                    )
                    "
                    >

                    地图

                    </button>



                    <button
                    onclick="
                    deleteFeedback(
                    ${f.id}
                    )
                    "
                    >

                    删除

                    </button>


                    </td>


                    </tr>


                    `;


                }

            );



            html+="</table>";



            document
            .getElementById(
                "feedback-table"
            )
            .innerHTML=html;



        }

    );


}


function updateStatus(id,status){


fetch(

`/api/admin/feedback/${id}`,

{

method:"PUT",

headers:{

"Content-Type":
"application/json"

},

body:

JSON.stringify({

status:status

})

}

)

.then(()=>{

loadFeedbackTable();

});

}


function deleteFeedback(id){


    if(
        !confirm(
            "确定删除该反馈？"
        )
    ){

        return;

    }



    fetch(

        `/api/admin/feedback/${id}`,

        {

            method:"DELETE"

        }

    )


    .then(()=>{


        loadFeedbackTable();


        loadFeedback();


    });


}

function locateFeedback(
    lng,
    lat
){


    map.setCenter([

        lng,

        lat

    ]);


    map.setZoom(17);


}

function facilityControl(){

document
.getElementById(
"pick-location"
)
.onclick=function(){


    pickingLocation=true;


    document
    .getElementById(
        "location-tip"
    )
    .style.display="block";



    enableFacilityPick();


};


const btn =
document.getElementById(
"facility-btn"
);


const modal =
document.getElementById(
"facility-modal"
);


const close =
document.getElementById(
"close-facility"
);



btn.onclick=function(){

modal.style.display="block";

loadFacilityTable();

};



close.onclick=function(){

modal.style.display="none";

};


document

.getElementById(
"facility-search"
)

.oninput=function(){

loadFacilityTable();

};



document

.getElementById(
"facility-filter"
)

.onchange=function(){

loadFacilityTable();

};



document

.getElementById(
"add-facility-btn"
)

.onclick=function(){

openFacilityEdit();

};



document

.getElementById(
"save-facility"
)

.onclick=function(){

saveFacility();

};

document

.getElementById(
"close-edit-facility"
)

.onclick=function(){


    document

    .getElementById(
    "facility-edit-modal"
    )

    .style.display="none";


};

if(tempMarker){

    tempMarker.setMap(null);

}


}

function loadFacilityTable(){


fetch(
"/api/admin/facilities"
)


.then(
r=>r.json()
)


.then(

data=>{


let keyword =
document.getElementById(
"facility-search"
).value;


let category =
document.getElementById(
"facility-filter"
).value;



data=data.filter(

f=>{


return (

f.name.includes(keyword)

&&

(
category===""
||
f.category===category
)

);


}

);



let html=`


<table class="facility-table">


<tr>

<th>
名称
</th>

<th>
类别
</th>

<th>
地址
</th>

<th>
来源
</th>

<th>
操作
</th>


</tr>



`;



data.forEach(

f=>{


html+=`


<tr>


<td>
${f.name}
</td>


<td>
${f.category}
</td>


<td>
${f.address || ""}
</td>


<td>
${f.source || ""}
</td>



<td>


<button
onclick="
editFacility(${JSON.stringify(f)})
"
>
编辑
</button>



<button
class="delete-btn"
onclick="
deleteFacility(${f.id})
"
>
删除
</button>


</td>



</tr>


`;



}

);



html+="</table>";



document

.getElementById(
"facility-table"
)

.innerHTML=html;



}

);


}

// =========================
// 删除设施
// =========================


function deleteFacility(id){



    if(
        !confirm(
            "确定删除这个设施吗？"
        )
    ){

        return;

    }




    fetch(

        `/api/admin/facility/${id}`,

        {

            method:
            "DELETE"

        }

    )


    .then(

        r=>r.json()

    )


    .then(

        data=>{


            alert(
                data.message
            );


            //重新加载表格

            loadFacilityTable();


            //重新加载地图

            loadFacilities();



        }

    );


}

let editingFacility=null;



function openFacilityEdit(){


editingFacility=null;


document.getElementById(
"facility-edit-modal"
)
.style.display="block";


}



function editFacility(f){


editingFacility=f;


document.getElementById(
"facility-edit-modal"
)
.style.display="block";


document.getElementById(
"facility-name"
)
.value=f.name;


document.getElementById(
"facility-category"
)
.value=f.category;


document.getElementById(
"facility-address"
)
.value=f.address||"";


document.getElementById(
"facility-description"
)
.value=f.description||"";


}



function saveFacility(){



let data={


name:
document.getElementById(
"facility-name"
).value,


category:
document.getElementById(
"facility-category"
).value,


address:
document.getElementById(
"facility-address"
).value,


description:
document.getElementById(
"facility-description"
).value,


longitude:
selectedFacilityPoint.longitude,


latitude:
selectedFacilityPoint.latitude


};



let url;
let method;



if(editingFacility){


url=
`/api/admin/facility/${editingFacility.id}`;


method="PUT";


}

else{


url=
"/api/admin/facility";


method="POST";


}



fetch(

url,

{


method:method,


headers:{


"Content-Type":
"application/json"


},


body:
JSON.stringify(data)


}

)

.then(

r=>r.json()

)

.then(

()=>{


alert(
"保存成功"
);


document.getElementById(
"facility-edit-modal"
)
.style.display="none";


loadFacilityTable();


loadFacilities();


}

);



}

function enableFacilityPick(){


    // 隐藏编辑窗口
    document
    .getElementById(
        "facility-edit-modal"
    )
    .style.display="none";



    alert(
        "请在地图上点击选择位置"
    );



    // 移除之前事件

    map.off(
        "click"
    );



    map.on(

        "click",

        function(e){


            let lng =
            e.lnglat.getLng();



            let lat =
            e.lnglat.getLat();

                pickingLocation=false;


    document
    .getElementById(
        "location-tip"
    )
    .style.display="none";

            selectedFacilityPoint={

                longitude:lng,

                latitude:lat

            };




            document
            .getElementById(
                "facility-lng"
            )
            .innerHTML =
            lng.toFixed(6);




            document
            .getElementById(
                "facility-lat"
            )
            .innerHTML =
            lat.toFixed(6);




            if(tempMarker){

                tempMarker.setMap(null);

            }



            tempMarker =
            new AMap.Marker({

                position:[
                    lng,
                    lat
                ],

                map:map

            });




            //重新打开编辑窗口

            document
            .getElementById(
                "facility-edit-modal"
            )
            .style.display="block";



        }

    );


}

function feedbackControl(){

    const detailClose =
document.getElementById(
"close-feedback-detail"
);



detailClose.onclick=function(){

document
.getElementById(
"feedback-detail-modal"
)
.style.display="none";


};


let btn =
document.getElementById(
"feedback-btn"
);



let modal =
document.getElementById(
"feedback-modal"
);



let close =
document.getElementById(
"close-feedback"
);



btn.onclick=function(){


modal.style.display="block";


loadFeedbackTable();


};



close.onclick=function(){


modal.style.display="none";


};



document

.getElementById(
"feedback-search"
)

.oninput=function(){

loadFeedbackTable();

};



document

.getElementById(
"feedback-status-filter"
)

.onchange=function(){

loadFeedbackTable();

};



}

function loadFeedbackTable(){


fetch(
"/api/admin/feedbacks"
)


.then(
r=>r.json()
)


.then(

data=>{


feedbackData=data;



let keyword =
document.getElementById(
"feedback-search"
).value;



let status =
document.getElementById(
"feedback-status-filter"
).value;



data=data.filter(

f=>{


return (

f.description.includes(keyword)

&&

(
status===""

||

f.status===status

)

);


}

);




let html=`


<table class="feedback-table">


<tr>

<th>
类别
</th>

<th>
描述
</th>

<th>
地址
</th>

<th>
状态
</th>

<th>
操作
</th>


</tr>



`;




data.forEach(

f=>{


html+=`


<tr>


<td>

${f.category}

</td>


<td>

${f.description}

</td>


<td>

${f.address || ""}

</td>


<td>

${f.status}

</td>


<td>


<button

onclick="

showFeedback(${f.id})

"

>

查看

</button>


</td>


</tr>



`;



}

);



html+="</table>";



document

.getElementById(
"feedback-table"
)

.innerHTML=html;



}

);


}

function showFeedback(id){

let f =
feedbackData.find(

x=>x.id===id

);

locateFeedback(f);

document

.getElementById(
"feedback-detail-modal"
)

.style.display="block";




document

.getElementById(
"feedback-detail-content"
)

.innerHTML=`


<p>
类别：
${f.category}
</p>


<p>
反馈对象：
${f.respondent_type}
</p>


<p>
描述：
${f.description}
</p>


<p>
地址：
${f.address || ""}
</p>

${
    f.image_path

    ?

    `

    <p>
    图片：
    </p>


    <div class="feedback-photo">

        <img

        src="${f.image_path}"

        loading="lazy"

        >

    </div>

    `

    :

    `

    <p>
    图片：
    暂无
    </p>

    `

}

<label>

状态：

</label>



<select id="edit-status">


<option>
未处理
</option>


<option>
处理中
</option>


<option>
已处理
</option>


</select>



<br><br>



<button

onclick="updateFeedback(${f.id})"

>

保存

</button>



<button

onclick="deleteFeedback(${f.id})"

>

删除

</button>


`;



document

.getElementById(
"edit-status"
)

.value=f.status;


}

function updateFeedback(id){



let status =
document

.getElementById(
"edit-status"
)

.value;



fetch(

`/api/admin/feedback/${id}`,

{


method:"PUT",


headers:{


"Content-Type":

"application/json"


},


body:

JSON.stringify({

status:status

})


}

)

.then(

()=>{


alert(
"更新成功"
);


loadFeedbackTable();


}

);



}

function deleteFeedback(id){



if(
!confirm(
"确定删除?"
)

)

return;



fetch(

`/api/admin/feedback/${id}`,

{


method:"DELETE"


}

)

.then(

()=>{


alert(
"删除成功"
);


document

.getElementById(
"feedback-detail-modal"
)

.style.display="none";


loadFeedbackTable();


loadFeedback();


}

);



}

document.addEventListener(
    "DOMContentLoaded",
    function(){


        const closeDetailBtn =
        document.getElementById(
            "close-feedback-detail"
        );


        if(closeDetailBtn){


            closeDetailBtn.onclick=function(){


                document
                .getElementById(
                    "feedback-detail-modal"
                )
                .style.display="none";


            };


        }


    }
);

function locateFeedback(f){


if(!f){
    return;
}



let position = [

    f.longitude,

    f.latitude

];



// 地图移动

map.setCenter(
    position
);


map.setZoom(
    17
);



// 创建临时高亮点

if(window.feedbackHighlight){


    window.feedbackHighlight.setMap(
        null
    );

}



window.feedbackHighlight =

new AMap.Marker({


    position:position,


    map:map,


    icon:

    new AMap.Icon({


        image:

        "https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png",


        size:

        new AMap.Size(
            32,
            32
        ),


        imageSize:

        new AMap.Size(
            32,
            32
        )


    })


});



let info =

new AMap.InfoWindow({


content:


`

<div>

<h3>
${f.category}
</h3>


<p>
${f.description}
</p>


<p>
状态：
${f.status}
</p>


</div>

`


});



info.open(

map,

position

);


}

function createFeedbackCategoryChart(data){


new Chart(

document
.getElementById(
"feedback-category-chart"
),

{


type:"bar",


data:{


labels:Object.keys(data),


datasets:[{


label:"反馈数量",


data:Object.values(data)


}]


}


}


);


}


function createFeedbackStatusChart(data){


new Chart(

document.getElementById(
"feedback-status-chart"
),

{

type:"pie",

data:{


labels:Object.keys(data),


datasets:[{

label:"处理状态",

data:Object.values(data)

}]


}


}

);


}

function feedbackMapStatusControl(){


    const statusSelect =
    document.getElementById(
        "feedback-map-status"
    );


    if(!statusSelect){

        return;

    }


    statusSelect.onchange =
    function(){


        selectedFeedbackStatus =
        this.value;


        applyFeedbackFilters();


    };


}

function updateHeatmap(){


    if(
        !heatmap
        ||
        !Array.isArray(feedbackData)
    ){

        return;

    }


    const heatData = feedbackData

    .filter(

        item =>
        Number.isFinite(
            Number(item.longitude)
        )
        &&
        Number.isFinite(
            Number(item.latitude)
        )

    )

    .map(

        item => ({

            lng:
            Number(item.longitude),

            lat:
            Number(item.latitude),

            count: 1

        })

    );


    heatmap.setDataSet({

        data:
        heatData,

        // 目前只有少量反馈，设为较低值更容易看见
        max: 2

    });


}

function heatmapControl(){


    const checkbox =
    document.getElementById(
        "heatmap-toggle"
    );


    checkbox.onchange=function(){


        if(
            this.checked
        ){

            updateHeatmap();

            heatmap.show();

        }

        else{

            heatmap.hide();

        }


    };


}

function facilityCoverageControl(){


const checkbox =

document.getElementById(
"facility-coverage-toggle"
);



checkbox.onchange=function(){


facilityCoverageVisible =

this.checked;



updateFacilityCoverage();


};


}

function updateFacilityCoverage(){



Object.keys(

facilityCoverageCircles

)

.forEach(

category=>{


let circles =

facilityCoverageCircles[category];



circles.forEach(

circle=>{


// 先全部隐藏

circle.setMap(null);



}

);



}

);




// 没打开直接结束

if(
!facilityCoverageVisible
){

return;

}




let circles =

facilityCoverageCircles[
selectedCoverageCategory
];



if(!circles){

return;

}




circles.forEach(

circle=>{


circle.setRadius(
selectedCoverageRadius
);


circle.setMap(map);



}

);



}

function coverageAnalysisControl(){


const categorySelect =

document.getElementById(
"coverage-category"
);



const radiusInput =

document.getElementById(
"coverage-radius"
);



categorySelect.onchange=function(){


selectedCoverageCategory =
this.value;



updateFacilityCoverage();


};



radiusInput.onchange=function(){


selectedCoverageRadius =
Number(
this.value
);



updateFacilityCoverage();


};


}