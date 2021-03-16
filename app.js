const moment = require("moment");
const { getSunrise, getSunset } = require("sunrise-sunset-js");

const Model = (() => {
  const getData = () => {
    return new Promise((resolve, reject) => {
      const onSuccess = (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        sunset = getSunset(lat, lng);
        sunrise = getSunrise(lat, lng);

        hr = sunset.getHours();
        min = sunset.getMinutes();
        mSec = sunset.getTime();
        const data = { hr, min, mSec };
        resolve(data);
      };

      const onError = () => {
        console.log("Something went wrong!");
        reject();
      };

      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    });
  };

  const currentTime = () => {
    date = new Date();
    hr = date.getHours();
    min = date.getMinutes();
    mSec = date.getTime();
    return {
      hr,
      min,
      mSec,
    };
  };

  const currentTimeValues = ({ hr, min, mSec } = currentTime());

  // js automatically displays 01, 02, 03...numbers like 1,2,3...
  const timeFormat = (...time) => {
    let timeArr = [];
    time.forEach((element) => {
      if (element < 10) {
        timeArr.push("0" + element);
      } else {
        timeArr.push(element);
      }
    });
    return timeArr;
  };

  return {
    getData,
    currentTimeValues,
    timeFormat,
  };
})();
const View = (() => {
  const displayTime = (el, hr, min) => {
    const time = document.createElement("p");
    time.innerHTML = `${hr}:${min}`;
    el.appendChild(time);
  };

  return { displayTime };
})();

const Controller = ((Model, View) => {
  const sunsetItems = document.querySelectorAll(".sunsetCountdown-format h4");
  const sunsetCountdownDiv = document.getElementById("sunsetCountdown");
  const sunsetTimeToday = document.getElementById("sunsetTimeToday");

  const sunsetFunc = () => {
    Model.getData()
      .then((data) => {
        const formattedSunset = ([hrFormat, minFormat] = Model.timeFormat(
          data.hr,
          data.min
        ));
        View.displayTime(
          sunsetTimeToday,
          formattedSunset[0],
          formattedSunset[1]
        );
        return data;
      })
      .then((data) => {
        cloneObj(data);
      });
  };
  sunsetFunc();

  let clone;
  const cloneObj = (obj) => {
    clone = { ...obj };
  };

  const getRemainingTime = () => {
    const currentMs = new Date().getTime();
    const timeDiff = clone.mSec - currentMs;

    if (timeDiff < 0) {
      clearInterval(countdown);
      sunsetCountdownDiv.innerHTML = `<h1>The sun has set!</h1>`;
    }

    // values in ms
    const oneHour = 60 * 60 * 1000;
    const oneMinute = 60 * 1000;

    // calculate needed values
    const hoursLeft = Math.floor(timeDiff / oneHour);
    const minutesLeft = Math.floor((timeDiff % oneHour) / oneMinute);
    const secondsLeft = Math.floor((timeDiff % oneMinute) / 1000);

    const countdownValues = [hoursLeft, minutesLeft, secondsLeft];

    const formatValue = (value) => {
      if (value < 10) {
        format = "0" + value;
        return format;
      } else {
        return value;
      }
    };

    sunsetItems.forEach((item, index) => {
      item.innerHTML = formatValue(countdownValues[index]);
    });
  };

  const countdown = setInterval(getRemainingTime, 1000);
})(Model, View);
