const mapOptions = {
  center: new naver.maps.LatLng(37.3595704, 127.105399),
  zoom: 15,
  zoomControl: true,
  zoomControlOptions: {
    position: naver.maps.Position.RIGHT_CENTER,
    legendDisabled: false,
  },
  logoControl: true,
  logoControlOptions: {
    position: naver.maps.Position.LEFT_BOTTOM,
  },
};
const map = new naver.maps.Map("map", mapOptions);
const ps = new kakao.maps.services.Places();
const currentPosition = document.getElementById("current");
const searchWrap = document.getElementById("search");
const searchInput = searchWrap.querySelector("#search_input");
const searchButton = searchWrap.querySelector("#search_button");
const resetHistory = document.getElementById("history_reset");
const history = searchWrap.querySelector("#history");
const clockContainer = document.getElementById("clock");
const clockText = clockContainer.querySelector("h1");
const markerList = [];
const infoWindowList = [];
const searchErr = [];
let currentUse = true;

for (let i in data) {
  const target = data[i];
  const latlng = new naver.maps.LatLng(target.lat, target.lng);

  marker = new naver.maps.Marker({
    map: map,
    position: latlng,
    icon: {
      content: "<div class = 'marker'></div>",
      anchor: new naver.maps.Point(12, 12),
    },
  });

  const content = `<div class='infoWindow_wrap'>
        <div class='infoWindow_header'>
          <div class='infoWindow_title'>${target.title}</div>
          <div class='infoWindow_content'>${target.content}</div>
        </div>

        <div class='infoWindow_date'>${target.date}</div>
      </div>`;

  const infoWindow = new naver.maps.InfoWindow({
    content: content,
    backgroundColor: "#00ff0000",
    borderColor: "#00ff0000",
    anchorSize: new naver.maps.Size(10, 10),
    anchorColor: "rgba(0,0,0,0.5)",
  });

  markerList.push(marker);
  infoWindowList.push(infoWindow);
}

getClickHandler = (i) => {
  return () => {
    const marker = markerList[i];
    const infoWindow = infoWindowList[i];

    if (infoWindow.getMap()) {
      infoWindow.close();
    } else {
      infoWindow.open(map, marker);
    }
  };
};

clickMap = (i) => {
  return () => {
    const infoWindow = infoWindowList[i];
    infoWindow.close();
  };
};

changeColor = () => {
  currentPosition.style.backgroundColor = `rgb(${32}, ${41}, ${160})`;
  currentPosition.style.color = "white";
};

handleCurrentPosition = () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const latlng = new naver.maps.LatLng(lat, lng);

      if (currentUse) {
        marker = new naver.maps.Marker({
          map: map,
          position: latlng,
          icon: {
            content:
              '<div class="pulse" draggable="false" unselectable="on"></div>',

            anchor: new naver.maps.Point(11, 11),
          },
        });
        currentUse = false;
      }
      map.setZoom(15, false);
      map.panTo(latlng);

      changeColor();
    });
  } else {
    alert("위치정보 사용 불가능");
  }
};

placeSearchCB = (data, status, pagination) => {
  if (status === kakao.maps.services.Status.OK) {
    const target = data[0];
    const lat = target.y;
    const lng = target.x;
    const latlng = new naver.maps.LatLng(lat, lng);
    const currentHistory = document.createElement("div");

    marker = new naver.maps.Marker({
      position: latlng,
      map: map,
    });

    if (searchErr.length == 0) {
      searchErr.push(marker);
    } else {
      searchErr.push(marker);

      const preMarker = searchErr.splice(0, 1);
      preMarker[0].setMap(null);
    }

    map.setZoom(15, false);
    map.panTo(latlng);

    currentHistory.innerText += searchInput.value;
    history.insertBefore(currentHistory, history.firstChild);

    searchInput.value = "";
  } else {
    alert("검색 결과가 없습니다");
  }
};

srchKeywordEnter = (e) => {
  if (e.keyCode == 13) {
    const content = searchInput.value;
    ps.keywordSearch(content, placeSearchCB);
  }
};

srchKeywordButton = () => {
  const content = searchInput.value;
  ps.keywordSearch(content, placeSearchCB);
};

removeHistory = () => {
  let count = history.childElementCount;

  while (count--) {
    const elements = history.querySelector("div");
    elements.parentNode.removeChild(elements);
  }
};

getTime = () => {
  const date = new Date();
  const month = date.getMonth();
  const days = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  clockText.innerText = `${month + 1}월 ${days <= 9 ? `0${days}` : days}일
    ${hours <= 9 ? `0${hours}` : hours} : ${
    minutes <= 9 ? `0${minutes}` : minutes
  } : ${seconds <= 9 ? `0${seconds}` : seconds}`;
};

showClock = () => {
  getTime();
  setInterval(getTime, 1000);
};

for (var i = 0, ii = markerList.length; i < ii; i++) {
  naver.maps.Event.addListener(markerList[i], "click", getClickHandler(i));
  naver.maps.Event.addListener(map, "click", clickMap(i));
}

searchInput.addEventListener("keydown", srchKeywordEnter);
searchButton.addEventListener("click", srchKeywordButton);
resetHistory.addEventListener("click", removeHistory);
currentPosition.addEventListener("click", handleCurrentPosition);

showClock();
