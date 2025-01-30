document.addEventListener('DOMContentLoaded', function () {
  fetchLinks();

  // 搜索功能
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');

  searchButton.addEventListener('click', function () {
    const searchTerm = searchInput.value.trim().toLowerCase();
    filterLinks(searchTerm);
  });

  searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      searchButton.click();
    }
  });

  // 其他事件监听器
  document.getElementById('link-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const linkData = Object.fromEntries(formData);

    const response = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: linkData.edit_password,
        link: {
          category: linkData.category,
          title: linkData.title,
          url: linkData.url,
          icon: linkData.icon
        }
      }),
    });

    if (response.ok) {
      alert('链接已保存');
      fetchLinks();
      this.reset();
    } else {
      const errorText = await response.text();
      alert('保存失败: ' + errorText);
    }
  });

  document.getElementById('toggle-edit').addEventListener('click', function () {
    const editForm = document.getElementById('edit-form');
    editForm.style.display = editForm.style.display === 'none' ? 'block' : 'none';
  });
});

async function fetchLinks() {
  const response = await fetch('/api/links');
  const links = await response.json();
  renderLinks(links);
}

function renderLinks(links) {
  document.querySelectorAll('.link-grid').forEach(grid => grid.innerHTML = '');
  const linksByCategory = groupBy(links, 'category');

  for (const [category, categoryLinks] of Object.entries(linksByCategory)) {
    const section = document.querySelector(`#${category} .link-grid`);
    if (section) {
      categoryLinks.forEach(link => {
        const linkCard = createLinkCard(link);
        section.appendChild(linkCard);
      });
    }
  }
}

function createLinkCard(link) {
  const div = document.createElement('div');
  div.className = 'link-card';
  div.setAttribute('href', link.url);
  div.innerHTML = `
    <i class="${link.icon}"></i>
    <h3>${link.title}</h3>
  `;
  div.addEventListener('click', function () {
    window.open(link.url, '_blank');
  });
  return div;
}

function groupBy(array, key) {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
    return result;
  }, {});
}

// 搜索功能的核心逻辑
function filterLinks(searchTerm) {
  const linkCards = document.querySelectorAll('.link-card');
  let hasVisibleLinks = false;

  linkCards.forEach(card => {
    const title = card.querySelector('h3').textContent.toLowerCase();
    if (title.includes(searchTerm)) {
      card.style.display = 'block';
      hasVisibleLinks = true;
    } else {
      card.style.display = 'none';
    }
  });

  // 如果没有匹配的链接，显示提示信息
  const noResultsMessage = document.getElementById('no-results-message');
  if (!hasVisibleLinks) {
    if (!noResultsMessage) {
      const message = document.createElement('p');
      message.id = 'no-results-message';
      message.textContent = '没有找到匹配的链接';
      document.querySelector('main').appendChild(message);
    }
  } else if (noResultsMessage) {
    noResultsMessage.remove();
  }
}
