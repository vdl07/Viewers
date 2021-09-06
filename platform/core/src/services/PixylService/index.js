export function getPixylLesions(studyUUID) {
  return window
    .fetch('http://localhost/laguiole/study/' + studyUUID)
    .then(res => handleResponse(res));
}

function handleResponse(response) {
  return response.text().then(text => {
    let data = undefined;
    try {
      data = text && JSON.parse(text);
    } catch (e) {
      data = text;
    }
    if (!response.ok) {
      const error = data || response.statusText;
      return Promise.reject(error);
    }
    return data;
  });
}
