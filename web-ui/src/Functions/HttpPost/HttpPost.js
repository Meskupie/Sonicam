const httpPost = (sendData, url) => {
  console.log("Posting data to backend...");
  console.log(sendData);
  fetch('http://localhost:8080/http://localhost:5000' + url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sendData),
  }).then(function (response) {
    console.log(response);
    return response.json().then((data) => {
      console.log("response data: " + data);
      console.log(data);
    });
  }).then(function (data) {
    console.log("posted data");
    console.log(data);
  });
}

export { httpPost };