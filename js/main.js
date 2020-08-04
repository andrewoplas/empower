/******************** Variables ********************/

// Elements
const chartElement = $('#line-stack-chart');
const context = document.getElementById('line-stack-chart').getContext('2d');

// Fixed values
const socialSecurity = 1200;
const healthcare = 960;
const otherAssets = 100000;

// Inputs
const age = 27;

/******************** Chart Configurations ********************/
const lineChartData = {
  // labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    {
      label: 'Other Assets',
      data: [],
      backgroundColor: getGradientColor('#00bae9', '#B4EEFC'),
      borderWidth: 0,
      borderColor: 'transparent',
    },
    {
      label: 'Social Security',
      data: [],
      backgroundColor: getGradientColor('#ffc200', '#FFEEB8'),
      borderWidth: 0,
      borderColor: 'transparent',
    },
    {
      label: 'Estimated Balance',
      data: [],
      backgroundColor: getGradientColor('#00c200', '#C0FBC0'),
      borderWidth: 0,
      borderColor: 'transparent',
    },
  ],
};

const lineChartOptions = {
  type: 'line',
  data: lineChartData, // Must be overwritten
  options: {
    responsive: true,
    elements: {
      point: {
        radius: 1.25,
      },
    },
    legend: {
      display: false,
    },
    tooltips: {
      mode: 'index',
      intersect: true,
      itemSort: function (a, b) {
        return b.datasetIndex - a.datasetIndex;
      },
    },

    hover: {
      mode: 'index',
    },
    scales: {
      yAxes: [
        {
          stacked: true,
          gridLines: { display: false },
          ticks: { display: false },
        },
      ],
      xAxes: [
        {
          gridLines: { display: false },
          type: 'time',
          time: {
            unit: 'year',
            stepSize: 10,
            tooltipFormat: 'YYYY',
          },
          distribution: 'linear',
        },
      ],
    },
  },
};

$(function () {
  // Calculate data
  calculateData();

  // Update chart options
  lineChartOptions.data = lineChartData;

  // Initialize line chart
  window.lineChart = new Chart(chartElement, lineChartOptions);

  // Initialize score chart
  initializeScore();

  // Initialize sliders
  initializeSliders();

  $('#income').on('keyup', function () {
    updateChart();
  });
});

/******************** Functions ********************/
function initializeSliders() {
  $('input[type="range"]').rangeslider({
    polyfill: false,

    onInit: function () {
      const slider = $(this.$element);
      slider.parents('.slider-container').find('b.value').text(slider.val());
    },
    onSlide: function (position, value) {
      const slider = $(this.$element);
      slider.parents('.slider-container').find('b.value').text(value);
    },
    onSlideEnd: function (position, value) {
      updateChart();
    },
  });
}

function initializeScore() {
  const Gradient =
    '<defs><linearGradient id="gradient" x1="50%" y1="-20%" x2="0%" y2="0%" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffc200"/><stop offset="50%" stop-color="#63E263"/><stop offset="100%" stop-color="#00c200"/></linearGradient></defs>';
  const bar = new ProgressBar.Circle('#score-chart', {
    color: 'url(#gradient)',
    // This has to be the same size as the maximum width to
    // prevent clipping
    strokeWidth: 6,
    trailColor: '#eee',
    trailWidth: 6,
    easing: 'easeInOut',
    duration: 1400,
    text: {
      autoStyleContainer: false,
    },
    // Set default step function for all animate calls
    step: function (state, circle) {
      const value = Math.round(circle.value() * 100);
      if (value === 0) {
        circle.setText('');
      } else {
        const text =
          '<span class="score-label">Your score</span><span class="score-value">' +
          value +
          '</span>';
        circle.setText(text);
      }
    },
    svgStyle: null,
  });
  bar.svg.insertAdjacentHTML('afterbegin', Gradient);
  bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
  bar.text.style.fontSize = '2rem';
  bar.animate(0.8); // Number from 0.0 to 1.0
}

function updateChart() {
  calculateData();
  window.lineChart.update();
}

function getGradientColor(color1, color2) {
  const gradientStroke = context.createLinearGradient(500, 0, 100, 0);
  gradientStroke.addColorStop(0, color1);
  gradientStroke.addColorStop(1, color2);
  return gradientStroke;
}

function calculateData() {
  const income = $('input#income').val();
  const contribution = $('input#contribution').val() / 100;
  const retirementAge = $('input#retirementAge').val();
  const employerMatch = $('input#employerMatch').val() / 100;
  const rateOfReturn = $('input#rateOfReturn').val() / 100;
  const lifeExpectancy = $('input#lifeExpectancy').val();

  const yearsDifference = retirementAge - age;
  const estimatedBalanceData = [];
  const socialSecurityData = [];
  const otherAssetsData = [];
  const yearNow = 2020;

  const getDataWithYear = function (year, data) {
    return {
      x: new Date(year, 1),
      y: data,
    };
  };

  for (let i = 1; i <= yearsDifference; i++) {
    // calculate estimated balance
    const estimateValue = income * contribution * i;
    const estimatedBalanceYear = estimateValue + rateOfReturn * estimateValue;
    estimatedBalanceData.push(
      getDataWithYear(yearNow + i, estimatedBalanceYear)
    );

    // calculate social security
    const socialSecurityYear = socialSecurity * 12 * i;
    socialSecurityData.push(getDataWithYear(yearNow + i, socialSecurityYear));

    // calculate otherassets
    otherAssetsData.push(getDataWithYear(yearNow + i, otherAssets));
  }

  const calculation1 =
    income * contribution * yearsDifference * (rateOfReturn + 1);
  const calculation2 =
    socialSecurity * 12 * yearsDifference -
    healthcare * 12 * yearsDifference +
    otherAssets;
  const score = calculation1 + calculation2;

  lineChartData.datasets[0].data = otherAssetsData;
  lineChartData.datasets[1].data = socialSecurityData;
  lineChartData.datasets[2].data = estimatedBalanceData;
}
