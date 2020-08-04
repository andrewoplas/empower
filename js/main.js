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
const data = {
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

const chartOptions = {
  type: 'line',
  data: data, // Must be overwritten
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
  chartOptions.data = data;

  // Initialize chart
  window.lineChart = new Chart(chartElement, chartOptions);

  // Initialize sliders
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
});

function updateChart() {
  calculateData();
  window.lineChart.update();
}

/******************** Helper Functions ********************/
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
    const estimatedBalanceYear = income * contribution * i * (rateOfReturn + 1);
    estimatedBalanceData.push(
      getDataWithYear(yearNow + i, estimatedBalanceYear)
    );

    // calculate social security
    const socialSecurityYear = socialSecurity * 12 * i;
    socialSecurityData.push(getDataWithYear(yearNow + i, socialSecurityYear));

    // calculate otherassets
    otherAssetsData.push(getDataWithYear(yearNow + i, otherAssets));
  }

  data.datasets[0].data = otherAssetsData;
  data.datasets[1].data = socialSecurityData;
  data.datasets[2].data = estimatedBalanceData;
}
