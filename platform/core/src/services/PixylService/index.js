export function getPixylLesions(studyUUID) {
  return window
    .fetch('http://localhost/laguiole/analysis/' + studyUUID)
    .then(res => handleResponse(res));
}

function handleResponse(response) {
  return response.text().then(text => {
    let data = undefined;
    try {
      data = text && JSON.parse(text);
    } catch (e) {
      data = test;
    }
    if (!response.ok) {
      const error = data || response.statusText;
      return Promise.reject(error);
    }
    return data;
  });
}
