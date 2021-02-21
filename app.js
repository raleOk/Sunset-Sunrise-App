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
        data = { sunset, sunrise };
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
  // reformat
  const timeFormat = (hr, min) => {
    let hrFormat;
    let minFormat;
    if (hr < 10) {
      hr.toString();
      hrFormat = "0" + hr;
    } else {
      hrFormat = hr;
    }
    if (min < 10) {
      min.toString();
      minFormat = "0" + min;
    } else {
      minFormat = min;
    }
    return {
      hrFormat,
      minFormat,
    };
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
  const currentTime = document.getElementById("currentTime");
  const btn = document.getElementById("btn");

  const formattedCurrentTime = Model.timeFormat(
    Model.currentTimeValues.hr,
    Model.currentTimeValues.min
  );

  currentTime.innerHTML = `${formattedCurrentTime.hrFormat}:${formattedCurrentTime.minFormat}`;

  const sunsetFunc = () => {
    Model.getData()
      .then((data) => {
        hr = data.sunset.getHours();
        min = data.sunset.getMinutes();
        mSec = data.sunset.getTime();
        const timeValues = { hr, min, mSec };

        const formattedCurrentTimeValues = ({
          hrFormat,
          minFormat,
        } = Model.timeFormat(hr, min));
        View.displayTime(
          sunsetTimeToday,
          formattedCurrentTimeValues.hrFormat,
          formattedCurrentTimeValues.minFormat
        );
        return timeValues;
      })
      .then((timeValues) => {
        //the func that calculates the diff in time
        getRemainingTime(timeValues);
      });
  };
  sunsetFunc();

  // need this to run every 1 sec, setInterval works, but the func gets invoked inside of a .then()
  const getRemainingTime = (obj) => {
    const timeDiff = obj.mSec - Model.currentTimeValues.mSec;

    // values in ms
    const oneHour = 60 * 60 * 1000;
    const oneMinute = 60 * 1000;

    // calculate needed values
    const hoursLeft = Math.floor(timeDiff / oneHour);
    const minutesLeft = Math.floor((timeDiff % oneHour) / oneMinute);
    const secondsLeft = Math.floor((timeDiff % oneMinute) / 1000);

    const countdownValues = [hoursLeft, minutesLeft, secondsLeft];
    sunsetItems.forEach((item, index) => {
      item.innerHTML = countdownValues[index];
    });
    if (timeDiff < 0) {
      sunsetCountdownDiv.innerHTML = `<h1>The sun has set!</h1>`;
    }
  };
})(Model, View);
