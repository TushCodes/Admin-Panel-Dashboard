const apiUrlInput = document.querySelector('#apiUrl');
const checkApiButton = document.querySelector('#checkApi');
const apiResult = document.querySelector('#apiResult');

function renderResult(payload) {
  apiResult.textContent = JSON.stringify(payload, null, 2);
}

async function checkBackend() {
  const url = apiUrlInput.value.trim();
  apiResult.textContent = `Requesting ${url} ...`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });
    const body = await response.json();
    renderResult({
      ok: response.ok,
      status: response.status,
      body,
    });
  } catch (error) {
    renderResult({
      ok: false,
      message: 'Request failed. If the API is running, confirm CORS allows this frontend origin.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

checkApiButton.addEventListener('click', checkBackend);
