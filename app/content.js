function getTimeInterval(callback) {
  setInterval(() => {
    let m1 = Number($($('.time-sub')[0]).text());
    let m2 = Number($($('.time-sub')[1]).text());
    let s1 = Number($($('.time-sub')[2]).text());
    let s2 = Number($($('.time-sub')[3]).text());

    if (m1 === 0 && m2 === 0 && s1 === 0 && s2 === 1) {
      setTimeout(() => {
        callback();
      }, 2000);
    }
  }, 1000);
}

function getToken() {
  return localStorage.getItem('coem.token');
}

async function getPageData(page) {
  let response = await fetch(
    `https://colorwiz.shop/win/guesses?category=B&p=${page}&p_size=${page}`,
    {
      headers: {
        accept: 'application/json, text/plain, */*',
        authorization: `Token ${getToken()}`,
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
      },
      referrer: 'https://colorwiz.shop/',
      referrerPolicy: 'strict-origin-when-cross-origin',
      body: null,
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
    },
  );
  let json = await response.json();
  return json;
}

function getSugestion(sugestionData) {
  return sugestionData.is_violet
    ? 'await'
    : sugestionData.is_red
    ? 'red'
    : sugestionData.is_green
    ? 'green'
    : null;
}

function getResult(lastData, sugestion) {
  let lastColour = lastData.is_red
    ? 'red'
    : lastData.is_green
    ? 'green'
    : lastData.is_violet
    ? 'violet'
    : null;
  console.log('ultima cor:', lastColour);
  console.log('sugestão:', sugestion);
  return sugestion === lastColour;
}

async function getNewSugestion() {
  let sugestionData = await getPageData(10);
  let sugestion = getSugestion(
    sugestionData.queryset[sugestionData.queryset.length - 1],
  );
  return sugestion;
}

async function getResultSugestion(sugestion) {
  let lastData = await getPageData(1);
  let isWin = getResult(
    lastData.queryset[lastData.queryset.length - 1],
    sugestion,
  );
  return isWin;
}

async function start() {
  let sugestion = await getNewSugestion();

  console.log(sugestion);

  getTimeInterval(async () => {
    let resultSugestion = await getResultSugestion(sugestion);
    console.log('Acertou?', resultSugestion);
    sugestion = await getNewSugestion();
    console.log('Proxima sugestão:', sugestion);
  });
}

start();
