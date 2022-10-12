// Fica true quando a sugestão for "await" e fica false após o primeiro acerto
var isSugestionAwait = false;

// Fica true quando o ultimo resultado vem a cor violeta e fica false quando
// aguarda 5 operações futuras
var isLastResultViolet = false;

// Numero de operações que deve ser aguardado caso venha uma cor violeta no
// ultimo resultado
var lastResultVioletCountDefault = 5;

// Variavel para ir fazendo o countdown
var lastResultVioletCount = lastResultVioletCountDefault;

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

async function getNewSugestion() {
  let sugestionData = await getPageData(10);
  let sugestion = getSugestion(
    sugestionData.queryset[sugestionData.queryset.length - 1],
  );
  if (sugestion === 'await') {
    isSugestionAwait = true;
  }
  return sugestion;
}

async function getLastResult() {
  let lastData = await getPageData(1);
  if (lastData.queryset[0].is_violet) {
    isLastResultViolet = true;
  }
  return lastData.queryset[0].is_green
    ? 'green'
    : lastData.queryset[0].is_red
    ? 'red'
    : null;
}

function alertSugestion(sugestion) {
  if (isLastResultViolet && lastResultVioletCount > 0) {
    lastResultVioletCount = lastResultVioletCount - 1;
  }

  if (isLastResultViolet && lastResultVioletCount === 0) {
    isLastResultViolet = false;
    lastResultVioletCount = lastResultVioletCountDefault;
  }

  if (isSugestionAwait && !isLastResultViolet) {
    return 'Aguarde o primeiro acerto para fazer uma nova entrada.';
  }

  if (isLastResultViolet && !isSugestionAwait) {
    return `Aguarde ${lastResultVioletCountDefault} entradas futuras para fazer uma nova entrada.`;
  }

  if (isLastResultViolet && isSugestionAwait) {
    return 'Não é momento para novas entradas.';
  }
  return sugestion;
}

function isWin(sugestion, lastResult) {
  let result = sugestion === lastResult;
  if (result) {
    isSugestionAwait = false;
  }
  return result;
}

async function start() {
  let sugestion = await getNewSugestion();

  console.log('Sugestão inicial:', sugestion);

  getTimeInterval(async () => {
    let lastResult = await getLastResult();
    console.log('Acertou?', isWin(sugestion, lastResult));
    console.log('Ultimo resultado:', lastResult);
    console.log('Ultima sugestão:', sugestion);
    sugestion = await getNewSugestion();
    console.log('Proxima sugestão:', alertSugestion(sugestion));
    console.log('______________________________________________');
  });
}

start();
