let map;
let geolocation;

let userMarker;
let selectedMarker;

let selectedPosition = null;

let autoComplete;
let placeSearch;

let feedbackPanel;


// 页面加载
window.onload = function () {

    initMap();

};


// 初始化地图
function initMap() {


    // =========================
    // 初始化高德地图
    // =========================

    map = new AMap.Map("map", {

        zoom: 13,

        center: [
            113.900407,
            29.724419
        ],

        viewMode: "2D"

    });



    // =========================
    // 定位插件
    // =========================

    geolocation = new AMap.Geolocation({

        enableHighAccuracy:true,

        timeout:10000,

        zoomToAccuracy:true,

        position:"RB",

        offset:[10,20]

    });


    map.addControl(
        geolocation
    );



    // =========================
    // 搜索插件
    // =========================

    autoComplete = new AMap.AutoComplete({

        input:"search-input",

        city:"赤壁市"

    });



    placeSearch = new AMap.PlaceSearch({

        city:"赤壁市",

        map:map

    });



    // =========================
    // 按钮绑定
    // =========================


    document
    .getElementById("location-btn")
    .onclick =
    getCurrentLocation;



    document
    .getElementById("search-btn")
    .onclick =
    openSearchPanel;



    document
    .getElementById("close-search-btn")
    .onclick =
    closeSearchPanel;



    document
    .getElementById("feedback-btn")
    .onclick =
    openFeedback;



    document
    .getElementById("close-feedback")
    .onclick =
    closeFeedback;



    document
    .getElementById("submit-feedback")
    .onclick =
    submitFeedback;



    // =========================
    // 地图点击选择位置
    // =========================

    map.on(
        "click",
        function(e){

            getAddress(
                e.lnglat,
                "地图选择"
            );

        }
    );



    // =========================
    // 搜索选择
    // =========================

    autoComplete.on(
        "select",
        function(e){


            placeSearch.search(
                e.poi.name,

                function(
                    status,
                    result
                ){


                    if(
                        status==="complete"
                        &&
                        result.poiList.pois.length>0
                    ){


                        let poi =
                        result.poiList.pois[0];


                        map.setZoomAndCenter(
                            17,
                            poi.location
                        );


                        setSelectedLocation(

                            poi.location,

                            "地点搜索",

                            poi.name

                        );


                        closeSearchPanel();


                    }


                }

            );


        }
    );


    console.log(
        "Citizen system loaded"
    );


}



// =========================
// GPS定位
// =========================

function getCurrentLocation(){


    geolocation.getCurrentPosition(

        function(
            status,
            result
        ){


            if(status==="complete"){


                let position =
                result.position;



                if(!userMarker){


                    userMarker =
                    new AMap.Marker({

                        map:map,

                        position:position,

                        title:"我的位置",

                        label:{

                            content:"我的位置",

                            direction:"top"

                        }

                    });



                }else{


                    userMarker.setPosition(
                        position
                    );


                }



                map.setZoomAndCenter(

                    17,

                    position

                );


                getAddress(

                    position,

                    "自动定位"

                );


            }

            else{


                alert(
                    "定位失败，请手动选择位置"
                );


            }


        }

    );


}



// =========================
// 保存反馈位置
// =========================

function setSelectedLocation(

    position,

    method,

    address=""

){


    selectedPosition = {


        lng:
        position.lng,


        lat:
        position.lat,


        address:
        address,


        method:
        method


    };



    if(!selectedMarker){


        selectedMarker =
        new AMap.Marker({


            map:map,


            position:position,


            title:"反馈位置",


            label:{


                content:"反馈位置",


                direction:"top"


            }


        });



    }else{


        selectedMarker.setPosition(
            position
        );


    }



    updateLocationDisplay();



    console.log(
        "Feedback location:",
        selectedPosition
    );


}



// =========================
// 地址反查
// =========================

function getAddress(

    position,

    method

){


    let geocoder =
    new AMap.Geocoder();



    geocoder.getAddress(

        position,

        function(
            status,
            result
        ){


            if(

                status==="complete"

                &&

                result.regeocode

            ){


                setSelectedLocation(

                    position,

                    method,

                    result.regeocode.formattedAddress

                );


            }

            else{


                setSelectedLocation(

                    position,

                    method,

                    "未知位置"

                );


            }


        }

    );


}



// =========================
// 显示位置
// =========================

function updateLocationDisplay(){


    let box =
    document.getElementById(
        "selected-location"
    );



    if(
        box
        &&
        selectedPosition
    ){


        box.innerHTML = `

        📍 当前反馈地点：

        <br>

        ${selectedPosition.address}


        <br><br>


        经纬度：

        ${selectedPosition.lng.toFixed(6)}

        ,

        ${selectedPosition.lat.toFixed(6)}

        `;


    }


}



// =========================
// 搜索窗口
// =========================

function openSearchPanel(){


    document
    .getElementById("search-panel")
    .classList
    .remove("hidden");


}



function closeSearchPanel(){


    document
    .getElementById("search-panel")
    .classList
    .add("hidden");


}



// =========================
// 反馈窗口
// =========================

function openFeedback(){


    feedbackPanel =
    document.getElementById(
        "feedback-panel"
    );


    feedbackPanel
    .classList
    .remove("hidden");


}



function closeFeedback(){


    document
    .getElementById("feedback-panel")
    .classList
    .add("hidden");


}



// =========================
// 提交反馈
// =========================

async function submitFeedback(){



    if(!selectedPosition){


        alert(
            "请先选择反馈位置"
        );


        return;


    }




    let formData = new FormData();


formData.append(
    "type",
    document.getElementById(
        "feedback-type"
    ).value
);

formData.append(
    "respondent_type",
    document.getElementById(
        "respondent-type"
    ).value
);

formData.append(
    "category",
    document.getElementById(
        "category"
    ).value
);


formData.append(
    "description",
    document.getElementById(
        "description"
    ).value
);


formData.append(
    "longitude",
    selectedPosition.lng
);


formData.append(
    "latitude",
    selectedPosition.lat
);


formData.append(
    "address",
    selectedPosition.address
);


formData.append(
    "location_method",
    selectedPosition.method
);


formData.append(
    "contact",
    document.getElementById(
        "contact"
    ).value
);

let photo =
document.getElementById(
    "photo"
).files[0];



if(photo){


    console.log(
        "原始图片:",
        (
            photo.size / 1024 / 1024
        ).toFixed(2),
        "MB"
    );



    let compressedPhoto =
    await compressImage(
        photo
    );



    console.log(
        "压缩后图片:",
        (
            compressedPhoto.size / 1024 / 1024
        ).toFixed(2),
        "MB"
    );



    formData.append(

        "photo",

        compressedPhoto

    );

}

    console.log(
    [...formData.entries()]
);

    fetch(

        "/api/feedback",

        {


            method:"POST",


            body:
formData


        }


    )

    .then(

        response=>
        response.json()

    )


    .then(

        result=>{


            console.log(
                result
            );


            alert(
                "反馈提交成功！"
            );


            clearFeedbackForm();


        }

    )


    .catch(

        error=>{


            console.error(
                error
            );


            alert(
                "提交失败"
            );


        }

    );


}



// =========================
// 清空表单
// =========================

function clearFeedbackForm(){



    document
    .getElementById("description")
    .value="";



    document
    .getElementById("contact")
    .value="";



    document
    .getElementById("photo")
    .value="";



    selectedPosition=null;



    if(selectedMarker){


        map.remove(
            selectedMarker
        );


        selectedMarker=null;


    }



    document
    .getElementById("selected-location")
    .innerHTML =
    "📍 尚未选择反馈位置";


}

// =================================
// 图片压缩函数
// =================================

function compressImage(
    file,
    maxWidth = 1280,
    quality = 0.7
){

    return new Promise(
        (resolve)=>{


        const img = new Image();


        const reader =
        new FileReader();



        reader.onload = function(e){

            img.src =
            e.target.result;

        };



        img.onload = function(){


            let canvas =
            document.createElement(
                "canvas"
            );



            let scale =
            Math.min(

                maxWidth / img.width,

                1

            );



            canvas.width =
            img.width * scale;



            canvas.height =
            img.height * scale;



            let ctx =
            canvas.getContext(
                "2d"
            );



            ctx.drawImage(

                img,

                0,

                0,

                canvas.width,

                canvas.height

            );



            canvas.toBlob(


                function(blob){


                    let newFile =
                    new File(

                        [blob],

                        file.name.replace(
    /\.[^/.]+$/,
    ".jpg"
),

                        {

                            type:
                            "image/jpeg"

                        }

                    );


                    resolve(
                        newFile
                    );


                },


                "image/jpeg",

                quality

            );

        };



        reader.readAsDataURL(file);


    });

}