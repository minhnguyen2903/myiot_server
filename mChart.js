const labels = [];
const data = [];

const renderChart = (labels, data) => {
  const ctx = document.getElementById('myChart');
  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Gas Sensor',
        data: data,
        backgroundColor: 'blue',
        borderColor: 'blue',
        borderWidth: 1,
        tension: 0.3
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,

        },
        x: {
          beginAtZero: true,

          ticks: {
            stepSize: 1,
            color: 'red'
          }
        }
      },
      plugins: {
        tooltip
      }
    }
  });
}

fetch('/view').then((response) => response.json()).then((json) => {
  json.forEach((element, index) => {
    if (index < 50) {
      labels.push(index);
      data.push(element.value);
    }
  });
  renderChart(labels, data);
}).catch(err => {
  console.log(err)
});
fetch('/current').then((response) => response.json()).then((json) => {
  console.log(json)
  document.querySelector(".gas-sensor").innerHTML = Math.floor((json.value/4095)*100) + "%";

  const lastUpdate = Math.floor((Date.now() - json.createdAt)/1000);
  if(lastUpdate > 60) {
    document.querySelector(".last-update").innerHTML = Math.floor(lastUpdate/60) + "<span class='fw-normal' style='font-size: 0.5em'> minutes ago</span>";
  } else {
    document.querySelector(".last-update").innerHTML = Math.floor(lastUpdate) + "<span class='fw-normal' style='font-size: 0.5em'> seconds ago</span>";
  }
//     document.querySelector(".last-update").innerHTML = lastUpdate;
}).catch(err => {
  console.log(err)
});