(async function load() {
  //selector-> .home
  //Jquery
  // const $home = $('.home');
  const $actionContainer = document.querySelector('#action');
  const $dramaContainer = document.getElementById('drama');
  const $animationContainer = document.getElementById('animation');

  const $home = document.getElementById('home');
  const $featuringContainer = document.getElementById('featuring');
  const $form = document.getElementById('form');

  const $modal = document.getElementById('modal');
  const $overlay = document.getElementById('overlay');
  const $hideModal = document.getElementById('hide-modal');

  const $modalTitle = $modal.querySelector('h1');
  const $modalImg = $modal.querySelector('img');
  const $modalDescription = $modal.querySelector('p');
  /* la forma que yo lo hice sin usar el await menos legible
  const urlMovie = 'https://yts.am/api/v2/list_movies.json?genere=action';
  const genere = prompt('Escoge el genero');
  fetch(urlMovie.replace(':genere', genere))
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      console.log(data);
    });
  *** obtener un lista con promesas
  let terrorList;
  getData('https://yts.am/api/v2/list_movies.json?genere=terror')
    .then(function(data) {
    console.log('terrorList', data);
    terrorList = data;
  });
 */
  const BASE_API_MOVIE = 'https://yts.am/api/v2/list_movies.json';

  async function getData(url) {
    const response = await fetch(url);
    const data = await response.json();
    if (data.data.movie_count > 0) {
      return data;
    }
    // si no hay pelis aqui continua
    throw new Error('No se econtro ningun resultado');
  }

  function setAttributes($element, attributes) {
    for (const attribute in attributes) {
      $element.setAttribute(attribute, attributes[attribute]);
    }
  }

  function featureTemplate(movie) {
    return ` 
      <div class="featuring">
        <div class="featuring-image">
          <img src="${movie.medium_cover_image}" alt=""/>
        </div>
        <div class="featuring-content">
          <p class="featuring-title">Pelicula Encontrada</p>
          <p class="featuring-album">${movie.title_english}</p>
        </div>
      </div> `;
  }

  function videoItemTemplate(movie, category) {
    return `
      <div class="primaryPlaylistItem" data-id="${
        movie.id
      }" data-category="${category}" >
        <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}" />
        </div>
        <h4 class="primaryPlaylistItem-title">
          ${movie.title_english}
        </h4>
      </div>`;
  }
  // console.log(videoItemTemplate('src/images/covers/midnight', 'Midnight'));

  function createTemplate(HTMLString) {
    const $html = document.implementation.createHTMLDocument();
    $html.body.innerHTML = HTMLString;
    return $html.body.children[0];
  }

  function renderMovieList(list, $container, category) {
    $container.children[0].remove();
    list.forEach((movie) => {
      const HTMLString = videoItemTemplate(movie, category);
      const movieElement = createTemplate(HTMLString);
      $container.append(movieElement);
      const imageMovie = movieElement.querySelector('img');
      imageMovie.addEventListener('load', (event) => {
        event.srcElement.classList.add('fadeIn');
      });
      addEventClick(movieElement);
    });
  }

  /**
   * Form Handler
   */

  $form.addEventListener('submit', async (event) => {
    event.preventDefault();
    $home.classList.add('search-active');
    const $loader = document.createElement('img');
    setAttributes($loader, {
      src: 'src/images/loader.gif',
      height: 50,
      width: 50,
    });
    $featuringContainer.append($loader);
    const dataForm = new FormData($form);
    try {
      const {
        data: { movies },
      } = await getData(
        `${BASE_API_MOVIE}?limit=1&query_term=${dataForm.get('name')}`
      );
      const movieHTMLString = featureTemplate(movies[0]);
      $featuringContainer.innerHTML = movieHTMLString;
    } catch (error) {
      alert(error.message);
      $loader.remove;
      $home.classList.remove('search-active');
    }
  });

  /**
   * Obteniendo datos del API
   * Peticion -> render
   */

  async function cacheExist(category) {
    const listName = `${category}List`;
    const cacheList = localStorage.getItem(listName);
    if (cacheList) {
      return JSON.parse(cacheList);
    }
    const {
      data: { movies },
    } = await getData(`${BASE_API_MOVIE}?genre=${category}`);
    localStorage.setItem(listName, JSON.stringify(movies));
    return movies;
  }

  const actionList = await cacheExist('action');
  renderMovieList(actionList, $actionContainer, 'action');

  const dramaList = await cacheExist('drama');
  renderMovieList(dramaList, $dramaContainer, 'drama');

  const animationList = await cacheExist('animation');
  renderMovieList(animationList, $animationContainer, 'animation');

  /**
   * Modal como lo obtuve yo
   * pasando la movie desdeel evento renderMovielist
   */
  const findById = (list, id) =>
    list.find((movie) => movie.id === parseInt(id, 10));

  function findMovie(id, category) {
    switch (category) {
      case 'action':
        return findById(actionList, id);
      case 'drama':
        return findById(dramaList, id);
      case 'animation':
        return findById(animationList, id);
    }
  }

  function showModal($element) {
    // $modalTitle.innerHTML = movie.title_long;
    // $modalDescription.innerHTML = movie.summary;
    // $modalImg.setAttribute('src', `${movie.medium_cover_image}`);
    $overlay.classList.add('active');
    $modal.style.animation = 'modalIn .8s forwards';
    const id = $element.dataset.id;
    const category = $element.dataset.category;
    const dataMovie = findMovie(id, category);
    $modalTitle.textContent = dataMovie.title_long;
    $modalDescription.textContent = dataMovie.summary;
    $modalImg.setAttribute('src', dataMovie.medium_cover_image);
  }

  function hideModal() {
    $overlay.classList.remove('active');
    $modal.style.animation = 'modalOut .8s forwards';
  }

  $hideModal.addEventListener('click', hideModal);

  function addEventClick($element) {
    $element.addEventListener('click', function() {
      showModal($element);
    });
    // $(`.${$element}`).on('click', function() {
    //   alert('click');
    // });
  }
})();
