const LIVE_API_URL = 'https://api.freeapi.app/api/v1/public/youtube/videos?page=1&limit=50';
const videoContainerElement = document.getElementById('video-container');
const searchBtnElement = document.getElementById('search-submit');
const searchInputElement = document.getElementById('search-input');
let videosCache = [];

document.addEventListener('DOMContentLoaded', async function () {
    await loadVideos();
    searchBtnElement.addEventListener('click', handleSearchClick);
    searchInputElement.addEventListener('keyup', handleSearchKeyUp);
});

async function loadVideos() {
    renderMessage('Fetching Videos...');
    try {
        const apiData = await fetchVideos(LIVE_API_URL);
        if (apiData.success === true) {
            videosCache = apiData.data.data;
            renderVideos(videosCache);
        } else {
            showAlert(apiData.message);
        }
    } catch (error) {
        showAlert(error.message);
    }
}

function renderVideos(videos) {
    const htmlString = generateHTML(videos);
    renderIntoDOM(htmlString);
}

function handleSearchClick() {
    const query = searchInputElement.value.trim();
    if (!query) return;

    const filteredVideos = filterVideos(query, videosCache);
    renderVideos(filteredVideos);
}


function handleSearchKeyUp() {
    const query = searchInputElement.value.trim();
    if (!query) {
        renderVideos(videosCache);
        return;
    }
}


async function fetchVideos(url) {
    const options = {
        method: 'GET',
        headers: { accept: 'application/json' }
    };
    const response = await fetch(url, options);
    if (!response.ok) {
        showAlert('Error in Fetching data.');
    }
    return response.json();
}


function filterVideos(query, videos) {
    const lowerCaseQuery = query.toLowerCase();

    return videos.filter(video => {
        const title = video.items.snippet.title.toLowerCase();
        const videoTags = video.items.snippet.tags || [];
        const matchesTitle = title.includes(lowerCaseQuery);
        const matchesTags = videoTags.some(tag => tag.toLowerCase().includes(lowerCaseQuery));
        return matchesTitle || matchesTags;
    });
}


function generateHTML(videos) {
    let html = '';
    videos.forEach(video => {
        const { id } = video.items;
        const { thumbnails, title, channelTitle } = video.items.snippet;
        const { viewCount, likeCount, commentCount } = video.items.statistics;

        html += `
      <div class="video-card">
        <a href="https://www.youtube.com/watch?v=${id}" target="_blank">
          <div class="video-info">
            <img
              src="${thumbnails.medium.url}"
              alt="${title}"
              class="thumbnail"
            />
            <h2 class="title">${title}</h2>
            <h5 class="channelTitle">By ${channelTitle}</h5>
            <div class="stats">
              <span>Views-${viewCount}</span>
              <span>Likes-${likeCount}</span>
              <span>Comments-${commentCount}</span>
            </div>
          </div>
        </a>
      </div>
    `;
    });
    return html;
}


function renderIntoDOM(htmlString) {
    videoContainerElement.innerHTML = htmlString;
}


function showAlert(message) {
    alert(message);
}


function renderMessage(message) {
    renderIntoDOM(message);
}
